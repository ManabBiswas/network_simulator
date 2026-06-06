import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulationEvent, Protocol } from '../types'
import { COLORS } from '../constants/theme'

interface Props {
  events: SimulationEvent[]
  protocol: Protocol
  isRunning: boolean
}

interface Bubble {
  id: string
  packetNum: number
  kind: 'data' | 'ack' | 'lost'
  laneY: number
}

const W = 700, H = 230
const SENDER_X   = 80
const RECEIVER_X = 620
const BASE_Y     = 115
const LANE_STEP  = 26

const BUBBLE_COLOR: Record<Bubble['kind'], string> = {
  data: COLORS.blue,
  ack:  COLORS.green,
  lost: COLORS.red,
}

export default function NetworkVisualization({ events, protocol, isRunning }: Props) {
  const [bubbles, setBubbles]     = useState<Bubble[]>([])
  const processedRef              = useRef(-1)
  const laneCounterRef            = useRef(0)

  // FIX 5: Guard packet_num — always a valid number
  const safeNum = (n: number | undefined) => (typeof n === 'number' && !isNaN(n) ? n : 0)

  useEffect(() => {
    if (events.length === 0) {
      processedRef.current  = -1
      laneCounterRef.current = 0
      setBubbles([])
      return
    }

    const newEvents = events.slice(processedRef.current + 1)
    if (!newEvents.length) return

    const newBubbles: Bubble[] = []

    newEvents.forEach(ev => {
      const pNum = safeNum(ev.packet_num)

      if (ev.event_type === 'send') {
        const lane = protocol === 'go-back-n' ? (laneCounterRef.current++ % 4) : 0
        const isLost = ev.description.includes('[LOST]') || ev.description.includes('[CORRUPTED]')
        newBubbles.push({
          id:        `send-${pNum}-${ev.time}-${Math.random().toString(36).slice(2)}`,
          packetNum: pNum,
          kind:      isLost ? 'lost' : 'data',
          laneY:     BASE_Y - lane * LANE_STEP,
        })
      } else if (ev.event_type === 'ack') {
        newBubbles.push({
          id:        `ack-${pNum}-${ev.time}-${Math.random().toString(36).slice(2)}`,
          packetNum: pNum,
          kind:      'ack',
          laneY:     BASE_Y + 22,
        })
      }
    })

    if (newBubbles.length) {
      setBubbles(prev => [...prev, ...newBubbles])
      const ids = new Set(newBubbles.map(b => b.id))
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => !ids.has(b.id)))
      }, 1100)
    }

    processedRef.current = events.length - 1
  }, [events, protocol])

  useEffect(() => {
    if (!isRunning) {
      setBubbles([])
      processedRef.current   = -1
      laneCounterRef.current = 0
    }
  }, [isRunning])

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="nv-arr-data" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={COLORS.blue} />
          </marker>
          <marker id="nv-arr-ack" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={COLORS.green} />
          </marker>
          <marker id="nv-arr-lost" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={COLORS.red} />
          </marker>
        </defs>

        {/* Channel line */}
        <line
          x1={SENDER_X + 42} y1={BASE_Y}
          x2={RECEIVER_X - 42} y2={BASE_Y}
          stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="6 4"
        />

        {/* ── Sender node ── */}
        <circle cx={SENDER_X} cy={BASE_Y} r={38} fill={COLORS.blue} />
        {/* Monitor outline */}
        <rect x={SENDER_X - 13} y={BASE_Y - 11} width={26} height={17} rx={2}
          fill="none" stroke="#fff" strokeWidth={1.8} />
        {/* Screen content lines */}
        <line x1={SENDER_X - 8} y1={BASE_Y - 6} x2={SENDER_X + 8} y2={BASE_Y - 6}
          stroke="#fff" strokeWidth={1.2} opacity={0.7} />
        <line x1={SENDER_X - 8} y1={BASE_Y - 2} x2={SENDER_X + 4} y2={BASE_Y - 2}
          stroke="#fff" strokeWidth={1.2} opacity={0.7} />
        {/* Stand */}
        <line x1={SENDER_X} y1={BASE_Y + 6} x2={SENDER_X} y2={BASE_Y + 13}
          stroke="#fff" strokeWidth={1.8} />
        <line x1={SENDER_X - 7} y1={BASE_Y + 13} x2={SENDER_X + 7} y2={BASE_Y + 13}
          stroke="#fff" strokeWidth={1.8} />
        <text x={SENDER_X} y={BASE_Y + 54} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontWeight={600} fontSize={12} fill="#374151">
          SENDER
        </text>

        {/* ── Receiver node ── */}
        <circle cx={RECEIVER_X} cy={BASE_Y} r={38} fill={COLORS.blue} />
        <rect x={RECEIVER_X - 13} y={BASE_Y - 11} width={26} height={17} rx={2}
          fill="none" stroke="#fff" strokeWidth={1.8} />
        <line x1={RECEIVER_X - 8} y1={BASE_Y - 6} x2={RECEIVER_X + 8} y2={BASE_Y - 6}
          stroke="#fff" strokeWidth={1.2} opacity={0.7} />
        <line x1={RECEIVER_X - 8} y1={BASE_Y - 2} x2={RECEIVER_X + 4} y2={BASE_Y - 2}
          stroke="#fff" strokeWidth={1.2} opacity={0.7} />
        <line x1={RECEIVER_X} y1={BASE_Y + 6} x2={RECEIVER_X} y2={BASE_Y + 13}
          stroke="#fff" strokeWidth={1.8} />
        <line x1={RECEIVER_X - 7} y1={BASE_Y + 13} x2={RECEIVER_X + 7} y2={BASE_Y + 13}
          stroke="#fff" strokeWidth={1.8} />
        <text x={RECEIVER_X} y={BASE_Y + 54} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontWeight={600} fontSize={12} fill="#374151">
          RECEIVER
        </text>

        {/* Protocol label */}
        <text x={W / 2} y={18} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontWeight={600} fontSize={12} fill="#94a3b8">
          {protocol === 'stop-and-wait' ? 'Stop-and-Wait Protocol' : 'Go-Back-N Protocol'}
        </text>

        {/* ── Animated packet bubbles ── */}
        <AnimatePresence>
          {bubbles.map(b => {
            const isAck  = b.kind === 'ack'
            const isLost = b.kind === 'lost'
            // FIX 5: All coords are computed numbers — never undefined
            const fromX  = isAck ? RECEIVER_X - 42 : SENDER_X + 42
            const toX    = isAck ? SENDER_X + 42   : RECEIVER_X - 42
            const midX   = Math.round((fromX + toX) / 2)
            const laneY  = b.laneY   // always set in push above
            const col    = BUBBLE_COLOR[b.kind]
            const marker = isAck ? 'url(#nv-arr-ack)'
              : isLost ? 'url(#nv-arr-lost)'
              : 'url(#nv-arr-data)'

            return (
              <motion.g key={b.id}>
                {/* Trail line */}
                {isLost ? (
                  <motion.line
                    x1={fromX} y1={laneY} x2={midX} y2={laneY}
                    stroke={col} strokeWidth={1.5} strokeDasharray="5 3"
                    markerEnd={marker}
                    initial={{ pathLength: 0, opacity: 0.7 }}
                    animate={{ pathLength: 1, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <motion.line
                    x1={fromX} y1={laneY} x2={toX} y2={laneY}
                    stroke={col} strokeWidth={1.5}
                    markerEnd={marker}
                    initial={{ pathLength: 0, opacity: 0.5 }}
                    animate={{ pathLength: 1, opacity: 0 }}
                    transition={{ duration: 0.85, ease: 'easeInOut' }}
                  />
                )}

                {/* Bubble circle */}
                <motion.circle
                  cx={fromX}
                  cy={laneY}
                  r={13}
                  fill={col}
                  animate={{
                    cx: isLost ? midX : toX,
                    opacity: isLost ? [1, 0] : [1, 1, 0],
                  }}
                  transition={{ duration: isLost ? 0.45 : 0.85, ease: 'easeInOut' }}
                />

                {/* Bubble label */}
                <motion.text
                  x={fromX}
                  y={laneY + 4}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontWeight={700} fontSize={10} fill="#fff"
                  animate={{
                    x: isLost ? midX : toX,
                    opacity: isLost ? [1, 0] : [1, 1, 0],
                  }}
                  transition={{ duration: isLost ? 0.45 : 0.85, ease: 'easeInOut' }}
                >
                  {isAck ? `A${b.packetNum}` : `P${b.packetNum}`}
                </motion.text>

                {/* X mark for lost */}
                {isLost && (
                  <motion.text
                    x={midX} y={laneY + 5}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif" fontWeight={700} fontSize={15}
                    fill={COLORS.red}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
                    transition={{ delay: 0.38, duration: 0.55 }}
                  >
                    X
                  </motion.text>
                )}
              </motion.g>
            )
          })}
        </AnimatePresence>
      </svg>
    </div>
  )
}
