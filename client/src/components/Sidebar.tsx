import { motion } from 'framer-motion'
import type { SimulationParams, Protocol, AppMode } from '../types'

interface Props {
  mode: AppMode
  protocol: Protocol
  params: SimulationParams
  speed: number
  onProtocol: (p: Protocol) => void
  onParams: (p: SimulationParams) => void
  onSpeed: (s: number) => void
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onCompare: () => void
  isLoading: boolean
}

// ── Slider row ────────────────────────────────────────────────────────────────
function SliderRow({
  label, value, min, max, step, display, onChange, disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: '#374151' }}>
          {label}
        </label>
        <span style={{
          background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4,
          padding: '1px 7px', fontFamily: 'Inter,sans-serif', fontSize: 11,
          fontWeight: 600, color: '#374151', minWidth: 48, textAlign: 'center',
        }}>
          {display}
        </span>
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

// ── FIX 2: Window visualizer — only rendered when protocol === 'go-back-n' ───
function WindowVisualizer({ windowSize }: { windowSize: number }) {
  const slots = 10
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: '#374151' }}>
        Window Slots
      </label>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: slots }, (_, i) => {
          const active = i < windowSize
          return (
            <motion.div
              key={i}
              animate={{
                background: active ? '#dbeafe' : '#f1f5f9',
                borderColor: active ? '#2563eb' : '#e2e8f0',
              }}
              transition={{ duration: 0.18 }}
              style={{
                width: 22, height: 22, borderRadius: 4,
                border: '1.5px solid',
                borderColor: active ? '#2563eb' : '#e2e8f0',
                background: active ? '#dbeafe' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter,sans-serif', fontSize: 9, fontWeight: 700,
                color: active ? '#2563eb' : '#94a3b8',
              }}
            >
              {i + 1}
            </motion.div>
          )
        })}
      </div>
      <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: '#64748b', textAlign: 'center' }}>
        GBN Window: {windowSize} of {slots}
      </span>
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({
  id, label, checked, onChange, disabled,
}: {
  id: string; label: string; checked: boolean
  onChange: (v: boolean) => void; disabled: boolean
}) {
  return (
    <label htmlFor={id} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#374151', userSelect: 'none',
    }}>
      <input
        id={id} type="checkbox" checked={checked} disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#2563eb' }}
      />
      {label}
    </label>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: '#e2e8f0', margin: '2px 0' }} />
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <span style={{
      fontFamily: 'Inter,sans-serif', fontSize: 11, fontWeight: 700,
      color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em',
    }}>
      {children}
    </span>
  )
}

