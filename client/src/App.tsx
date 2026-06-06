import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ModeSelector from './components/ModeSelector'
import Sidebar from './components/Sidebar'
import PanelCard from './components/PanelCard'
import NetworkVisualization from './components/NetworkVisualization'
import LadderDiagram from './components/LadderDiagram'
import MetricCards from './components/MetricCards'
import { ThroughputChart } from './components/ThroughputChart'
import EventTimeline from './components/EventTimeline'
import ComparisonPanel from './components/ComparisonPanel'
import LoadingOverlay from './components/LoadingOverlay'
import { useSimulation } from './hooks/useSimulation'
import { useComparison } from './hooks/useComparison'
import type { AppMode, Protocol, SimulationParams } from './types'
import './index.css'

const DEFAULT_PARAMS: SimulationParams = {
  totalPackets: 8,
  transmissionDelay: 500,
  ackDelay: 300,
  lossRate: 0.1,
  timeoutDuration: 1500,
  windowSize: 4,
  message: 'Hello from Sender!',
  simulateCorruption: false,
  simulateLateAck: false,
  simulateDuplicateAck: false,
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('simulation')
  const [protocol, setProtocol] = useState<Protocol>('stop-and-wait')
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)

  const sim = useSimulation()
  const cmp = useComparison()

  const handleModeChange = (m: AppMode) => {
    setMode(m)
    sim.reset()
    cmp.reset()
  }

  const handleStart = () => sim.run(protocol, params)
  const handleCompare = () => cmp.run(params)

  const isSimMode = mode === 'simulation'

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header style={{
        height: 56, background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Network icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5"  r="2.5" stroke="#2563eb" strokeWidth="1.8"/>
            <circle cx="5"  cy="19" r="2.5" stroke="#2563eb" strokeWidth="1.8"/>
            <circle cx="19" cy="19" r="2.5" stroke="#2563eb" strokeWidth="1.8"/>
            <line x1="12" y1="7.5"  x2="5"  y2="16.5" stroke="#2563eb" strokeWidth="1.5"/>
            <line x1="12" y1="7.5"  x2="19" y2="16.5" stroke="#2563eb" strokeWidth="1.5"/>
            <line x1="7.5" y1="19" x2="16.5" y2="19" stroke="#2563eb" strokeWidth="1.5"/>
          </svg>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 18, color: '#0f172a', letterSpacing: '-0.01em'
          }}>
            Network Protocol Simulator
            <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 14, marginLeft: 6 }}>
              v2.1
            </span>
          </span>
        </div>
        <ModeSelector mode={mode} onChange={handleModeChange} />
      </header>

      {/* ── Page wrapper ───────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '24px 28px 48px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: 24, alignItems: 'start'
      }}>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <Sidebar
          mode={mode}
          protocol={protocol}
          params={params}
          onProtocol={setProtocol}
          onParams={setParams}
          isRunning={sim.isRunning}
          isPaused={sim.isPaused}
          onStart={handleStart}
          onPause={sim.pause}
          onResume={sim.resume}
          onReset={sim.reset}
          onCompare={handleCompare}
          isLoading={sim.isLoading || cmp.isLoading}
        />

        {/* ── Main content ─────────────────────────────────────────── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

          {/* Error banner */}
          <AnimatePresence>
            {(sim.error || cmp.error) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  background: '#fef2f2', border: '1px solid #fca5a5',
                  borderRadius: 8, padding: '12px 16px',
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: '#b91c1c', fontWeight: 500
                }}
              >
                {sim.error || cmp.error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ══ SIMULATION MODE ════════════════════════════════════ */}
            {isSimMode && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >

                {/* Row 1: Network Viz + Ladder Diagram */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                  <PanelCard title="Network Visualization" style={{ position: 'relative', minHeight: 280 }}>
                    <AnimatePresence>
                      {sim.isLoading && <LoadingOverlay message="Fetching simulation data..." />}
                    </AnimatePresence>
                    <NetworkVisualization
                      events={sim.events}
                      protocol={protocol}
                      isRunning={sim.isRunning}
                    />
                  </PanelCard>

                  <PanelCard title="Time-Space Diagram">
                    <LadderDiagram events={sim.ladderEvents} />
                  </PanelCard>
                </div>

                {/* Row 2: Metric cards */}
                <MetricCards statistics={sim.statistics} />

                {/* Row 3: Throughput chart + Event timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                  <PanelCard title="Throughput">
                    <ThroughputChart
                      data={sim.throughput}
                      totalPackets={params.totalPackets}
                    />
                  </PanelCard>

                  <PanelCard title="Event Log">
                    <EventTimeline events={sim.events} />
                  </PanelCard>
                </div>

              </motion.div>
            )}

            {/* ══ ANALYSIS / COMPARISON MODE ═════════════════════════ */}
            {!isSimMode && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ position: 'relative', minHeight: 300 }}
              >
                <AnimatePresence>
                  {cmp.isLoading && <LoadingOverlay message="Running SAW and GBN comparison..." />}
                </AnimatePresence>

                {!cmp.result && !cmp.isLoading && (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    height: 320, gap: 14,
                    border: '2px dashed #e2e8f0', borderRadius: 10
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
                      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
                      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
                      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="1.5"/>
                    </svg>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 14,
                      color: '#94a3b8', textAlign: 'center', lineHeight: 1.6
                    }}>
                      Configure parameters in the sidebar and click<br />
                      <strong style={{ color: '#475569' }}>Run Comparison</strong> to compare protocols side-by-side.
                    </p>
                  </div>
                )}

                {cmp.result && <ComparisonPanel result={cmp.result} />}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
