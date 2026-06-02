import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import ProtocolSelector from './components/ProtocolSelector'
import SimulationControls from './components/SimulationControls'
import NetworkVisualization from './components/NetworkVisualization'
import MessageInput from './components/MessageInput'
import EventTimeline from './components/EventTimeline'
import Statistics from './components/Statistics'
import EdgeCaseOptions from './components/EdgeCaseOptions'
import './App.css'

interface Statistic {
  packetsSent: number
  acksReceived: number
  retransmissions: number
  totalTime: number
  efficiency: number | string
}

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

interface SimulationEvent {
  time: number
  event_type: string
  packet_num?: number
  description: string
}

interface SimulationData {
  events: SimulationEvent[]
  statistics: {
    total_packets: number
    total_packets_sent: number
    acks_received: number
    retransmissions: number
    total_time: number
  }
}

function App() {
  const [protocol, setProtocol] = useState<'stop-and-wait' | 'go-back-n'>('stop-and-wait')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [message, setMessage] = useState('Hello from Sender!')
  const [packets, setPackets] = useState<SimulationEvent[]>([])
  const [events, setEvents] = useState<SimulationEvent[]>([])
  const [statistics, setStatistics] = useState<Statistic>({
    packetsSent: 0,
    acksReceived: 0,
    retransmissions: 0,
    totalTime: 0,
    efficiency: 0
  })
  
  // FIX 1: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout for browser compatibility
  const activeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPausedRef = useRef(false)
  
  const [parameters, setParameters] = useState<Parameters>({
    totalPackets: 5,
    transmissionDelay: 500,
    ackDelay: 300,
    lossRate: 0.1,
    timeoutDuration: 1500,
    windowSize: 3,
    showEdgeCases: true,
    simulatePacketCorruption: false,
    simulateLateACK: false,
    simulateDuplicateACK: false
  })

  // FIX 2: Move playSimulation ABOVE handleStartSimulation so it is declared before use
  const playSimulation = useCallback((data: SimulationData) => {
    const fetchedEvents = data.events
    let eventIndex = 0

    const playNextEvent = async () => {
      // Check if we hit the end of the simulation
      if (eventIndex >= fetchedEvents.length) {
        setIsRunning(false)
        if (data.statistics) {
          setStatistics({
            packetsSent: data.statistics.total_packets_sent,
            acksReceived: data.statistics.acks_received,
            retransmissions: data.statistics.retransmissions,
            totalTime: data.statistics.total_time,
            efficiency: ((data.statistics.total_packets / data.statistics.total_packets_sent) * 100).toFixed(2)
          })
        }
        return
      }

      // If paused, just re-poll in 100ms without incrementing the index
      if (isPausedRef.current) {
        activeTimeoutRef.current = setTimeout(playNextEvent, 100)
        return
      }

      const currentEvent = fetchedEvents[eventIndex]

      setEvents(prev => [...prev, currentEvent])
      setPackets(prev => [...prev, currentEvent])

      // Calculate delay until the next event
      let delay = 50
      if (eventIndex < fetchedEvents.length - 1) {
        const nextTime = fetchedEvents[eventIndex + 1].time || 0
        const currentTime = currentEvent.time || 0
        // Cap the delay visually so the user isn't staring at nothing during a long timeout
        delay = Math.max(Math.min(nextTime - currentTime, 400), 50)
      }

      eventIndex++
      
      // Schedule the next event
      activeTimeoutRef.current = setTimeout(playNextEvent, delay)
    }

    // Kick off the playback loop
    playNextEvent()
  }, [])

  const handleStartSimulation = useCallback(async () => {
    // Clear any existing timeouts before starting a new run
    if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current)
    
    setIsRunning(true)
    setIsPaused(false)
    isPausedRef.current = false
    setEvents([])
    setPackets([])

    const params = {
      protocol,
      total_packets: parameters.totalPackets,
      transmission_delay: parameters.transmissionDelay,
      ack_delay: parameters.ackDelay,
      loss_rate: parameters.lossRate,
      timeout_duration: parameters.timeoutDuration,
      window_size: protocol === 'go-back-n' ? parameters.windowSize : 1,
      message: message,
      simulate_edge_cases: parameters.showEdgeCases,
      simulate_corruption: parameters.simulatePacketCorruption,
      simulate_late_ack: parameters.simulateLateACK,
      simulate_duplicate_ack: parameters.simulateDuplicateACK
    }

    try {
      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data: SimulationData = await response.json()
      playSimulation(data)
    } catch (error) {
      console.error('Error fetching simulation:', error)
      alert('Could not connect to backend. Make sure the server is running on port 5000.')
      setIsRunning(false)
    }
  }, [protocol, parameters, message, playSimulation])

  const handlePauseResume = () => {
    const nextPauseState = !isPaused
    setIsPaused(nextPauseState)
    isPausedRef.current = nextPauseState // Sync ref for the timeout closure to read
  }

  const handleReset = () => {
    // Kill the engine
    if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current)
    
    setIsRunning(false)
    setIsPaused(false)
    isPausedRef.current = false
    setPackets([])
    setEvents([])
    setStatistics({
      packetsSent: 0,
      acksReceived: 0,
      retransmissions: 0,
      totalTime: 0,
      efficiency: 0
    })
  }

  return (
    <div className="app-container">
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>🌐 Network Protocol Simulator</h1>
        <p>Real-time visualization of Stop-and-Wait and Go-Back-N protocols with custom messaging</p>
      </motion.header>

      <main className="app-main">
        <div className="controls-section">
          <ProtocolSelector 
            protocol={protocol} 
            onProtocolChange={setProtocol}
            disabled={isRunning}
          />
          
          <MessageInput 
            message={message}
            onMessageChange={setMessage}
            disabled={isRunning}
          />

          <SimulationControls
            parameters={parameters}
            onParametersChange={setParameters}
            disabled={isRunning}
            protocol={protocol}
          />

          <EdgeCaseOptions
            parameters={parameters}
            onParametersChange={setParameters}
            disabled={isRunning}
          />

          <div className="button-group">
            <motion.button
              className="btn btn-primary"
              onClick={handleStartSimulation}
              disabled={isRunning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRunning ? 'Running...' : 'Start Simulation'}
            </motion.button>
            
            <motion.button
              className="btn btn-secondary"
              onClick={handlePauseResume}
              disabled={!isRunning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </motion.button>
            
            <motion.button
              className="btn btn-danger"
              onClick={handleReset}
              disabled={!isRunning && events.length === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </div>
        </div>

        <div className="visualization-section">
          <NetworkVisualization 
            packets={packets}
            protocol={protocol}
            message={message}
            events={events}
          />
          
          <Statistics statistics={statistics} />
        </div>

        <EventTimeline events={events} />
      </main>
    </div>
  )
}

export default App