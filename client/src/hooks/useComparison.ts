import { useState, useCallback } from 'react'
import type { ComparisonResult, SimulationParams } from '../types'

interface ComparisonState {
  result: ComparisonResult | null
  isLoading: boolean
  error: string | null
}

export function useComparison() {
  const [state, setState] = useState<ComparisonState>({
    result: null, isLoading: false, error: null
  })

  const run = useCallback(async (params: SimulationParams) => {
    setState({ result: null, isLoading: true, error: null })

    const apiBase = import.meta.env.VITE_API_URL ?? ''

    try {
      const res = await fetch(`${apiBase}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_packets:          params.totalPackets,
          transmission_delay:     params.transmissionDelay,
          ack_delay:              params.ackDelay,
          loss_rate:              params.lossRate,
          timeout_duration:       params.timeoutDuration,
          window_size:            params.windowSize,
          message:                params.message,
          simulate_corruption:    params.simulateCorruption,
          simulate_late_ack:      params.simulateLateAck,
          simulate_duplicate_ack: params.simulateDuplicateAck,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      const data: ComparisonResult = await res.json()
      setState({ result: data, isLoading: false, error: null })
    } catch (e: unknown) {
      const msg = e instanceof Error
        ? e.message
        : 'Connection failed — is the backend running?'
      setState({ result: null, isLoading: false, error: msg })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null })
  }, [])

  return { ...state, run, reset }
}
