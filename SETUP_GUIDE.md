# Network Protocol Simulator - Setup & Usage Guide

## 📋 Project Structure

```
network1/
├── client/                          # React + TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtocolSelector.tsx       # Protocol selection component
│   │   │   ├── MessageInput.tsx           # Custom message input
│   │   │   ├── SimulationControls.tsx     # Simulation parameters
│   │   │   ├── EdgeCaseOptions.tsx        # Edge case configuration
│   │   │   ├── NetworkVisualization.tsx   # Network diagram animation
│   │   │   ├── EventTimeline.tsx          # Event log display
│   │   │   ├── Statistics.tsx             # Statistics dashboard
│   │   │   └── NetworkVisualization.css
│   │   ├── App.tsx                        # Main app component
│   │   ├── App.css                        # Application styling
│   │   ├── main.tsx                       # Entry point
│   │   └── index.css                      # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
├── backend/                         # Python Flask Backend
│   ├── app.py                       # Main Flask application
│   └── protocols/
│       ├── stop_and_wait.py         # Stop-and-Wait implementation
│       └── go_back_n.py             # Go-Back-N implementation
├── frontend/                        # Legacy frontend (can be archived)
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites

- **Node.js 16+** (for frontend)
- **Python 3.7+** (for backend)
- **npm or yarn** (for JavaScript dependencies)

### Step 1: Install Backend Dependencies

```bash
cd network1/backend
pip install -r ../requirements.txt
```

Or manually:
```bash
pip install Flask==2.3.2 flask-cors==4.0.0
```

### Step 2: Install Frontend Dependencies

```bash
cd network1/client
npm install
```

This will install:
- `react@18.2.0` - React library
- `react-dom@18.2.0` - React DOM
- `framer-motion@10.16.4` - Animation library
- `axios@1.6.2` - HTTP client
- `recharts@2.10.3` - Charting library
- `vite@4.4.0` - Build tool
- `@vitejs/plugin-react@4.0.0` - React Vite plugin
- TypeScript dependencies

## 🏃 Running the Application

### Terminal 1: Start Backend Server

```bash
cd network1/backend
python app.py
```

The backend will start on `http://localhost:5000`

You should see:
```
Network Protocol Simulator Backend
==================================
Starting Flask server on http://localhost:5000
Frontend available at http://localhost:5000/
...
Press Ctrl+C to stop the server
```

### Terminal 2: Start Frontend Development Server

```bash
cd network1/client
npm run dev
```

The frontend will start on `http://localhost:5173` (or next available port)

You should see:
```
  VITE v4.4.0  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Open in Browser

Navigate to: `http://localhost:5173`

## 📝 Using the Simulator

### 1. **Select Protocol**
- Choose between **Stop-and-Wait** or **Go-Back-N**
- Description changes based on selection

### 2. **Enter Message**
- Type any message in the "Message to Send" field
- The message will be divided into packets (10 chars per packet)
- Example: "Hello Network!" = 2 packets

### 3. **Configure Simulation Parameters**

| Parameter | Range | Description |
|-----------|-------|-------------|
| **Total Packets** | 1-20 | Number of packets to send |
| **Transmission Delay** | 100-2000 ms | Time to send one packet |
| **ACK Delay** | 50-1000 ms | Time to receive ACK |
| **Packet Loss Rate** | 0-100% | Probability of packet loss |
| **Timeout Duration** | 500-5000 ms | Wait time before retransmit |
| **Window Size** | 1-10 | (Go-Back-N only) Packets in flight |

### 4. **Configure Edge Cases** (Optional)
- ✅ **Show edge cases** - Simulate network anomalies
- ✅ **Simulate packet corruption** - Packets corrupted during transmission
- ✅ **Simulate late/delayed ACK** - ACKs arrive with extra delay
- ✅ **Simulate duplicate ACK** - Receiver sends duplicate ACKs

### 5. **Run Simulation**
- Click **"Start Simulation"**
- Animation shows packet transmission and ACKs
- **"Pause"** to pause/resume
- **"Reset"** to clear and start over

### 6. **Monitor Results**
- **Statistics Panel**: Real-time metrics
- **Event Timeline**: Detailed log of all events
- **Network Diagram**: Visual animation of packet flow

## 📊 Understanding the UI

### Header
- Shows protocol name (Stop-and-Wait or Go-Back-N)
- Displays message content being transmitted

### Left Panel (Controls)
- Protocol selection
- Message input
- Simulation parameters
- Edge case options
- Start/Pause/Reset buttons

### Right Panel (Visualization)
- Network diagram with sender and receiver
- Animated packet transmission
- Statistics cards
- Event timeline log

### Statistics Cards
- **Packets Sent**: Total packets sent (including retransmissions)
- **ACKs Received**: Number of successful acknowledgments
- **Retransmissions**: Packets sent more than once
- **Efficiency**: (Total packets / Packets sent) × 100%

