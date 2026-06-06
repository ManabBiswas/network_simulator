import { motion } from 'framer-motion'
import type { SimulationParams, Protocol, AppMode } from '../types'

interface Props {
  mode: AppMode
  protocol: Protocol
  params: SimulationParams
  onProtocol: (p: Protocol) => void
  onParams: (p: SimulationParams) => void
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onCompare: () => void
  isLoading: boolean
}

function SliderRow({
  label, value, min, max, step, unit, onChange, disabled
}: {
  label: string; value: number; min: number; max: number
  step: number; unit: string; onChange: (v: number) => void; disabled: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
          color: '#374151'
        }}>{label}</label>
        <span style={{
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          borderRadius: 4, padding: '2px 8px',
          fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
          color: '#374151', minWidth: 52, textAlign: 'center'
        }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer', accentColor: '#2563eb' }}
      />
    </div>
  )
}

function WindowVisualizer({ windowSize, protocol }: { windowSize: number; protocol: Protocol }) {
  if (protocol !== 'go-back-n') return null
  const slots = 10
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <label style={{
        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#374151'
      }}>Window Size</label>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: slots }, (_, i) => {
          const inWindow = i < windowSize
          return (
            <motion.div
              key={i}
              animate={{
                background: inWindow ? '#dbeafe' : '#f1f5f9',
                borderColor: inWindow ? '#2563eb' : '#e2e8f0',
              }}
              transition={{ duration: 0.2 }}
              style={{
                width: 22, height: 22, borderRadius: 4,
                border: `1.5px solid`,
                borderColor: inWindow ? '#2563eb' : '#e2e8f0',
                background: inWindow ? '#dbeafe' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                color: inWindow ? '#2563eb' : '#94a3b8',
              }}
            >
              {i + 1}
            </motion.div>
          )
        })}
      </div>
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b', textAlign: 'center'
      }}>GBN — Window: {windowSize}</span>
    </motion.div>
  )
}

function Checkbox({
  id, label, checked, onChange, disabled
}: {
  id: string; label: string; checked: boolean
  onChange: (v: boolean) => void; disabled: boolean
}) {
  return (
    <label htmlFor={id} style={{
      display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', userSelect: 'none'
    }}>
      <input
        id={id} type="checkbox" checked={checked} disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#2563eb' }}
      />
      {label}
    </label>
  )
}

export default function Sidebar({
  mode, protocol, params, onProtocol, onParams,
  isRunning, isPaused, onStart, onPause, onResume, onReset, onCompare, isLoading
}: Props) {
  const set = (key: keyof SimulationParams, value: SimulationParams[keyof SimulationParams]) =>
    onParams({ ...params, [key]: value })

  const disabled = isRunning || isLoading
  const isComparison = mode === 'analysis'

  return (
    <aside style={{
      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      height: 'fit-content', position: 'sticky', top: 24
    }}>

      {/* Protocol selector — hidden in comparison/analysis mode */}
      {!isComparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#374151'
          }}>Protocol</label>
          <select
            value={protocol}
            onChange={e => onProtocol(e.target.value as Protocol)}
            disabled={disabled}
            style={{
              padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
              fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0f172a',
              background: '#ffffff', cursor: disabled ? 'not-allowed' : 'pointer',
              outline: 'none'
            }}
          >
            <option value="stop-and-wait">Stop-and-Wait</option>
            <option value="go-back-n">Go-Back-N</option>
          </select>
        </div>
      )}

      {/* Message */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#374151'
        }}>Message</label>
        <textarea
          value={params.message}
          onChange={e => set('message', e.target.value)}
          disabled={disabled}
          placeholder="Enter message to send..."
          rows={3}
          style={{
            padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
            fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0f172a',
            resize: 'vertical', outline: 'none', background: '#ffffff'
          }}
        />
      </div>

      {/* Window visualizer — GBN only */}
      <WindowVisualizer windowSize={params.windowSize} protocol={isComparison ? 'go-back-n' : protocol} />

      {/* Window size slider — GBN or comparison */}
      {(protocol === 'go-back-n' || isComparison) && (
        <SliderRow
          label="Window Size" value={params.windowSize}
          min={1} max={10} step={1} unit=""
          onChange={v => set('windowSize', v)} disabled={disabled}
        />
      )}

      {/* Total packets */}
      <SliderRow
        label="Total Packets" value={params.totalPackets}
        min={1} max={20} step={1} unit=""
        onChange={v => set('totalPackets', v)} disabled={disabled}
      />

      {/* Transmission delay */}
      <SliderRow
        label="Transmission Delay (ms)" value={params.transmissionDelay}
        min={100} max={2000} step={100} unit=" ms"
        onChange={v => set('transmissionDelay', v)} disabled={disabled}
      />

      {/* ACK delay */}
      <SliderRow
        label="ACK Delay (ms)" value={params.ackDelay}
        min={50} max={1000} step={50} unit=" ms"
        onChange={v => set('ackDelay', v)} disabled={disabled}
      />

      {/* Loss rate */}
      <SliderRow
        label="Packet Loss Rate (%)" value={Math.round(params.lossRate * 100)}
        min={0} max={90} step={5} unit="%"
        onChange={v => set('lossRate', v / 100)} disabled={disabled}
      />

      {/* Edge cases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
          color: '#374151'
        }}>Edge Case</span>
        <Checkbox id="corruption" label="Corruption" checked={params.simulateCorruption}
          onChange={v => set('simulateCorruption', v)} disabled={disabled} />
        <Checkbox id="late-ack" label="Delayed ACK" checked={params.simulateLateAck}
          onChange={v => set('simulateLateAck', v)} disabled={disabled} />
        <Checkbox id="dup-ack" label="Duplicate ACK" checked={params.simulateDuplicateAck}
          onChange={v => set('simulateDuplicateAck', v)} disabled={disabled} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#e2e8f0', margin: '4px 0' }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!isComparison ? (
          <>
            <motion.button
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              onClick={onStart}
              disabled={disabled}
              style={{
                width: '100%', padding: '11px 0',
                background: disabled ? '#86efac' : '#16a34a',
                color: '#ffffff', border: 'none', borderRadius: 6,
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isLoading ? 'Loading...' : isRunning ? 'Running...' : 'Start Simulation'}
            </motion.button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <motion.button
                whileHover={!isRunning ? {} : { scale: 1.02 }}
                whileTap={!isRunning ? {} : { scale: 0.97 }}
                onClick={isPaused ? onResume : onPause}
                disabled={!isRunning}
                style={{
                  padding: '9px 0',
                  background: !isRunning ? '#93c5fd' : '#2563eb',
                  color: '#ffffff', border: 'none', borderRadius: 6,
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: !isRunning ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onReset}
                style={{
                  padding: '9px 0', background: '#dc2626',
                  color: '#ffffff', border: 'none', borderRadius: 6,
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                Reset
              </motion.button>
            </div>
          </>
        ) : (
          <motion.button
            whileHover={isLoading ? {} : { scale: 1.02 }}
            whileTap={isLoading ? {} : { scale: 0.97 }}
            onClick={onCompare}
            disabled={isLoading}
            style={{
              width: '100%', padding: '11px 0',
              background: isLoading ? '#86efac' : '#16a34a',
              color: '#ffffff', border: 'none', borderRadius: 6,
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isLoading ? 'Running...' : 'Run Comparison'}
          </motion.button>
        )}
      </div>
    </aside>
  )
}
