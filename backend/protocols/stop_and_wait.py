# Stop-and-Wait Protocol Implementation

class StopAndWaitProtocol:
    def __init__(self, total_packets, transmission_delay, ack_delay, loss_rate, timeout_duration, 
                 message='', simulate_edge_cases=True, simulate_corruption=False, 
                 simulate_late_ack=False, simulate_duplicate_ack=False):
        self.total_packets = total_packets
        self.transmission_delay = transmission_delay
        self.ack_delay = ack_delay
        self.loss_rate = loss_rate
        self.timeout_duration = timeout_duration
        self.message = message
        self.simulate_edge_cases = simulate_edge_cases
        self.simulate_corruption = simulate_corruption
        self.simulate_late_ack = simulate_late_ack
        self.simulate_duplicate_ack = simulate_duplicate_ack
        
        self.events = []
        self.current_time = 0
        self.next_seq_num = 0
        self.next_ack_expected = 0
        
        self.total_packets_sent = 0
        self.acks_received = 0
        self.retransmissions = 0
        self.corrupted_packets = 0
        self.duplicate_acks = 0
        
    def simulate(self):
        """Simulate the Stop-and-Wait protocol"""
        import random
        
        while self.next_ack_expected < self.total_packets:
            # Send packet
            is_lost = random.random() < self.loss_rate
            is_corrupted = self.simulate_corruption and random.random() < 0.1
            
            packet_status = ''
            if is_lost:
                packet_status = ' (LOST)'
            elif is_corrupted:
                packet_status = ' (CORRUPTED)'
            
            packet_content = f"P{self.next_seq_num}: {self.message[self.next_seq_num*10:(self.next_seq_num+1)*10]}" if self.message else f"P{self.next_seq_num}"
            
            self.events.append({
                'time': self.current_time,
                'event_type': 'send',
                'packet_num': self.next_seq_num,
                'description': f'Send Packet {self.next_seq_num} | {packet_content}{packet_status}'
            })
            self.total_packets_sent += 1
            self.current_time += self.transmission_delay
            
            if is_lost:
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'loss',
                    'packet_num': self.next_seq_num,
                    'description': f'❌ Packet {self.next_seq_num} lost in transmission'
                })
                # Wait for timeout
                self.current_time += self.timeout_duration
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'timeout',
                    'packet_num': self.next_seq_num,
                    'description': f'⏱️ TIMEOUT! No ACK received for Packet {self.next_seq_num} - Retransmitting...'
                })
                self.retransmissions += 1
                continue
            
            if is_corrupted:
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'loss',
                    'packet_num': self.next_seq_num,
                    'description': f'🔧 Packet {self.next_seq_num} corrupted - will request retransmission'
                })
                self.corrupted_packets += 1
                # Wait for timeout
                self.current_time += self.timeout_duration
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'timeout',
                    'packet_num': self.next_seq_num,
                    'description': f'⏱️ TIMEOUT! Retransmitting corrupted Packet {self.next_seq_num}'
                })
                self.retransmissions += 1
                continue
            
            # Wait for ACK
            ack_delay = self.ack_delay
            if self.simulate_late_ack and random.random() < 0.2:
                ack_delay += 500
                self.events.append({
                    'time': self.current_time + ack_delay - 500,
                    'event_type': 'timeout',
                    'packet_num': self.next_seq_num,
                    'description': f'🐌 ACK {self.next_seq_num} delayed (late arrival)'
                })
            
            self.current_time += ack_delay
            
            # Check for ACK loss
            ack_lost = random.random() < (self.loss_rate * 0.5)
            
            if ack_lost:
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'loss',
                    'packet_num': self.next_seq_num,
                    'description': f'❌ ACK {self.next_seq_num} lost in transmission'
                })
                # Wait for timeout
                self.current_time += self.timeout_duration
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'timeout',
                    'packet_num': self.next_seq_num,
                    'description': f'⏱️ TIMEOUT! No ACK received - Retransmitting Packet {self.next_seq_num}'
                })
                self.retransmissions += 1
            else:
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'ack',
                    'packet_num': self.next_seq_num,
                    'description': f'✅ ACK {self.next_seq_num} received successfully'
                })
                self.acks_received += 1
                
                # Simulate duplicate ACK
                if self.simulate_duplicate_ack and random.random() < 0.15:
                    self.current_time += 50
                    self.events.append({
                        'time': self.current_time,
                        'event_type': 'ack',
                        'packet_num': self.next_seq_num,
                        'description': f'📢 Duplicate ACK {self.next_seq_num} received (duplicate confirmation)'
                    })
                    self.duplicate_acks += 1
                
                self.next_seq_num += 1
                self.next_ack_expected += 1
                self.current_time += 50  # Small delay before next send
        
        return self._get_result()
    
    def _get_result(self):
        """Format the simulation result"""
        return {
            'events': self.events,
            'statistics': {
                'total_packets': self.total_packets,
                'total_packets_sent': self.total_packets_sent,
                'acks_received': self.acks_received,
                'retransmissions': self.retransmissions,
                'corrupted_packets': self.corrupted_packets,
                'duplicate_acks': self.duplicate_acks,
                'total_time': self.current_time
            }
        }
