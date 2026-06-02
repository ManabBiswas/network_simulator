# 🚀 Quick Start Reference Card

## Files at a Glance

### Frontend Components
| File | Purpose | Lines |
|------|---------|-------|
| `App.tsx` | Main app orchestration | ~350 |
| `ProtocolSelector.tsx` | Protocol dropdown | ~60 |
| `MessageInput.tsx` | Message input box | ~80 |
| `SimulationControls.tsx` | Parameter sliders | ~150 |
| `EdgeCaseOptions.tsx` | Edge case checkboxes | ~100 |
| `NetworkVisualization.tsx` | SVG packet animation | ~200 |
| `EventTimeline.tsx` | Event log | ~120 |
| `Statistics.tsx` | Metrics dashboard | ~100 |

### Configuration Files
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration (port 5173, proxy to :5000) |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `App.css` | Main styling |
| `index.css` | Global styles |

### Backend Files
| File | Purpose | Status |
|------|---------|--------|
| `app.py` | Flask API server | ✅ Complete |
| `stop_and_wait.py` | Stop-and-Wait protocol | ✅ Complete |
| `go_back_n.py` | Go-Back-N protocol | ✅ Complete |

## Commands

### Install Dependencies
```bash
# Frontend
cd client && npm install

# Backend
pip install -r requirements.txt
```

### Run Development Servers
```bash
# Terminal 1: Backend
cd backend && python app.py

# Terminal 2: Frontend (new terminal)
cd client && npm run dev
```

### Build for Production
```bash
cd client && npm run build
# Output: client/dist/
```

## Ports
- **Frontend Dev**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Frontend Production**: http://localhost:5000/static (after npm run build)

## Component Hierarchy

```
App
├── Header (protocol name + message)
├── ControlPanel
│   ├── ProtocolSelector
│   ├── MessageInput
│   ├── SimulationControls
│   └── EdgeCaseOptions
├── Controls (Start, Pause, Reset buttons)
└── VisualizationPanel
    ├── NetworkVisualization
    ├── EventTimeline
    └── Statistics
```

## State Management (App.tsx)

```typescript
// Main state variables
protocol: 'stop-and-wait' | 'go-back-n'
message: string
isRunning: boolean
isPaused: boolean
parameters: Parameters // all delays, rates, sizes
events: SimulationEvent[]
statistics: Statistics
packets: AnimatingPacket[]
```

## API Endpoint

**URL**: `POST http://localhost:5000/api/simulate`

**Required Fields**: protocol, total_packets, transmission_delay, ack_delay, loss_rate, timeout_duration, window_size, message

**Response**: { events: [], statistics: {...} }

## Typical Workflow

```
1. User selects protocol
2. User enters message
3. User adjusts parameters
4. User checks/unchecks edge cases
5. User clicks "Start Simulation"
6. Frontend sends POST to /api/simulate
7. Backend runs simulation (100-500ms)
8. Frontend receives events array
9. Frontend plays events with delays
10. UI updates with each event
11. User can pause, resume, or reset
```

## Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Backend not responding | `python backend/app.py` |
| Frontend won't load | `cd client && npm run dev` |
| Port 5000 in use | `kill $(lsof -t -i:5000)` |
| Port 5173 in use | Vite will use next available |
| Animations lag | Lower window size or close apps |
| npm install fails | `rm -rf node_modules && npm install` |

## Key Features Checklist

- ✅ Stop-and-Wait protocol
- ✅ Go-Back-N protocol
- ✅ Custom message input
- ✅ Configurable parameters
- ✅ Edge case simulation (4 types)
- ✅ Real-time animation
- ✅ Event timeline logging
- ✅ Statistics dashboard
- ✅ Play/Pause/Reset controls
- ✅ TypeScript + Framer Motion
- ✅ Responsive design
- ✅ Vite build system

## Testing Checklist

Before deployment, verify:
- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:5173
- [ ] Stop-and-Wait simulation works
- [ ] Go-Back-N simulation works
- [ ] Custom message appears in packets
- [ ] All parameters are adjustable
- [ ] Edge cases can be toggled
- [ ] Statistics update correctly
- [ ] Animations are smooth
- [ ] Pause/Resume works
- [ ] Reset clears state
- [ ] No console errors

## Parameter Ranges

| Parameter | Min | Max | Default |
|-----------|-----|-----|---------|
| Total Packets | 1 | 20 | 5 |
| Transmission Delay | 100ms | 2000ms | 500ms |
| ACK Delay | 50ms | 1000ms | 300ms |
| Loss Rate | 0% | 100% | 10% |
| Timeout | 500ms | 5000ms | 1500ms |
| Window Size | 1 | 10 | 3 |

## Color Scheme

- **Send**: Orange (#FF9500)
- **ACK**: Green (#4CAF50)
- **Retransmit**: Red (#F44336)
- **Timeout**: Red (#F44336)
- **Loss**: Purple (#9C27B0)
- **Background**: Purple gradient

## Event Types

- `send` - Packet sent
- `ack` - Acknowledgment received
- `retransmit` - Packet resent
- `timeout` - Timeout occurred
- `loss` - Packet/ACK lost
- `corruption` - Data corrupted

## Tips & Tricks

1. **Compare protocols**: Run same scenario with Stop-and-Wait and Go-Back-N
2. **Test edge cases**: Enable all edge cases for realistic simulation
3. **Slow motion**: Increase all delays to see events clearly
4. **Message length**: Longer messages = more packets for visualization
5. **Loss rate**: Higher rates = more retransmissions = lower efficiency
6. **Window size**: Larger windows = higher throughput (Go-Back-N)

## Files Modified Since Project Start

✅ **Created**:
- All 7 React components (TSX)
- App.tsx (main orchestration)
- Network visualization components
- Statistics and timeline components

✅ **Updated**:
- go_back_n.py (edge case support)
- stop_and_wait.py (edge case support)
- App.css (complete redesign)
- index.css (global styling)

✅ **Config**:
- package.json (contains all dependencies)
- vite.config.ts (proxy configuration)
- tsconfig.json (TypeScript setup)

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Detailed setup & usage |
| `COMPLETION_SUMMARY.md` | What was built |
| `QUICKSTART.md` | This file |

---

**Ready to simulate? Start with:**
```bash
# Terminal 1
python backend/app.py

# Terminal 2  
cd client && npm run dev
```
