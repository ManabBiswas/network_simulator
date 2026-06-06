// ── Simulation Events ─────────────────────────────────────────────────────────

export type EventType =
  | 'send'
  | 'ack'
  | 'loss'
  | 'timeout'
  | 'retransmit'
  | 'error'

export interface SimulationEvent {
  time: number
  event_type: EventType
  packet_num: number
  description: string
}

// ── Ladder Diagram ────────────────────────────────────────────────────────────

export type LadderEventType =
  | 'send'
  | 'ack'
  | 'lost'
  | 'corrupted'
  | 'ack_lost'
  | 'timeout'

export interface LadderEvent {
  time: number
  type: LadderEventType
  seq_num: number
  label: string
  direction: 'right' | 'left' | 'none'
  success: boolean
}

// ── Throughput Chart ──────────────────────────────────────────────────────────

export interface ThroughputPoint {
  time: number
  delivered: number
}

// ── Statistics ────────────────────────────────────────────────────────────────

export interface Statistics {
  total_packets: number
  total_packets_sent: number
  acks_received: number
  retransmissions: number
  corrupted_packets: number
  duplicate_acks: number
  total_time: number
  efficiency: number
  window_size?: number
}

// ── Simulation Result (from API) ─────────────────────────────────────────────

export interface SimulationResult {
  events: SimulationEvent[]
  ladder_events: LadderEvent[]
  throughput: ThroughputPoint[]
  statistics: Statistics
}

// ── Comparison Result (from /api/compare) ────────────────────────────────────

export interface ComparisonResult {
  stop_and_wait: SimulationResult
  go_back_n: SimulationResult
  params: SimulationParams
}

// ── UI Parameters ─────────────────────────────────────────────────────────────

export interface SimulationParams {
  totalPackets: number
  transmissionDelay: number
  ackDelay: number
  lossRate: number
  timeoutDuration: number
  windowSize: number
  message: string
  simulateCorruption: boolean
  simulateLateAck: boolean
  simulateDuplicateAck: boolean
}

export type Protocol = 'stop-and-wait' | 'go-back-n'
export type AppMode = 'simulation' | 'analysis'
