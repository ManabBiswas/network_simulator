import { useState, useRef, useCallback } from 'react'
import type {
  SimulationEvent, LadderEvent, ThroughputPoint,
  Statistics, SimulationResult, SimulationParams, Protocol
} from '../types'

interface SimulationState {
  events: SimulationEvent[]
  ladderEvents: LadderEvent[]
  throughput: ThroughputPoint[]
  statistics: Statistics
  isRunning: boolean
  isPaused: boolean
  isLoading: boolean
  error: string | null
}

const DEFAULT_STATS: Statistics = {
  total_packets: 0, total_packets_sent: 0, acks_received: 0,
  retransmissions: 0, corrupted_packets: 0, duplicate_acks: 0,
  total_time: 0, efficiency: 0
}

// FIX 4: Move playback BEFORE run so it's declared before use.
// Use a ref-based approach so it doesn't need to be in useCallback deps.

export function useSimulation() {
  const [state, setState] = useState<SimulationState>({
    events: [], ladderEvents: [], throughput: [],
    statistics: DEFAULT_STATS,
    isRunning: false, isPaused: false, isLoading: false, error: null
  })

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPausedRef = useRef(false)
  const abortRef    = useRef(false)
  const speedRef    = useRef(1.0)   // playback speed multiplier — read inside tick closure

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  // FIX 4: Declare playback as a const arrow function BEFORE run
  const playback = useCallback((data: SimulationResult) => {
    const allEvents    = data.events
    const allLadder    = data.ladder_events
    const allThroughput = data.throughput

    let idx = 0
    let liveSent = 0, liveAcks = 0, liveRetrans = 0

    function tick() {
      if (abortRef.current) return

      if (idx >= allEvents.length) {
        setState(s => ({
          ...s,
          isRunning: false,
          statistics: data.statistics,
          throughput: allThroughput,
          ladderEvents: allLadder,
        }))
        return
      }

      if (isPausedRef.current) {
        timerRef.current = setTimeout(tick, 100)
        return
      }

      const ev = allEvents[idx]

      if (ev.event_type === 'send')    liveSent++
      if (ev.event_type === 'ack')     liveAcks++
      if (ev.event_type === 'timeout') liveRetrans++

      // Match ladder events for this sim event
      const matchingLadder = allLadder.filter(le =>
        le.time === ev.time && (
          (ev.event_type === 'send'    && (le.type === 'send' || le.type === 'lost' || le.type === 'corrupted') && le.seq_num === ev.packet_num) ||
          (ev.event_type === 'ack'     && (le.type === 'ack'  || le.type === 'ack_lost') && le.seq_num === ev.packet_num) ||
          (ev.event_type === 'timeout' &&  le.type === 'timeout' && le.seq_num === ev.packet_num)
        )
      )

      const liveThroughput = allThroughput.filter(p => p.time <= ev.time)

      setState(s => ({
        ...s,
        events: [...s.events, ev],
        ladderEvents: [
          ...s.ladderEvents,
          ...matchingLadder.filter(
            ml => !s.ladderEvents.some(
              sl => sl.time === ml.time && sl.type === ml.type && sl.seq_num === ml.seq_num
            )
          ),
        ],
        throughput: liveThroughput,
        statistics: {
          ...data.statistics,
          total_packets_sent: liveSent,
          acks_received: liveAcks,
          retransmissions: liveRetrans,
          efficiency: liveSent > 0
            ? Math.round((data.statistics.total_packets / liveSent) * 1000) / 10
            : 0,
        },
      }))

      // FIX 1: Speed control — divide delay by speed multiplier
      // At speed=0.5 → delays doubled (slower). speed=2 → delays halved (faster).
      // Base range: 80–1200ms raw, then divided by speed.
      let delay = 80
      if (idx < allEvents.length - 1) {
        const diff = allEvents[idx + 1].time - ev.time
        // Scale diff: 1ms sim-time → ~1ms visual at speed=1, capped at 1200ms
        const rawDelay = Math.max(80, Math.min(1200, diff))
        delay = Math.round(rawDelay / speedRef.current)
        delay = Math.max(30, delay)  // never go below 30ms per frame
      }

      idx++
      timerRef.current = setTimeout(tick, delay)
    }

    tick()
  }, [])  // stable — reads from refs only

  const run = useCallback(async (protocol: Protocol, params: SimulationParams, speed = 1.0) => {
    clearTimer()
    abortRef.current    = false
    isPausedRef.current = false
    speedRef.current    = speed

    setState({
      events: [], ladderEvents: [], throughput: [],
      statistics: DEFAULT_STATS,
      isRunning: true, isPaused: false, isLoading: true, error: null
    })

    const apiBase = import.meta.env.VITE_API_URL ?? ''

    try {
      const res = await fetch(`${apiBase}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          total_packets:        params.totalPackets,
          transmission_delay:   params.transmissionDelay,
          ack_delay:            params.ackDelay,
          loss_rate:            params.lossRate,
          timeout_duration:     params.timeoutDuration,
          window_size:          params.windowSize,
          message:              params.message,
          simulate_corruption:  params.simulateCorruption,
          simulate_late_ack:    params.simulateLateAck,
          simulate_duplicate_ack: params.simulateDuplicateAck,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      const data: SimulationResult = await res.json()
      setState(s => ({ ...s, isLoading: false }))
      playback(data)  // FIX 4: now safe — playback declared above
    } catch (e: unknown) {
      const msg = e instanceof Error
        ? e.message
        : 'Connection failed — is the backend running on port 5000?'
      setState(s => ({ ...s, isRunning: false, isLoading: false, error: msg }))
    }
  }, [playback])

  // Live speed change — update ref so next tick picks it up immediately
  const setSpeed = useCallback((speed: number) => {
    speedRef.current = speed
  }, [])

  const pause = useCallback(() => {
    isPausedRef.current = true
    setState(s => ({ ...s, isPaused: true }))
  }, [])

  const resume = useCallback(() => {
    isPausedRef.current = false
    setState(s => ({ ...s, isPaused: false }))
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    abortRef.current    = true
    isPausedRef.current = false
    setState({
      events: [], ladderEvents: [], throughput: [],
      statistics: DEFAULT_STATS,
      isRunning: false, isPaused: false, isLoading: false, error: null
    })
  }, [])

  return { ...state, run, pause, resume, reset, setSpeed }
}
