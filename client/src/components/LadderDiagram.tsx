import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { LadderEvent } from '../types'
import { COLORS } from '../constants/theme'

interface Props {
  events: LadderEvent[]
}

const SVG_W = 420
const SENDER_X = 90
const RECEIVER_X = 330
const ROW_H = 42
const TOP_PAD = 44
const ARROW_DROP = 16   // diagonal drop per arrow

function arrowColor(type: LadderEvent['type']): string {
  switch (type) {
    case 'send':     return COLORS.blue
    case 'ack':      return COLORS.green
    case 'lost':     return COLORS.red
    case 'corrupted': return COLORS.violet
    case 'ack_lost': return '#f97316'
    case 'timeout':  return COLORS.amber
    default:         return COLORS.textMuted
  }
}

function isDashed(type: LadderEvent['type']): boolean {
  return type === 'lost' || type === 'corrupted' || type === 'ack_lost'
}

interface ArrowProps {
  ev: LadderEvent
  y: number
  index: number
}

function LadderArrow({ ev, y, index }: ArrowProps) {
  const color = arrowColor(ev.type)
  const dashed = isDashed(ev.type)

  if (ev.type === 'timeout') {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <rect x={SENDER_X - 28} y={y - 8} width={56} height={16} rx={3}
          fill="#fef3c7" stroke="#d97706" strokeWidth={1} />
        <text x={SENDER_X} y={y + 4} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontSize={9} fontWeight={600} fill="#92400e">
          TIMEOUT
        </text>
      </motion.g>
    )
  }

  const isLeft = ev.direction === 'left'
  const x1 = isLeft ? RECEIVER_X : SENDER_X
  const y1 = y
  const x2 = isLeft ? SENDER_X : (ev.type === 'lost' || ev.type === 'corrupted')
    ? (SENDER_X + RECEIVER_X) / 2
    : RECEIVER_X
  const y2 = y + ARROW_DROP

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2 - 7

  // Arrow marker id
  // const markerId = `arr-ladder-${color.replace('#', '')}`

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      {/* Defs inside group won't work in all browsers — use parent defs instead */}
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.6}
        strokeDasharray={dashed ? '5 3' : undefined}
        markerEnd={`url(#lm-${ev.type})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      />
      {/* X for lost */}
      {(ev.type === 'lost' || ev.type === 'corrupted') && (
        <motion.text
          x={(SENDER_X + RECEIVER_X) / 2} y={y + ARROW_DROP / 2 + 4}
          textAnchor="middle" fontFamily="Inter, sans-serif"
          fontSize={11} fontWeight={700} fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.3 }}
        >
          X
        </motion.text>
      )}
      {/* Label */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.2 }}
      >
        <rect x={midX - 18} y={midY - 9} width={36} height={13} rx={2}
          fill="#ffffff" stroke="#e2e8f0" strokeWidth={0.8} />
        <text x={midX} y={midY + 1} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontSize={9} fontWeight={600} fill={color}>
          {ev.label}
        </text>
      </motion.g>
    </motion.g>
  )
}

export default function LadderDiagram({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  const svgH = Math.max(220, events.length * ROW_H + TOP_PAD + 30)

  return (
    <div
      ref={scrollRef}
      style={{ overflowY: 'auto', maxHeight: 260, width: '100%' }}
    >
      <svg width="100%" viewBox={`0 0 ${SVG_W} ${svgH}`}
        preserveAspectRatio="xMidYMin meet" style={{ display: 'block' }}>
        <defs>
          {/* Arrow markers for each type */}
          {[
            { id: 'lm-send',     fill: COLORS.blue },
            { id: 'lm-ack',      fill: COLORS.green },
            { id: 'lm-lost',     fill: COLORS.red },
            { id: 'lm-corrupted',fill: COLORS.violet },
            { id: 'lm-ack_lost', fill: '#f97316' },
            { id: 'lm-timeout',  fill: COLORS.amber },
          ].map(({ id, fill }) => (
            <marker key={id} id={id} markerWidth="7" markerHeight="7"
              refX="6" refY="3" orient="auto">
              <polygon points="0 0,7 3,0 6" fill={fill} />
            </marker>
          ))}
        </defs>

        {/* Column headers */}
        <text x={SENDER_X} y={16} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontSize={11} fontWeight={600} fill="#374151">
          SENDER
        </text>
        <text x={RECEIVER_X} y={16} textAnchor="middle"
          fontFamily="Inter, sans-serif" fontSize={11} fontWeight={600} fill="#374151">
          RECEIVER
        </text>

        {/* Vertical timeline lines */}
        <line x1={SENDER_X} y1={24} x2={SENDER_X} y2={svgH - 10}
          stroke={COLORS.ladderTimeline} strokeWidth={1.5} />
        <line x1={RECEIVER_X} y1={24} x2={RECEIVER_X} y2={svgH - 10}
          stroke={COLORS.ladderTimeline} strokeWidth={1.5} />

        {/* Time axis arrow */}
        <line x1={SENDER_X} y1={svgH - 10} x2={SENDER_X} y2={svgH - 4}
          stroke={COLORS.ladderTimeline} strokeWidth={1.5}
          markerEnd="url(#lm-timeout)" />

        {/* Each event */}
        {events.map((ev, i) => {
          const y = TOP_PAD + i * ROW_H
          return (
            <g key={`${ev.type}-${ev.seq_num}-${ev.time}-${i}`}>
              {/* Time label */}
              <text x={14} y={y + 5} textAnchor="start"
                fontFamily="JetBrains Mono, monospace" fontSize={8}
                fill="#94a3b8">
                {ev.time}ms
              </text>
              {/* Tick on sender line */}
              <line x1={SENDER_X - 4} y1={y} x2={SENDER_X + 4} y2={y}
                stroke="#e2e8f0" strokeWidth={1} />
              <LadderArrow ev={ev} y={y} index={i} />
            </g>
          )
        })}

        {/* Empty state */}
        {events.length === 0 && (
          <text x={SVG_W / 2} y={svgH / 2} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontSize={12} fill="#94a3b8">
            Diagram will render here
          </text>
        )}
      </svg>
    </div>
  )
}
