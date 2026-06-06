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
  kind: 'data' | 'ack' | 'lost' | 'retransmit'
  laneY: number
}

const W = 700, H = 220
const SENDER_X = 80, RECEIVER_X = 620
const BASE_Y = 110
const LANE_STEP = 26

const BUBBLE_COLOR: Record<string, string> = {
  data: COLORS.blue,
  ack: COLORS.green,
  lost: COLORS.red,
  retransmit: COLORS.orange,
}

export default function NetworkVisualization({ events, protocol, isRunning }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const processedRef = useRef(-1)
  const laneCounterRef = useRef(0)

  useEffect(() => {
    if (events.length === 0) { 
      processedRef.current = -1; 
      laneCounterRef.current = 0; 
      return 
    }
    
    const newEvents = events.slice(processedRef.current + 1)
    if (!newEvents.length) return

    const newBubbles: Bubble[] = []
    newEvents.forEach(ev => {
      if (ev.event_type === 'send') {
        const lane = protocol === 'go-back-n' ? (laneCounterRef.current++ % 4) : 0
        newBubbles.push({
          id: `send-${ev.packet_num}-${ev.time}-${Math.random()}`,
          packetNum: ev.packet_num || 0,
          kind: ev.description.includes('[LOST]') ? 'lost'
            : ev.description.includes('[CORRUPTED]') ? 'lost' : 'data',
          laneY: BASE_Y - lane * LANE_STEP,
        })
      } else if (ev.event_type === 'ack') {
        newBubbles.push({
          id: `ack-${ev.packet_num}-${ev.time}-${Math.random()}`,
          packetNum: ev.packet_num || 0,
          kind: 'ack',
          laneY: BASE_Y + 20,
        })
      }
    })
    
    if (newBubbles.length) {
      // FIX 1: Push the state update to the next frame to prevent cascading render warnings
      requestAnimationFrame(() => {
        setBubbles(prev => [...prev, ...newBubbles])
      })
      
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => !newBubbles.some(n => n.id === b.id)))
      }, 1100)
    }
    processedRef.current = events.length - 1
  }, [events, protocol])

  useEffect(() => {
    if (!isRunning) { 
      // FIX 2: Push the reset state update to the next frame as well
      requestAnimationFrame(() => {
        setBubbles([])
      })
      processedRef.current = -1; 
      laneCounterRef.current = 0 
    }
  }, [isRunning])

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arr-data" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={COLORS.blue} />
          </marker>
          <marker id="arr-ack" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={COLORS.green} />
          </marker>
          <marker id="arr-lost" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={COLORS.red} />
          </marker>
        </defs>

        {/* Channel line */}
        <line x1={SENDER_X + 52} y1={BASE_Y} x2={RECEIVER_X - 52} y2={BASE_Y}
          stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="6 4" />

        {/* Sender node */}
        <circle cx={SENDER_X} cy={BASE_Y} r={38} fill={COLORS.blue} />
        {/* Computer icon path */}
        <rect x={SENDER_X - 14} y={BASE_Y - 10} width={28} height={18} rx={2}
          fill="none" stroke="#fff" strokeWidth={1.8} />
        <line x1={SENDER_X - 6} y1={BASE_Y + 8} x2={SENDER_X + 6} y2={BASE_Y + 8}
          stroke="#fff" strokeWidth={1.8} />
        <line x1={SENDER_X} y1={BASE_Y + 8} x2={SENDER_X} y2={BASE_Y + 14}
          stroke="#fff" strokeWidth={1.8} />
        <line x1={SENDER_X - 8} y1={BASE_Y + 14} x2={SENDER_X + 8} y2={BASE_Y + 14}
          stroke="#fff" strokeWidth={1.8} />
        <text x={SENDER_X} y={BASE_Y + 54} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontWeight={600} fontSize={12} fill="#374151">
          SENDER
        </text>

        {/* Receiver node */}
        <circle cx={RECEIVER_X} cy={BASE_Y} r={38} fill={COLORS.blue} />
        <rect x={RECEIVER_X - 14} y={BASE_Y - 10} width={28} height={18} rx={2}
          fill="none" stroke="#fff" strokeWidth={1.8} />
        <line x1={RECEIVER_X - 6} y1={BASE_Y + 8} x2={RECEIVER_X + 6} y2={BASE_Y + 8}
          stroke="#fff" strokeWidth={1.8} />
        <line x1={RECEIVER_X} y1={BASE_Y + 8} x2={RECEIVER_X} y2={BASE_Y + 14}
          stroke="#fff" strokeWidth={1.8} />
        <line x1={RECEIVER_X - 8} y1={BASE_Y + 14} x2={RECEIVER_X + 8} y2={BASE_Y + 14}
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

        {/* Animated bubbles */}
        <AnimatePresence>
          {bubbles.map(b => {
            const isAck = b.kind === 'ack'
            const isLost = b.kind === 'lost'
            const fromX = isAck ? RECEIVER_X - 40 : SENDER_X + 40
            const toX = isAck ? SENDER_X + 40 : RECEIVER_X - 40
            const midX = (fromX + toX) / 2
            const col = BUBBLE_COLOR[b.kind]

            return (
              <motion.g key={b.id}>
                {/* Trail line */}
                {!isLost ? (
                  <motion.line
                    x1={fromX} y1={b.laneY} x2={toX} y2={b.laneY}
                    stroke={col} strokeWidth={1.5}
                    markerEnd={`url(#arr-${isAck ? 'ack' : 'data'})`}
                    initial={{ pathLength: 0, opacity: 0.6 }}
                    animate={{ pathLength: 1, opacity: 0 }}
                    transition={{ duration: 0.85, ease: 'easeInOut' }}
                  />
                ) : (
                  <motion.line
                    x1={fromX} y1={b.laneY} x2={midX} y2={b.laneY}
                    stroke={col} strokeWidth={1.5} strokeDasharray="5 3"
                    markerEnd="url(#arr-lost)"
                    initial={{ pathLength: 0, opacity: 0.7 }}
                    animate={{ pathLength: 1, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                {/* Bubble */}
                <motion.circle
                  cx={fromX} cy={b.laneY} r={13}
                  fill={col}
                  animate={{ cx: isLost ? midX : toX, opacity: isLost ? [1, 0] : [1, 1, 0] }}
                  transition={{ duration: isLost ? 0.45 : 0.85, ease: 'easeInOut' }}
                />
                <motion.text
                  x={fromX} y={b.laneY + 4}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif" fontWeight={700} fontSize={10} fill="#fff"
                  animate={{ x: isLost ? midX : toX, opacity: isLost ? [1, 0] : [1, 1, 0] }}
                  transition={{ duration: isLost ? 0.45 : 0.85, ease: 'easeInOut' }}
                >
                  {isAck ? `A${b.packetNum}` : `P${b.packetNum}`}
                </motion.text>
                {/* X mark for lost */}
                {isLost && (
                  <motion.text
                    x={midX} y={b.laneY + 5}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif" fontWeight={700} fontSize={14}
                    fill={COLORS.red}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                    transition={{ delay: 0.4, duration: 0.6 }}
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