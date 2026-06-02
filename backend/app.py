# Flask backend for Network Protocol Simulator

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys

# Add protocols to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'protocols'))

from stop_and_wait import StopAndWaitProtocol
from go_back_n import GoBackNProtocol

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Serve the main HTML file
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Simulate a network protocol with given parameters
    
    Expected JSON parameters:
    - protocol: 'stop-and-wait' or 'go-back-n'
    - total_packets: number of packets to send
    - transmission_delay: delay in milliseconds for packet transmission
    - ack_delay: delay in milliseconds for ACK reception
    - loss_rate: probability of packet loss (0.0 to 1.0)
    - timeout_duration: timeout in milliseconds
    - window_size: window size for go-back-n (default 1 for stop-and-wait)
    - message: message to be transmitted
    - simulate_edge_cases: whether to show edge cases
    - simulate_corruption: simulate packet corruption
    - simulate_late_ack: simulate delayed ACKs
    - simulate_duplicate_ack: simulate duplicate ACKs
    """
    
    try:
        data = request.json
        
        protocol = data.get('protocol', 'stop-and-wait')
        total_packets = int(data.get('total_packets', 5))
        transmission_delay = int(data.get('transmission_delay', 500))
        ack_delay = int(data.get('ack_delay', 300))
        loss_rate = float(data.get('loss_rate', 0.0))
        timeout_duration = int(data.get('timeout_duration', 1500))
        window_size = int(data.get('window_size', 1))
        message = str(data.get('message', ''))
        simulate_edge_cases = data.get('simulate_edge_cases', True)
        simulate_corruption = data.get('simulate_corruption', False)
        simulate_late_ack = data.get('simulate_late_ack', False)
        simulate_duplicate_ack = data.get('simulate_duplicate_ack', False)
        
        # Validate parameters
        if total_packets < 1 or total_packets > 50:
            return jsonify({'error': 'Total packets must be between 1 and 50'}), 400
        if transmission_delay < 100 or transmission_delay > 5000:
            return jsonify({'error': 'Transmission delay must be between 100 and 5000 ms'}), 400
        if not (0.0 <= loss_rate <= 1.0):
            return jsonify({'error': 'Loss rate must be between 0.0 and 1.0'}), 400
        
        # Select and run protocol
        if protocol == 'stop-and-wait':
            simulator = StopAndWaitProtocol(
                total_packets=total_packets,
                transmission_delay=transmission_delay,
                ack_delay=ack_delay,
                loss_rate=loss_rate,
                timeout_duration=timeout_duration,
                message=message,
                simulate_edge_cases=simulate_edge_cases,
                simulate_corruption=simulate_corruption,
                simulate_late_ack=simulate_late_ack,
                simulate_duplicate_ack=simulate_duplicate_ack
            )
        elif protocol == 'go-back-n':
            if window_size < 1 or window_size > 20:
                return jsonify({'error': 'Window size must be between 1 and 20'}), 400
            simulator = GoBackNProtocol(
                total_packets=total_packets,
                transmission_delay=transmission_delay,
                ack_delay=ack_delay,
                loss_rate=loss_rate,
                timeout_duration=timeout_duration,
                window_size=window_size,
                message=message,
                simulate_edge_cases=simulate_edge_cases,
                simulate_corruption=simulate_corruption,
                simulate_late_ack=simulate_late_ack,
                simulate_duplicate_ack=simulate_duplicate_ack
            )
        else:
            return jsonify({'error': f'Unknown protocol: {protocol}'}), 400
        
        result = simulator.simulate()
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        print(f'Error in simulate: {str(e)}')
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/protocols', methods=['GET'])
def get_protocols():
    """Get list of available protocols"""
    return jsonify({
        'protocols': [
            {
                'name': 'Stop-and-Wait',
                'id': 'stop-and-wait',
                'description': 'Simple flow control: send one packet, wait for ACK'
            },
            {
                'name': 'Go-Back-N',
                'id': 'go-back-n',
                'description': 'Sliding window protocol: send multiple packets, wait for cumulative ACK'
            }
        ]
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    print("Network Protocol Simulator Backend")
    print("==================================")
    print("Starting Flask server on http://localhost:5000")
    print("Frontend available at http://localhost:5000/")
    print("\nAPI Endpoints:")
    print("  POST /api/simulate - Run simulation")
    print("  GET  /api/protocols - List available protocols")
    print("  GET  /api/health - Health check")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
