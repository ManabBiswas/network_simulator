from flask import Flask, jsonify, request
from flask_cors import CORS
import os, sys

sys.path.insert(0, os.path.dirname(__file__))
from protocols import StopAndWaitProtocol, GoBackNProtocol

app = Flask(__name__, static_folder='../client/dist', static_url_path='')
CORS(app)


def _parse_params(data: dict) -> dict:
    return {
        'total_packets':      max(1,  min(50,  int(data.get('total_packets', 5)))),
        'transmission_delay': max(100, min(5000, int(data.get('transmission_delay', 500)))),
        'ack_delay':          max(50,  min(2000, int(data.get('ack_delay', 300)))),
        'loss_rate':          max(0.0, min(0.9,  float(data.get('loss_rate', 0.0)))),
        'timeout_duration':   max(200, min(8000, int(data.get('timeout_duration', 1500)))),
        'window_size':        max(1,   min(20,   int(data.get('window_size', 4)))),
        'message':            str(data.get('message', '')),
        'simulate_edge_cases':    bool(data.get('simulate_edge_cases', True)),
        'simulate_corruption':    bool(data.get('simulate_corruption', False)),
        'simulate_late_ack':      bool(data.get('simulate_late_ack', False)),
        'simulate_duplicate_ack': bool(data.get('simulate_duplicate_ack', False)),
    }


def _build_saw(p: dict) -> StopAndWaitProtocol:
    return StopAndWaitProtocol(
        total_packets=p['total_packets'],
        transmission_delay=p['transmission_delay'],
        ack_delay=p['ack_delay'],
        loss_rate=p['loss_rate'],
        timeout_duration=p['timeout_duration'],
        message=p['message'],
        simulate_edge_cases=p['simulate_edge_cases'],
        simulate_corruption=p['simulate_corruption'],
        simulate_late_ack=p['simulate_late_ack'],
        simulate_duplicate_ack=p['simulate_duplicate_ack'],
    )


def _build_gbn(p: dict) -> GoBackNProtocol:
    return GoBackNProtocol(
        total_packets=p['total_packets'],
        transmission_delay=p['transmission_delay'],
        ack_delay=p['ack_delay'],
        loss_rate=p['loss_rate'],
        timeout_duration=p['timeout_duration'],
        window_size=p['window_size'],
        message=p['message'],
        simulate_edge_cases=p['simulate_edge_cases'],
        simulate_corruption=p['simulate_corruption'],
        simulate_late_ack=p['simulate_late_ack'],
        simulate_duplicate_ack=p['simulate_duplicate_ack'],
    )


@app.route('/')
def index():
    try:
        return app.send_static_file('index.html')
    except Exception:
        return jsonify({'status': 'backend running — build frontend with npm run build'}), 200


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'version': '2.1'})


@app.route('/api/protocols')
def protocols():
    return jsonify({'protocols': [
        {'id': 'stop-and-wait', 'name': 'Stop-and-Wait',
         'description': 'Send one packet, wait for ACK before sending next'},
        {'id': 'go-back-n',    'name': 'Go-Back-N',
         'description': 'Sliding window — send N packets, cumulative ACKs'},
    ]})


@app.route('/api/simulate', methods=['POST'])
def simulate():
    try:
        data = request.get_json(force=True) or {}
        p = _parse_params(data)
        protocol = data.get('protocol', 'stop-and-wait')

        if protocol == 'stop-and-wait':
            result = _build_saw(p).simulate()
        elif protocol == 'go-back-n':
            result = _build_gbn(p).simulate()
        else:
            return jsonify({'error': f'Unknown protocol: {protocol}'}), 400

        return jsonify(result), 200

    except Exception as e:
        print(f'[simulate] error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare', methods=['POST'])
def compare():
    """Run SAW and GBN with identical params, return both results."""
    try:
        data = request.get_json(force=True) or {}
        p = _parse_params(data)

        saw_result = _build_saw(p).simulate()
        gbn_result = _build_gbn(p).simulate()

        return jsonify({
            'stop_and_wait': saw_result,
            'go_back_n':     gbn_result,
            'params':        p,
        }), 200

    except Exception as e:
        print(f'[compare] error: {e}')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__': 
    print("Network Protocol Simulator Backend")
    print("==================================")
    print("Starting Flask server on http://localhost:5000")
    print('Endpoints: /api/simulate  /api/compare  /api/health')
    print("\nPress Ctrl+C to stop the server")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
