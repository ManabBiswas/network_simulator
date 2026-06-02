import { motion } from 'framer-motion'

interface Parameters {
  showEdgeCases: boolean
  simulatePacketCorruption: boolean
  simulateLateACK: boolean
  simulateDuplicateACK: boolean
  totalPackets: number
  transmissionDelay: number
  ackDelay: number
  lossRate: number
  timeoutDuration: number
  windowSize: number
}

interface EdgeCaseOptionsProps {
  parameters: Parameters
  onParametersChange: (parameters: Parameters) => void
  disabled: boolean
}

const EdgeCaseOptions: React.FC<EdgeCaseOptionsProps> = ({ parameters, onParametersChange, disabled }) => {
  const handleChange = (key: keyof Parameters, value: boolean) => {
    onParametersChange({
      ...parameters,
      [key]: value
    })
  }

  return (
    <motion.div
      className="edge-case-options"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3>🎯 Edge Cases & Anomalies</h3>
      
      <div className="checkbox-group">
        <input
          type="checkbox"
          id="showEdgeCases"
          checked={parameters.showEdgeCases}
          onChange={(e) => handleChange('showEdgeCases', e.target.checked)}
          disabled={disabled}
        />
        <label htmlFor="showEdgeCases">Show edge cases</label>
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="simulateCorruption"
          checked={parameters.simulatePacketCorruption}
          onChange={(e) => handleChange('simulatePacketCorruption', e.target.checked)}
          disabled={disabled}
        />
        <label htmlFor="simulateCorruption">Simulate packet corruption</label>
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="simulateLateACK"
          checked={parameters.simulateLateACK}
          onChange={(e) => handleChange('simulateLateACK', e.target.checked)}
          disabled={disabled}
        />
        <label htmlFor="simulateLateACK">Simulate late/delayed ACK</label>
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="simulateDuplicateACK"
          checked={parameters.simulateDuplicateACK}
          onChange={(e) => handleChange('simulateDuplicateACK', e.target.checked)}
          disabled={disabled}
        />
        <label htmlFor="simulateDuplicateACK">Simulate duplicate ACK</label>
      </div>
    </motion.div>
  )
}

export default EdgeCaseOptions
