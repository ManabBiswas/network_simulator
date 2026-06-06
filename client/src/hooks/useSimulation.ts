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

export function useSimulation() {
  const [state, setState] = useState<SimulationState>({
    events: [], ladderEvents: [], throughput: [],
    statistics: DEFAULT_STATS,
    isRunning: false, isPaused: false, isLoading: false, error: null
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPausedRef = useRef(false)
  const abortRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const run = useCallback(async (protocol: Protocol, params: SimulationParams) => {
    clearTimer()
    abortRef.current = false
    isPausedRef.current = false

    setState({
      events: [], ladderEvents: [], throughput: [],
      statistics: DEFAULT_STATS,
      isRunning: true, isPaused: false, isLoading: true, error: null
    })

    try {
const res = await fetch('http://localhost:5000/api/simulate', {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          total_packets: params.totalPackets,
          transmission_delay: params.transmissionDelay,
          ack_delay: params.ackDelay,
          loss_rate: params.lossRate,
          timeout_duration: params.timeoutDuration,
          window_size: params.windowSize,
          message: params.message,
          simulate_corruption: params.simulateCorruption,
          simulate_late_ack: params.simulateLateAck,
          simulate_duplicate_ack: params.simulateDuplicateAck,
        })
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      const data: SimulationResult = await res.json()

      setState(s => ({ ...s, isLoading: false }))
      playback(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connection failed — is the backend running?'
      setState(s => ({ ...s, isRunning: false, isLoading: false, error: msg }))
    }
  }, [])

  function playback(data: SimulationResult) {
    const allEvents = data.events
    const allLadder = data.ladder_events
    const allThroughput = data.throughput

    // Build a delivery map: time → delivered count (for live throughput)
    const deliveryMap = new Map<number, number>()
    allThroughput.forEach(p => deliveryMap.set(p.time, p.delivered))

    let idx = 0
    // Running live stats counters
    let liveSent = 0, liveAcks = 0, liveRetrans = 0

    function tick() {
      if (abortRef.current) return
      if (idx >= allEvents.length) {
        setState(s => ({ ...s, isRunning: false, statistics: data.statistics,
          throughput: allThroughput, ladderEvents: allLadder }))
        return
      }
      if (isPausedRef.current) {
        timerRef.current = setTimeout(tick, 100)
        return
      }

      const ev = allEvents[idx]

      // Live stat tracking
      if (ev.event_type === 'send') liveSent++
      if (ev.event_type === 'ack') liveAcks++
      if (ev.event_type === 'timeout') liveRetrans++

      // Find matching ladder event(s) for this sim event
      const matchingLadder = allLadder.filter(le =>
        le.time === ev.time && (
          (ev.event_type === 'send' && (le.type === 'send' || le.type === 'lost' || le.type === 'corrupted') && le.seq_num === ev.packet_num) ||
          (ev.event_type === 'ack' && (le.type === 'ack' || le.type === 'ack_lost') && le.seq_num === ev.packet_num) ||
          (ev.event_type === 'timeout' && le.type === 'timeout' && le.seq_num === ev.packet_num)
        )
      )

      // Throughput up to current time
      const liveThroughput = allThroughput.filter(p => p.time <= ev.time)

      setState(s => ({
        ...s,
        events: [...s.events, ev],
        ladderEvents: [...s.ladderEvents, ...matchingLadder.filter(
          ml => !s.ladderEvents.some(sl => sl.time === ml.time && sl.type === ml.type && sl.seq_num === ml.seq_num)
        )],
        throughput: liveThroughput,
        statistics: {
          ...data.statistics,
          total_packets_sent: liveSent,
          acks_received: liveAcks,
          retransmissions: liveRetrans,
          efficiency: liveSent > 0
            ? Math.round((data.statistics.total_packets / liveSent) * 100 * 10) / 10
            : 0
        }
      }))

      // Delay to next event — capped so UI stays responsive
      let delay = 60
      if (idx < allEvents.length - 1) {
        const diff = allEvents[idx + 1].time - ev.time
        delay = Math.max(40, Math.min(500, diff))
      }
      idx++
      timerRef.current = setTimeout(tick, delay)
    }

    tick()
  }

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
    abortRef.current = true
    isPausedRef.current = false
    setState({
      events: [], ladderEvents: [], throughput: [],
      statistics: DEFAULT_STATS,
      isRunning: false, isPaused: false, isLoading: false, error: null
    })
  }, [])

  return { ...state, run, pause, resume, reset }
}
