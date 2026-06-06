import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  style?: React.CSSProperties
  titleRight?: ReactNode
}

export default function PanelCard({ title, children, style, titleRight }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12,
        ...style
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 10, borderBottom: '1px solid #e2e8f0'
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
          color: '#1e293b', letterSpacing: '0.01em'
        }}>
          {title}
        </span>
        {titleRight}
      </div>
      {children}
    </motion.div>
  )
}
