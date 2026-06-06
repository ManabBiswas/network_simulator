export const COLORS = {
  // Backgrounds
  pageBg: '#ffffff',
  sidebarBg: '#f8fafc',
  panelBg: '#ffffff',
  hoverBg: '#f1f5f9',

  // Borders
  border: '#e2e8f0',
  borderInput: '#cbd5e1',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textLabel: '#374151',
  sectionHeader: '#1e293b',

  // Brand
  blue: '#2563eb',
  blueDark: '#1d4ed8',
  blueLight: '#eff6ff',
  blueMid: '#dbeafe',

  // Semantic
  green: '#16a34a',
  greenLight: '#dcfce7',
  orange: '#ea580c',
  orangeLight: '#fff7ed',
  red: '#dc2626',
  redLight: '#fef2f2',
  amber: '#d97706',
  amberLight: '#fffbeb',
  violet: '#7c3aed',
  violetLight: '#faf5ff',

  // Packet types
  packetSend: '#2563eb',
  packetAck: '#16a34a',
  packetLost: '#dc2626',
  packetRetransmit: '#ea580c',
  packetCorrupted: '#7c3aed',
  packetTimeout: '#d97706',

  // Ladder diagram
  ladderTimeline: '#cbd5e1',
} as const

export const TRANSITIONS = {
  panel: { duration: 0.3, ease: 'easeOut' as const },
  stagger: { staggerChildren: 0.08 },
  item: { duration: 0.35, ease: 'easeOut' as const },
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
  packetSpring: { type: 'spring' as const, stiffness: 90, damping: 18 },
  arrow: { duration: 0.4, ease: 'easeOut' as const },
  countUp: { duration: 0.8, ease: 'easeOut' as const },
} as const

export const EFFICIENCY_COLOR = (efficiency: number): string => {
  if (efficiency >= 80) return COLORS.green
  if (efficiency >= 50) return COLORS.amber
  return COLORS.red
}
