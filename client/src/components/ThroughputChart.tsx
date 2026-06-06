import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import type { ThroughputPoint } from '../types'
import { COLORS } from '../constants/theme'

interface SingleProps {
  data: ThroughputPoint[]
  totalPackets: number
}

export function ThroughputChart({ data, totalPackets }: SingleProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          tick={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Time (ms)', position: 'insideBottom', offset: -14,
            fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fill: '#94a3b8' }}
          allowDecimals={false}
          domain={[0, totalPackets || 'auto']}
          label={{ value: 'Delivered', angle: -90, position: 'insideLeft',
            fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif', dx: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 6, fontSize: 12, fontFamily: 'Inter, sans-serif'
          }}
          labelFormatter={(v: number) => `${v} ms`}
          formatter={(v: number) => [`${v} packets`, 'Delivered']}
        />
        <Line
          type="monotone" dataKey="delivered"
          stroke={COLORS.blue} strokeWidth={2}
          dot={false} isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Comparison dual-line chart ────────────────────────────────────────────────

interface ComparisonPoint {
  time: number
  saw?: number
  gbn?: number
}

interface ComparisonProps {
  sawData: ThroughputPoint[]
  gbnData: ThroughputPoint[]
  totalPackets: number
}

function mergeForComparison(saw: ThroughputPoint[], gbn: ThroughputPoint[]): ComparisonPoint[] {
  const timeSet = new Set([...saw.map(p => p.time), ...gbn.map(p => p.time)])
  const times = Array.from(timeSet).sort((a, b) => a - b)
  const sawMap = new Map(saw.map(p => [p.time, p.delivered]))
  const gbnMap = new Map(gbn.map(p => [p.time, p.delivered]))

  // Forward-fill
  let lastSaw = 0, lastGbn = 0
  return times.map(t => {
    if (sawMap.has(t)) lastSaw = sawMap.get(t)!
    if (gbnMap.has(t)) lastGbn = gbnMap.get(t)!
    return { time: t, saw: lastSaw, gbn: lastGbn }
  })
}

export function ComparisonThroughputChart({ sawData, gbnData, totalPackets }: ComparisonProps) {
  const merged = mergeForComparison(sawData, gbnData)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={merged} margin={{ top: 5, right: 20, left: 0, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          tick={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Time (ms)', position: 'insideBottom', offset: -14,
            fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fill: '#94a3b8' }}
          allowDecimals={false}
          domain={[0, totalPackets || 'auto']}
          label={{ value: 'Delivered', angle: -90, position: 'insideLeft',
            fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif', dx: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 6, fontSize: 12, fontFamily: 'Inter, sans-serif'
          }}
          labelFormatter={(v: number) => `${v} ms`}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748b', paddingTop: 8 }}
        />
        <Line
          type="monotone" dataKey="saw" name="Stop-and-Wait"
          stroke={COLORS.blue} strokeWidth={2} dot={false} isAnimationActive={false}
        />
        <Line
          type="monotone" dataKey="gbn" name="Go-Back-N"
          stroke={COLORS.violet} strokeWidth={2} dot={false} isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