## 🎓 Protocol Details

### Stop-and-Wait
```
Sender                          Receiver
  |                               |
  |-- Send P0 ------------------>|
  |                               |
  |<--- ACK0 -------------------|
  |                               |
  |-- Send P1 ------------------>|
  |                               |
  |<--- ACK1 -------------------|
  
Characteristics:
- Simple, reliable
- Low throughput
- Ideal for high-latency networks
```

### Go-Back-N
```
Sender                          Receiver
  |                               |
  |-- Send P0 ------------------>|
  |-- Send P1 ------------------>|
  |-- Send P2 ------------------>|
  |                               |
  |<--- ACK2 (Cumulative) ------|
  |                               |
  |-- Send P3 ------------------>|
  |-- Send P4 ------------------>|
  
Characteristics:
- Higher throughput
- Sliding window protocol
- Configurable window size
- Better for high-bandwidth links
```

## 🔧 Edge Cases Explained

### Packet Loss
- Packets or ACKs randomly lost during transmission
- Controlled by **Packet Loss Rate** slider
- Results in timeout and retransmission

### Packet Corruption
- Data corruption during transmission
- Receiver detects and requests retransmission
- Shows as "CORRUPTED" in timeline

### Late ACK
- ACKs arrive with additional delay
- May trigger timeout if delay exceeds timeout duration
- Shows processing delays realistically

### Duplicate ACK
- Receiver sends same ACK multiple times
- Can happen when multiple ACKs for same packet arrive
- Doesn't cause additional retransmissions in basic protocols

## 🐛 Troubleshooting

### "Could not connect to backend"
- ✅ Ensure Flask server is running on port 5000
- ✅ Check firewall settings
- ✅ Verify backend has no errors

### Frontend doesn't load
- ✅ Clear browser cache
- ✅ Check if port 5173 is available
- ✅ Run `npm install` again

### Animations not smooth
- ✅ Close unnecessary browser tabs
- ✅ Try different browser
- ✅ Check system resources

### Port already in use
- Backend: Change port in `backend/app.py` and update frontend config
- Frontend: Vite will auto-use next available port

## 📦 Building for Production

### Build Frontend
```bash
cd client
npm run build
```

This creates optimized build in `client/dist/`

### Deploy Backend
```bash
python app.py
```

Set environment variables for production:
```bash
export FLASK_ENV=production
export FLASK_DEBUG=0
```

## 🔌 API Endpoints

### POST /api/simulate
Runs a protocol simulation

**Request:**
```json
{
  "protocol": "stop-and-wait",
  "total_packets": 5,
  "transmission_delay": 500,
  "ack_delay": 300,
  "loss_rate": 0.1,
  "timeout_duration": 1500,
  "window_size": 1,
  "message": "Hello Network!",
  "simulate_edge_cases": true,
  "simulate_corruption": false,
  "simulate_late_ack": false,
  "simulate_duplicate_ack": false
}
```

**Response:**
```json
{
  "events": [
    {
      "time": 0,
      "event_type": "send",
      "packet_num": 0,
      "description": "Send Packet 0 | P0: Hello Ne"
    }
  ],
  "statistics": {
    "total_packets": 5,
    "total_packets_sent": 7,
    "acks_received": 5,
    "retransmissions": 2,
    "total_time": 8500
  }
}
```

### GET /api/protocols
Returns available protocols

### GET /api/health
Health check endpoint

## 🎨 Customization

### Colors
Edit `client/src/App.css` to change color scheme:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Accent color */
color: #667eea;
```

### Delays & Timings
Adjust simulation delays in simulation logic (frontend or backend)

### Window Size Range
Go-Back-N window size: 1-10 (configurable in SimulationControls.tsx)

## 📚 Learning Resources

- **Stop-and-Wait Protocol**: RFC 1121
- **Go-Back-N Protocol**: Computer Networks: A Top-Down Approach
- **Framer Motion**: https://www.framer.com/motion/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

## ✨ Features

✅ Real-time visualization with Framer Motion animations
✅ Custom message transmission
✅ Comprehensive edge case simulation
✅ Stop-and-Wait and Go-Back-N protocols
✅ TypeScript for type safety
✅ Responsive design
✅ Event timeline logging
✅ Performance statistics
✅ Pause/Resume functionality
✅ Easy parameter configuration

## 📝 Notes

- Simulation times are relative and scaled for visualization
- Real network delays would be much larger
- Loss rate affects both packets and ACKs
- Efficiency = (Total Packets) / (Total Sent) × 100%
  - Higher is better
  - Max: 100% (no retransmissions)
  - Min: 50% (lots of retransmissions)

## 🤝 Contributing

Feel free to extend with:
- Selective Repeat protocol
- TCP 3-way handshake
- QUIC protocol
- Network jitter simulation
- Real packet payload display
- Performance graphs

## 📄 License

Educational project - Use freely for learning purposes.
