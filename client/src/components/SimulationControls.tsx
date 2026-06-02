import { motion } from 'framer-motion'

interface Parameters {
  totalPackets: number
  transmissionDelay: number
  ackDelay: number
  lossRate: number
  timeoutDuration: number
  windowSize: number
  showEdgeCases: boolean
  simulatePacketCorruption: boolean
  simulateLateACK: boolean
  simulateDuplicateACK: boolean
}

interface SimulationControlsProps {
  parameters: Parameters
  onParametersChange: (parameters: Parameters) => void
  disabled: boolean
  protocol: 'stop-and-wait' | 'go-back-n'
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  parameters, 
  onParametersChange, 
  disabled, 
  protocol 
}) => {
  const handleChange = (key: keyof Parameters, value: number | boolean) => {
    onParametersChange({
      ...parameters,
      [key]: value
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="control-group">
        <label htmlFor="totalPackets">Total Packets (1-20):</label>
        <input
          type="number"
          id="totalPackets"
          value={parameters.totalPackets}
          onChange={(e) => handleChange('totalPackets', Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          min="1"
          max="20"
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label htmlFor="transmissionDelay">Transmission Delay (ms):</label>
        <input
          type="number"
          id="transmissionDelay"
          value={parameters.transmissionDelay}
          onChange={(e) => handleChange('transmissionDelay', Math.max(100, Math.min(2000, parseInt(e.target.value) || 500)))}
          min="100"
          max="2000"
          step="100"
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label htmlFor="ackDelay">ACK Delay (ms):</label>
        <input
          type="number"
          id="ackDelay"
          value={parameters.ackDelay}
          onChange={(e) => handleChange('ackDelay', Math.max(50, Math.min(1000, parseInt(e.target.value) || 300)))}
          min="50"
          max="1000"
          step="50"
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label htmlFor="lossRate">Packet Loss Rate: {Math.round(parameters.lossRate * 100)}%</label>
        <input
          type="range"
          id="lossRate"
          value={parameters.lossRate * 100}
          onChange={(e) => handleChange('lossRate', parseInt(e.target.value) / 100)}
          min="0"
          max="100"
          step="5"
          disabled={disabled}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
      </div>

      <div className="control-group">
        <label htmlFor="timeoutDuration">Timeout Duration (ms):</label>
        <input
          type="number"
          id="timeoutDuration"
          value={parameters.timeoutDuration}
          onChange={(e) => handleChange('timeoutDuration', Math.max(500, Math.min(5000, parseInt(e.target.value) || 1500)))}
          min="500"
          max="5000"
          step="100"
          disabled={disabled}
        />
      </div>

      {protocol === 'go-back-n' && (
        <div className="control-group">
          <label htmlFor="windowSize">Window Size (1-10):</label>
          <input
            type="number"
            id="windowSize"
            value={parameters.windowSize}
            onChange={(e) => handleChange('windowSize', Math.max(1, Math.min(10, parseInt(e.target.value) || 3)))}
            min="1"
            max="10"
            disabled={disabled}
          />
        </div>
      )}
    </motion.div>
  )
}

export default SimulationControls
