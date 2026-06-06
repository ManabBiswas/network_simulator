import { motion } from 'framer-motion'
import type { ComparisonResult } from '../types'
import LadderDiagram from './LadderDiagram'
import MetricCards from './MetricCards'
import PanelCard from './PanelCard'
import { ComparisonThroughputChart } from './ThroughputChart'
import { COLORS } from '../constants/theme'

interface Props {
  result: ComparisonResult
}

function ColHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12
    }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#1e293b'
      }}>{label}</span>
    </div>
  )
}

export default function ComparisonPanel({ result }: Props) {
  const { stop_and_wait: saw, go_back_n: gbn } = result

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Row 1: Two ladder diagrams side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <PanelCard title="Stop-and-Wait — Time-Space Diagram">
          <ColHeader label="Stop-and-Wait" color={COLORS.blue} />
          <LadderDiagram events={saw.ladder_events} />
        </PanelCard>
        <PanelCard title="Go-Back-N — Time-Space Diagram">
          <ColHeader label="Go-Back-N" color={COLORS.violet} />
          <LadderDiagram events={gbn.ladder_events} />
        </PanelCard>
      </div>

      {/* Row 2: Metrics side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
            color: COLORS.blue, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>Stop-and-Wait Metrics</span>
          <MetricCards statistics={saw.statistics} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
            color: COLORS.violet, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>Go-Back-N Metrics</span>
          <MetricCards statistics={gbn.statistics} />
        </div>
      </div>

      {/* Row 3: Dual throughput chart */}
      <PanelCard title="Throughput Comparison">
        <ComparisonThroughputChart
          sawData={saw.throughput}
          gbnData={gbn.throughput}
          totalPackets={saw.statistics.total_packets}
        />
      </PanelCard>

      {/* Summary table */}
      <PanelCard title="Summary">
        <table style={{ width: '100%', borderCollapse: 'collapse',
          fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8',
                fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Metric</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', color: COLORS.blue,
                fontWeight: 600 }}>Stop-and-Wait</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', color: COLORS.violet,
                fontWeight: 600 }}>Go-Back-N</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', color: '#374151',
                fontWeight: 600 }}>Winner</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: 'Total Packets Sent',
                saw: saw.statistics.total_packets_sent,
                gbn: gbn.statistics.total_packets_sent,
                lowerBetter: true
              },
              {
                label: 'Retransmissions',
                saw: saw.statistics.retransmissions,
                gbn: gbn.statistics.retransmissions,
                lowerBetter: true
              },
              {
                label: 'Total Time (ms)',
                saw: saw.statistics.total_time,
                gbn: gbn.statistics.total_time,
                lowerBetter: true
              },
              {
                label: 'Efficiency (%)',
                saw: saw.statistics.efficiency,
                gbn: gbn.statistics.efficiency,
                lowerBetter: false
              },
            ].map((row, i) => {
              const sawWins = row.lowerBetter
                ? row.saw <= row.gbn
                : row.saw >= row.gbn
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9',
                  background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '10px 12px', color: '#374151', fontWeight: 500 }}>
                    {row.label}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center',
                    color: sawWins ? COLORS.green : '#374151', fontWeight: sawWins ? 600 : 400 }}>
                    {typeof row.saw === 'number' && !Number.isInteger(row.saw)
                      ? row.saw.toFixed(1) : row.saw}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center',
                    color: !sawWins ? COLORS.green : '#374151', fontWeight: !sawWins ? 600 : 400 }}>
                    {typeof row.gbn === 'number' && !Number.isInteger(row.gbn)
                      ? row.gbn.toFixed(1) : row.gbn}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      background: sawWins ? COLORS.blueMid : '#ede9fe',
                      color: sawWins ? COLORS.blue : COLORS.violet,
                      padding: '2px 10px', borderRadius: 20,
                      fontWeight: 600, fontSize: 11
                    }}>
                      {sawWins ? 'SAW' : 'GBN'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </PanelCard>
    </motion.div>
  )
}
