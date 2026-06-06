import { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { Statistics } from '../types'
import { COLORS, EFFICIENCY_COLOR } from '../constants/theme'

interface CardProps {
  label: string
  value: number
  unit?: string
  accentColor: string
  index: number
  isFloat?: boolean
}

function MetricCard({ label, value, unit = '', accentColor, index, isFloat }: CardProps) {
  const motionVal = useMotionValue(0)
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate(v) {
        if (displayRef.current) {
          displayRef.current.textContent = isFloat
            ? v.toFixed(1) + unit
            : Math.round(v) + unit
        }
      }
    })
    return controls.stop
  }, [value, unit, isFloat, motionVal])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderTop: `4px solid ${accentColor}`,
        borderRadius: 10, padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 6
      }}
    >
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
        color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em'
      }}>{label}</span>
      <span
        ref={displayRef}
        style={{
          fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 700,
          color: accentColor, lineHeight: 1
        }}
      >
        0{unit}
      </span>
    </motion.div>
  )
}

interface Props {
  statistics: Statistics
}

export default function MetricCards({ statistics: s }: Props) {
  const effColor = EFFICIENCY_COLOR(s.efficiency)
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16
    }}>
      <MetricCard
        label="Packets Sent" value={s.total_packets_sent}
        accentColor={COLORS.blue} index={0}
      />
      <MetricCard
        label="ACKs Received" value={s.acks_received}
        accentColor={COLORS.green} index={1}
      />
      <MetricCard
        label="Retransmissions" value={s.retransmissions}
        accentColor={COLORS.orange} index={2}
      />
      <MetricCard
        label="Link Efficiency" value={s.efficiency}
        unit="%" accentColor={effColor} index={3} isFloat
      />
    </div>
  )
}
