import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulationEvent, EventType } from '../types'

interface Props {
  events: SimulationEvent[]
}

const ROW_BG: Record<EventType | string, string> = {
  send:       '#eff6ff',
  ack:        '#f0fdf4',
  loss:       '#fef2f2',
  timeout:    '#fffbeb',
  retransmit: '#fff7ed',
  error:      '#faf5ff',
}

const ROW_COLOR: Record<EventType | string, string> = {
  send:       '#1d4ed8',
  ack:        '#15803d',
  loss:       '#b91c1c',
  timeout:    '#92400e',
  retransmit: '#9a3412',
  error:      '#6d28d9',
}

// SVG icons — no emoji
function EventIcon({ type }: { type: EventType }) {
  const color = ROW_COLOR[type] || '#64748b'
  const size = 13
  switch (type) {
    case 'send':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M2 8h12M10 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'ack':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M3 8l4 4 6-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'loss':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    case 'timeout':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="9" r="5" stroke={color} strokeWidth="1.6"/>
          <path d="M8 6v3.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M6 1.5h4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5" stroke={color} strokeWidth="1.6"/>
          <path d="M8 5v4M8 11v1" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )
  }
}

export default function EventTimeline({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div
      ref={scrollRef}
      style={{
        overflowY: 'auto', height: 200,
        background: '#f8fafc', borderRadius: 6,
        padding: '10px 10px'
      }}
    >
      {events.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%',
          fontFamily: 'Inter, sans-serif', fontSize: 13,
          fontStyle: 'italic', color: '#94a3b8'
        }}>
          Simulation events will appear here...
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {events.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '5px 8px', borderRadius: 4,
                marginBottom: 3,
                background: ROW_BG[ev.event_type] || '#f8fafc',
              }}
            >
              {/* Timestamp */}
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: '#94a3b8', minWidth: 58, flexShrink: 0, paddingTop: 1
              }}>
                [{ev.time}ms]
              </span>
              {/* Icon */}
              <span style={{ flexShrink: 0, paddingTop: 1 }}>
                <EventIcon type={ev.event_type} />
              </span>
              {/* Description */}
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: ROW_COLOR[ev.event_type] || '#374151',
                lineHeight: 1.4, wordBreak: 'break-word'
              }}>
                {ev.description}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