// ── Main sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({
  mode, protocol, params, speed,
  onProtocol, onParams, onSpeed,
  isRunning, isPaused, onStart, onPause, onResume, onReset, onCompare,
  isLoading,
}: Props) {
  const set = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) =>
    onParams({ ...params, [key]: value })

  const disabled      = isRunning || isLoading
  const isComparison  = mode === 'analysis'
  const showGBNControls = isComparison || protocol === 'go-back-n'

  return (
    <aside style={{
      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
      padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12,
      height: 'fit-content', position: 'sticky', top: 24,
    }}>

      {/* Protocol selector — hidden in analysis/comparison mode */}
      {!isComparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <SectionLabel>Protocol</SectionLabel>
          <select
            value={protocol}
            onChange={e => onProtocol(e.target.value as Protocol)}
            disabled={disabled}
            style={{
              padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
              fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#0f172a',
              background: '#ffffff', cursor: disabled ? 'not-allowed' : 'pointer',
              outline: 'none',
            }}
          >
            <option value="stop-and-wait">Stop-and-Wait</option>
            <option value="go-back-n">Go-Back-N</option>
          </select>
        </div>
      )}

      {/* Message */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <SectionLabel>Message</SectionLabel>
        <textarea
          value={params.message}
          onChange={e => set('message', e.target.value)}
          disabled={disabled}
          placeholder="Enter message to send..."
          rows={3}
          style={{
            padding: '7px 9px', border: '1px solid #cbd5e1', borderRadius: 6,
            fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#0f172a',
            resize: 'vertical', outline: 'none', background: '#ffffff', lineHeight: 1.4,
          }}
        />
        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: '#94a3b8' }}>
          {params.message.length} chars — {Math.ceil(Math.max(params.message.length, 1) / 10)} packets needed
        </span>
      </div>

      <Divider />
      <SectionLabel>Parameters</SectionLabel>

      {/* FIX 2: Window visualizer — only when GBN or comparison mode */}
      {showGBNControls && (
        <WindowVisualizer windowSize={params.windowSize} />
      )}

      {/* Window size slider — only GBN / comparison */}
      {showGBNControls && (
        <SliderRow
          label="Window Size" value={params.windowSize}
          min={1} max={10} step={1} display={`${params.windowSize}`}
          onChange={v => set('windowSize', v)} disabled={disabled}
        />
      )}

      {/* Total packets */}
      <SliderRow
        label="Total Packets" value={params.totalPackets}
        min={1} max={30} step={1} display={`${params.totalPackets}`}
        onChange={v => set('totalPackets', v)} disabled={disabled}
      />

      {/* Transmission delay */}
      <SliderRow
        label="Transmission Delay" value={params.transmissionDelay}
        min={100} max={2000} step={100} display={`${params.transmissionDelay} ms`}
        onChange={v => set('transmissionDelay', v)} disabled={disabled}
      />

      {/* ACK delay */}
      <SliderRow
        label="ACK Delay" value={params.ackDelay}
        min={50} max={1000} step={50} display={`${params.ackDelay} ms`}
        onChange={v => set('ackDelay', v)} disabled={disabled}
      />

      {/* Loss rate */}
      <SliderRow
        label="Packet Loss Rate" value={Math.round(params.lossRate * 100)}
        min={0} max={90} step={5} display={`${Math.round(params.lossRate * 100)}%`}
        onChange={v => set('lossRate', v / 100)} disabled={disabled}
      />

      <Divider />

      {/* FIX 1: Playback speed — always visible, works during pause too */}
      <SliderRow
        label="Playback Speed" value={speed}
        min={0.25} max={3} step={0.25}
        display={`${speed.toFixed(2)}x`}
        onChange={onSpeed} disabled={false}
      />

      <Divider />
      <SectionLabel>Edge Cases</SectionLabel>

      <Checkbox id="corruption" label="Packet Corruption"
        checked={params.simulateCorruption}
        onChange={v => set('simulateCorruption', v)} disabled={disabled} />
      <Checkbox id="late-ack" label="Delayed ACK"
        checked={params.simulateLateAck}
        onChange={v => set('simulateLateAck', v)} disabled={disabled} />
      <Checkbox id="dup-ack" label="Duplicate ACK"
        checked={params.simulateDuplicateAck}
        onChange={v => set('simulateDuplicateAck', v)} disabled={disabled} />

      <Divider />

      {/* Action buttons */}
      {!isComparison ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            onClick={onStart}
            disabled={disabled}
            style={{
              width: '100%', padding: '11px 0',
              background: disabled ? '#86efac' : '#16a34a',
              color: '#ffffff', border: 'none', borderRadius: 6,
              fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.18s',
            }}
          >
            {isLoading ? 'Loading...' : isRunning ? 'Running...' : 'Start Simulation'}
          </motion.button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            <motion.button
              whileHover={isRunning ? { scale: 1.02 } : {}}
              whileTap={isRunning ? { scale: 0.97 } : {}}
              onClick={isPaused ? onResume : onPause}
              disabled={!isRunning}
              style={{
                padding: '9px 0',
                background: !isRunning ? '#93c5fd' : '#2563eb',
                color: '#ffffff', border: 'none', borderRadius: 6,
                fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: !isRunning ? 'not-allowed' : 'pointer', transition: 'background 0.18s',
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onReset}
              style={{
                padding: '9px 0', background: '#dc2626',
                color: '#ffffff', border: 'none', borderRadius: 6,
                fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'background 0.18s',
              }}
            >
              Reset
            </motion.button>
          </div>
        </div>
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
            fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.18s',
          }}
        >
          {isLoading ? 'Running...' : 'Run Comparison'}
        </motion.button>
      )}
    </aside>
  )
}
