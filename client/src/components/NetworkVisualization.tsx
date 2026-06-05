import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import './NetworkVisualization.css'

interface SimulationEvent {
  time: number
  event_type: string
  packet_num?: number
  description: string
}

interface NetworkVisualizationProps {
  packets: SimulationEvent[]
  protocol: 'stop-and-wait' | 'go-back-n'
  message: string
  events: SimulationEvent[]
}

interface AnimatingPacket {
  id: string
  packetNum: number
  direction: 'right' | 'left'
  type: 'send' | 'ack' | 'retransmit'
  startTime: number
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ 
  packets, 
  protocol, 
  message, 
  events 
}) => {
  const [animatingPackets, setAnimatingPackets] = useState<AnimatingPacket[]>([])
  // We use this ref to track which packets we've already animated so we don't skip any if React batches updates
  const lastProcessedIndex = useRef<number>(-1)

  useEffect(() => {
    // If the simulation is reset, reset our index tracker
    if (packets.length === 0) {
      lastProcessedIndex.current = -1
      return
    }

    // Extract only the new packets that haven't been animated yet
    const newPackets = packets.slice(lastProcessedIndex.current + 1)
    
    if (newPackets.length > 0) {
      const newAnimations: AnimatingPacket[] = []

      newPackets.forEach(packet => {
        if (packet.event_type === 'send' || packet.event_type === 'retransmit') {
          newAnimations.push({
            id: `${packet.packet_num}-${packet.event_type}-${Date.now()}-${Math.random()}`,
            packetNum: packet.packet_num || 0,
            direction: 'right',
            type: packet.event_type === 'retransmit' ? 'retransmit' : 'send',
            startTime: Date.now()
          })
        } else if (packet.event_type === 'ack') {
          newAnimations.push({
            id: `ack-${packet.packet_num}-${Date.now()}-${Math.random()}`,
            packetNum: packet.packet_num || 0,
            direction: 'left',
            type: 'ack',
            startTime: Date.now()
          })
        }
      })

      if (newAnimations.length > 0) {
        // Break the synchronous render cascade by queueing the update for the next frame
        requestAnimationFrame(() => {
          setAnimatingPackets(prev => [...prev, ...newAnimations])
        })
        
        // Clean them up after the animation finishes (0.8s animation + buffer)
        setTimeout(() => {
          setAnimatingPackets(prev => prev.filter(p => !newAnimations.some(na => na.id === p.id)))
        }, 1000)
      }

      // Update the tracker so we don't process these again
      lastProcessedIndex.current = packets.length - 1
    }
  }, [packets])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
    >
      <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '1.5em', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
        🔄 Network Transmission
      </h2>
      <div className="visualization-container">
        <svg width="100%" height="400" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrowSend" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#FF9800" />
            </marker>
            <marker id="arrowAck" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
            </marker>
            <marker id="arrowRetransmit" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#f44336" />
            </marker>
          </defs>

          <line x1="80" y1="100" x2="80" y2="300" stroke="#ccc" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="920" y1="100" x2="920" y2="300" stroke="#ccc" strokeWidth="2" strokeDasharray="5,5" />

          <rect x="30" y="150" width="100" height="100" fill="#4CAF50" rx="8" />
          <text x="80" y="205" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            SENDER
          </text>

          <rect x="870" y="150" width="100" height="100" fill="#2196F3" rx="8" />
          <text x="920" y="205" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
            RECEIVER
          </text>

          <text x="500" y="30" textAnchor="middle" fill="#667eea" fontSize="18" fontWeight="600">
            {protocol === 'stop-and-wait' ? '⏸ Stop-and-Wait Protocol' : '🔄 Go-Back-N Protocol'}
          </text>

          <rect x="250" y="320" width="500" height="60" fill="#f8f9fa" stroke="#e0e0e0" strokeWidth="2" rx="4" />
          <text x="500" y="338" textAnchor="middle" fill="#666" fontSize="12">
            Message: {message.substring(0, 50)}{message.length > 50 ? '...' : ''}
          </text>
          <text x="500" y="360" textAnchor="middle" fill="#999" fontSize="11">
            {message.length} characters
          </text>

          {animatingPackets.map(packet => (
            <motion.g key={packet.id}>
              {packet.direction === 'right' ? (
                <>
                  <motion.line
                    x1="130"
                    y1="200"
                    x2="870"
                    y2="200"
                    stroke={packet.type === 'retransmit' ? '#f44336' : '#FF9800'}
                    strokeWidth="2"
                    markerEnd={packet.type === 'retransmit' ? 'url(#arrowRetransmit)' : 'url(#arrowSend)'}
                    strokeDasharray={packet.type === 'retransmit' ? '5,5' : '0'}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.circle
                    cx="130"
                    cy="200"
                    r="12"
                    fill={packet.type === 'retransmit' ? '#f44336' : '#FF9800'}
                    animate={{ cx: 870 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.text
                    x="130"
                    y="205"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="600"
                    animate={{ x: 870 }}
                    transition={{ duration: 0.8 }}
                  >
                    P{packet.packetNum}
                  </motion.text>
                </>
              ) : (
                <>
                  <motion.line
                    x1="870"
                    y1="240"
                    x2="130"
                    y2="240"
                    stroke="#4CAF50"
                    strokeWidth="2"
                    markerEnd="url(#arrowAck)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.circle
                    cx="870"
                    cy="240"
                    r="12"
                    fill="#4CAF50"
                    animate={{ cx: 130 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.text
                    x="870"
                    y="245"
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    animate={{ x: 130 }}
                    transition={{ duration: 0.8 }}
                  >
                    ACK{packet.packetNum}
                  </motion.text>
                </>
              )}
            </motion.g>
          ))}
        </svg>
      </div>

      {events.length > 0 && (
        <motion.div
          style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p style={{ color: '#333', fontSize: '0.95em' }}>
            <strong>Last Event:</strong> {events[events.length - 1]?.description}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default NetworkVisualization