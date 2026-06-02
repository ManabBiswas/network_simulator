import { motion } from 'framer-motion'

interface StatisticData {
  packetsSent: number
  acksReceived: number
  retransmissions: number
  totalTime: number
  efficiency: number | string
}

interface StatisticsProps {
  statistics: StatisticData
}

const Statistics: React.FC<StatisticsProps> = ({ statistics }) => {
  const statItems = [
    { label: 'Packets Sent', value: statistics.packetsSent },
    { label: 'ACKs Received', value: statistics.acksReceived },
    { label: 'Retransmissions', value: statistics.retransmissions },
    { label: 'Efficiency', value: `${statistics.efficiency}%` }
  ]

  return (
    <div className="stats-grid">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <h3>{stat.label}</h3>
          <div className="value">{stat.value}</div>
        </motion.div>
      ))}
    </div>
  )
}

export default Statistics
