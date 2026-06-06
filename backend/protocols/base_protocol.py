# Base Protocol — shared helpers for Stop-and-Wait and Go-Back-N

class BaseProtocol:
    def __init__(self, total_packets, transmission_delay, ack_delay, loss_rate,
                 timeout_duration, message='', simulate_edge_cases=True,
                 simulate_corruption=False, simulate_late_ack=False,
                 simulate_duplicate_ack=False):
        self.total_packets = total_packets
        self.transmission_delay = transmission_delay
        self.ack_delay = ack_delay
        self.loss_rate = min(loss_rate, 0.9)   # cap at 90% — prevents infinite loop
        self.timeout_duration = timeout_duration
        self.message = message
        self.simulate_edge_cases = simulate_edge_cases
        self.simulate_corruption = simulate_corruption
        self.simulate_late_ack = simulate_late_ack
        self.simulate_duplicate_ack = simulate_duplicate_ack

        self.events = []
        self.ladder_events = []
        self.throughput = [{'time': 0, 'delivered': 0}]
        self.current_time = 0

        self.total_packets_sent = 0
        self.acks_received = 0
        self.retransmissions = 0
        self.corrupted_packets = 0
        self.duplicate_acks = 0
        self.packets_delivered = 0

        # Safety guard
        self.MAX_ITERATIONS = total_packets * 25

    def _add_event(self, event_type, packet_num, description):
        self.events.append({
            'time': self.current_time,
            'event_type': event_type,
            'packet_num': packet_num,
            'description': description
        })

    def _add_ladder_send(self, seq_num, lost=False, corrupted=False):
        label = f'P{seq_num}'
        if lost:
            arrow_type = 'lost'
        elif corrupted:
            arrow_type = 'corrupted'
        else:
            arrow_type = 'send'
        self.ladder_events.append({
            'time': self.current_time,
            'type': arrow_type,
            'seq_num': seq_num,
            'label': label,
            'direction': 'right',
            'success': not lost and not corrupted
        })

    def _add_ladder_ack(self, seq_num, lost=False):
        self.ladder_events.append({
            'time': self.current_time,
            'type': 'ack_lost' if lost else 'ack',
            'seq_num': seq_num,
            'label': f'ACK{seq_num}',
            'direction': 'left',
            'success': not lost
        })

    def _add_ladder_timeout(self, seq_num):
        self.ladder_events.append({
            'time': self.current_time,
            'type': 'timeout',
            'seq_num': seq_num,
            'label': 'TIMEOUT',
            'direction': 'none',
            'success': False
        })

    def _record_delivery(self, delivered_count):
        self.packets_delivered = delivered_count
        self.throughput.append({
            'time': self.current_time,
            'delivered': delivered_count
        })

    def _get_base_result(self, extra_stats=None):
        efficiency = 0
        if self.total_packets_sent > 0:
            efficiency = round((self.total_packets / self.total_packets_sent) * 100, 1)

        stats = {
            'total_packets': self.total_packets,
            'total_packets_sent': self.total_packets_sent,
            'acks_received': self.acks_received,
            'retransmissions': self.retransmissions,
            'corrupted_packets': self.corrupted_packets,
            'duplicate_acks': self.duplicate_acks,
            'total_time': self.current_time,
            'efficiency': efficiency
        }
        if extra_stats:
            stats.update(extra_stats)

        # Ensure throughput ends at final delivery
        if self.throughput[-1]['delivered'] < self.total_packets:
            self.throughput.append({
                'time': self.current_time,
                'delivered': self.total_packets
            })

        return {
            'events': self.events,
            'ladder_events': self.ladder_events,
            'throughput': self.throughput,
            'statistics': stats
        }
