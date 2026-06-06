import { motion } from 'framer-motion'
import type { AppMode } from '../types'

interface Props {
  mode: AppMode
  onChange: (m: AppMode) => void
}

const TABS: { id: AppMode; label: string }[] = [
  { id: 'simulation', label: 'Simulation' },
  { id: 'analysis',   label: 'Analysis'   },
]

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div style={{
      display: 'flex', background: '#f1f5f9', borderRadius: 8,
      padding: 4, gap: 2
    }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            position: 'relative', padding: '6px 22px',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 13, transition: 'color 0.2s',
            color: mode === tab.id ? '#ffffff' : '#64748b',
            background: 'transparent', zIndex: 1
          }}
        >
          {mode === tab.id && (
            <motion.div
              layoutId="tab-pill"
              style={{
                position: 'absolute', inset: 0, borderRadius: 6,
                background: '#2563eb',
                boxShadow: '0 1px 4px rgba(37,99,235,0.3)'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 2 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
