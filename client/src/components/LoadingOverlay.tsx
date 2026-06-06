import { motion } from 'framer-motion'

interface Props {
  message?: string
}

export default function LoadingOverlay({ message = 'Running simulation...' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
        borderRadius: 10
      }}
    >
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        style={{
          width: 32, height: 32, border: '3px solid #e2e8f0',
          borderTop: '3px solid #2563eb', borderRadius: '50%'
        }}
      />
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: 13,
        color: '#475569', fontWeight: 500
      }}>{message}</span>
    </motion.div>
  )
}
