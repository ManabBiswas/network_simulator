import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface SimulationEvent {
  time: number
  event_type: string
  packet_num?: number
  description: string
}

interface EventTimelineProps {
  events: SimulationEvent[]
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [events])

  const getEventColor = (eventType: string): string => {
    switch (eventType) {
      case 'send':
        return 'send'
      case 'ack':
        return 'ack'
      case 'retransmit':
        return 'retransmit'
      case 'timeout':
        return 'timeout'
      case 'loss':
        return 'loss'
      default:
        return 'send'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '1.5em', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
        📋 Event Timeline
      </h2>
      <div className="timeline-container" ref={containerRef}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px', fontStyle: 'italic' }}>
            Events will appear here during simulation
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={index}
              className={`event-item ${getEventColor(event.event_type)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="event-time">[{event.time.toFixed(0)}ms]</span>
              {event.description}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default EventTimeline
