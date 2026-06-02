# Network Protocol Simulator

An interactive web-based simulator for network flow control protocols, specifically demonstrating **Stop-and-Wait** and **Go-Back-N** protocols with real-time visualization.

## Features

- **Interactive Web Interface**: Real-time visualization of packet transmission and acknowledgment
- **Two Protocols**: 
  - Stop-and-Wait: Simple one-packet-at-a-time protocol
  - Go-Back-N: Sliding window protocol with configurable window size
- **Customizable Parameters**:
  - Number of packets
  - Transmission and ACK delays
  - Packet loss rate
  - Timeout duration
  - Window size (for Go-Back-N)
- **Real-time Visualization**: Watch packets being sent, lost, retransmitted, and acknowledged
- **Performance Metrics**: Track efficiency, retransmissions, and success rates
- **Event Timeline**: Detailed log of all protocol events

## Project Structure

```
network_simulator/
├── frontend/
│   ├── index.html              # Main web interface
│   ├── css/
│   │   └── style.css           # Styling and layout
│   └── js/
│       ├── main.js             # Core simulation logic
│       └── visualization.js    # SVG visualization utilities
├── backend/
│   ├── app.py                  # Flask server
│   └── protocols/
│       ├── stop_and_wait.py    # Stop-and-Wait implementation
│       └── go_back_n.py        # Go-Back-N implementation
└── requirements.txt            # Python dependencies
```

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup Steps

1. **Clone or navigate to the project directory**:
   ```bash
   cd network_simulator
   ```

2. **Create a virtual environment (optional but recommended)**:
   ```bash
   python -m venv venv
   # Activate it:
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. **Start the Flask backend server**:
   ```bash
   cd backend
   python app.py
   ```
   
   The server will start on `http://localhost:5000`

2. **Open your web browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **Select a protocol** and configure parameters using the control panel
4. **Click "Start Simulation"** to begin
5. Watch the real-time visualization and events

## Using the Simulator

### Control Panel

- **Protocol Selection**: Choose between Stop-and-Wait and Go-Back-N
- **Total Packets**: Number of packets to transmit (1-20)
- **Transmission Delay**: Time to send each packet (100-2000 ms)
- **ACK Delay**: Time to receive acknowledgment (50-1000 ms)
- **Window Size**: For Go-Back-N, number of packets that can be in flight (1-10)
- **Packet Loss Rate**: Probability of packet loss (0-100%)
- **Timeout Duration**: Time to wait before retransmitting (500-5000 ms)

### Understanding the Visualization

- **Green boxes**: Sender and Receiver endpoints
- **Orange dots**: Packets being transmitted
- **Green dots**: Acknowledgments
- **Timeline**: Shows all events (sends, ACKs, timeouts, retransmissions)
- **Statistics**: Real-time metrics including efficiency calculation

### Statistics

- **Total Packets Sent**: Includes retransmissions
- **Total ACKs Received**: Number of successful acknowledgments
- **Retransmissions**: Packets sent multiple times
- **Efficiency**: (Total packets) / (Total sent) × 100%

## Protocol Details

### Stop-and-Wait

The simplest flow control mechanism:

1. Sender transmits one packet
2. Sender waits for acknowledgment
3. If ACK received within timeout, go to step 1 with next packet
4. If timeout, retransmit the same packet
5. Repeat until all packets acknowledged

**Characteristics**:
- Low throughput (typically 50% utilization on high-latency links)
- Simple implementation
- Good for low-bandwidth, high-latency links

### Go-Back-N

An improved sliding window protocol:

1. Sender can transmit up to N packets without waiting for ACKs
2. Receiver sends cumulative ACK for correctly received packets
3. On timeout or negative ACK, sender retransmits all unacknowledged packets
4. Repeat until all packets acknowledged

**Characteristics**:
- Much higher throughput than Stop-and-Wait
- More complex implementation
- Better for high-bandwidth links
- Configurable window size for tuning performance

## API Endpoints

### POST /api/simulate

Run a protocol simulation with specified parameters.

**Request Body**:
```json
{
  "protocol": "stop-and-wait",
  "total_packets": 5,
  "transmission_delay": 500,
  "ack_delay": 300,
  "loss_rate": 0.1,
  "timeout_duration": 1500,
  "window_size": 1
}
```

**Response**:
```json
{
  "events": [
    {
      "time": 0,
      "event_type": "send",
      "packet_num": 0,
      "description": "Send Packet 0"
    },
    ...
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

Get list of available protocols.

**Response**:
```json
{
  "protocols": [
    {
      "name": "Stop-and-Wait",
      "id": "stop-and-wait",
      "description": "Simple flow control: send one packet, wait for ACK"
    },
    {
      "name": "Go-Back-N",
      "id": "go-back-n",
      "description": "Sliding window protocol: send multiple packets, wait for cumulative ACK"
    }
  ]
}
```

### GET /api/health

Health check endpoint.

**Response**:
```json
{
  "status": "ok"
}
```

## Troubleshooting

### Connection refused error
- Make sure Flask server is running on port 5000
- Check firewall settings
- Try accessing http://localhost:5000 directly in browser

### Simulation doesn't start
- Check browser console for errors (F12 → Console tab)
- Verify Flask server is running and not showing errors
- Try refreshing the page

### Port 5000 already in use
- Find and stop the process using port 5000
- Or modify the port in `backend/app.py` and frontend `js/main.js`

## Performance Considerations

- Simulations with many packets and high loss rates may take longer
- Browser performance depends on visualization complexity
- Recommended: Keep total packets under 20 for smooth visualization

## Future Enhancements

- Selective Repeat protocol implementation
- 3-way handshake TCP simulation
- Network delay simulation (jitter)
- Export simulation results to CSV
- Real packet data visualization
- QUIC protocol implementation
- Congestion control algorithms

## Educational Use

This simulator is ideal for:
- Understanding network protocol basics
- Learning about flow control mechanisms
- Studying the impact of packet loss and latency
- Comparing protocol efficiency
- Network course projects and assignments

## References

- [Computer Networks: A Top-Down Approach](https://www.pearson.com/us/higher-education/program/Kurose-Computer-Networks-7-th-Edition/PGM2877179.html)
- [RFC 793: Transmission Control Protocol](https://tools.ietf.org/html/rfc793)
- [Go-Back-N Protocol Overview](https://en.wikipedia.org/wiki/Go-Back-N_ARQ)

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please check:
1. The troubleshooting section above
2. Browser console logs (F12)
3. Flask server output logs
