import { motion } from 'framer-motion'

interface ProtocolSelectorProps {
  protocol: 'stop-and-wait' | 'go-back-n'
  onProtocolChange: (protocol: 'stop-and-wait' | 'go-back-n') => void
  disabled: boolean
}

const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({ protocol, onProtocolChange, disabled }) => {
  return (
    <motion.div
      className="control-group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <label htmlFor="protocol">Select Protocol:</label>
      <select
        id="protocol"
        value={protocol}
        onChange={(e) => onProtocolChange(e.target.value as 'stop-and-wait' | 'go-back-n')}
        disabled={disabled}
      >
        <option value="stop-and-wait">Stop-and-Wait</option>
        <option value="go-back-n">Go-Back-N</option>
      </select>
      <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
        {protocol === 'stop-and-wait'
          ? 'Send one packet, wait for ACK'
          : 'Send multiple packets with sliding window'}
      </p>
    </motion.div>
  )
}

export default ProtocolSelector
