import { motion } from 'framer-motion'

interface MessageInputProps {
  message: string
  onMessageChange: (message: string) => void
  disabled: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ message, onMessageChange, disabled }) => {
  return (
    <motion.div
      className="control-group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <label htmlFor="message">Message to Send:</label>
      <textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter the message that sender wants to transmit..."
      />
      <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
        Message will be divided into {Math.ceil(message.length / 10)} packets
      </p>
    </motion.div>
  )
}

export default MessageInput
