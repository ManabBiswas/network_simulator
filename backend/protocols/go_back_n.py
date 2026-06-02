# Go-Back-N Protocol Implementation

class GoBackNProtocol:
    def __init__(self, total_packets, transmission_delay, ack_delay, loss_rate, timeout_duration, 
                 window_size, message='', simulate_edge_cases=True, simulate_corruption=False,
                 simulate_late_ack=False, simulate_duplicate_ack=False):
        self.total_packets = total_packets
        self.transmission_delay = transmission_delay
        self.ack_delay = ack_delay
        self.loss_rate = loss_rate
        self.timeout_duration = timeout_duration
        self.window_size = window_size
        self.message = message
        self.simulate_edge_cases = simulate_edge_cases
        self.simulate_corruption = simulate_corruption
        self.simulate_late_ack = simulate_late_ack
        self.simulate_duplicate_ack = simulate_duplicate_ack
        
        self.events = []
        self.current_time = 0
        self.next_seq_num = 0
        self.next_ack_expected = 0
        self.sent_packets = {}
        
        self.total_packets_sent = 0
        self.acks_received = 0
        self.retransmissions = 0
        self.corrupted_packets = 0
        self.duplicate_acks = 0
        
    def simulate(self):
        """Simulate the Go-Back-N protocol"""
        import random
        
        while self.next_ack_expected < self.total_packets:
            # Send packets up to window size
            packets_in_window = min(self.window_size, self.total_packets - self.next_seq_num)
            
            for i in range(packets_in_window):
                if self.next_seq_num >= self.total_packets:
                    break
                    
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
                    'description': f'Send Packet {self.next_seq_num} (Window) | {packet_content}{packet_status}'
                })
                
                self.sent_packets[self.next_seq_num] = {
                    'sent_time': self.current_time,
                    'lost': is_lost,
                    'corrupted': is_corrupted
                }
                self.total_packets_sent += 1
                
                if is_lost:
                    self.events.append({
                        'time': self.current_time,
                        'event_type': 'loss',
                        'packet_num': self.next_seq_num,
                        'description': f'❌ Packet {self.next_seq_num} lost in transmission'
                    })
                
                if is_corrupted:
                    self.corrupted_packets += 1
                    self.events.append({
                        'time': self.current_time,
                        'event_type': 'loss',
                        'packet_num': self.next_seq_num,
                        'description': f'🔧 Packet {self.next_seq_num} corrupted'
                    })
                
                self.next_seq_num += 1
                self.current_time += self.transmission_delay
            
            # Wait for ACK
            ack_delay = self.ack_delay
            if self.simulate_late_ack and random.random() < 0.2:
                ack_delay += 500
                self.events.append({
                    'time': self.current_time + ack_delay - 500,
                    'event_type': 'timeout',
                    'packet_num': self.next_ack_expected,
                    'description': f'🐌 ACK delayed (late arrival expected)'
                })
            
            self.current_time += ack_delay
            
            # Simulate ACK reception
            ack_received = False
            highest_ack = -1
            
            for seq_num in range(self.next_ack_expected, self.next_seq_num):
                # RULE 1: STRICT IN-ORDER DELIVERY
                # If a packet is lost/corrupted, the receiver drops it and ignores 
                # all subsequent packets in the window. No ACKs are generated.
                if self.sent_packets[seq_num]['lost'] or self.sent_packets[seq_num]['corrupted']:
                    break
                    
                # If packet survived, receiver sends an ACK. Now check if ACK survives.
                ack_lost = random.random() < (self.loss_rate * 0.3)
                
                if not ack_lost:
                    self.events.append({
                        'time': self.current_time,
                        'event_type': 'ack',
                        'packet_num': seq_num,
                        'description': f'✅ ACK {seq_num} received (Cumulative)'
                    })
                    self.acks_received += 1
                    highest_ack = seq_num
                    ack_received = True
                    
                    # Simulate duplicate ACK
                    if self.simulate_duplicate_ack and random.random() < 0.15:
                        self.current_time += 50
                        self.events.append({
                            'time': self.current_time,
                            'event_type': 'ack',
                            'packet_num': seq_num,
                            'description': f'📢 Duplicate ACK {seq_num} received'
                        })
                        self.duplicate_acks += 1
                else:
                    self.events.append({
                        'time': self.current_time,
                        'event_type': 'loss',
                        'packet_num': seq_num,
                        'description': f'❌ ACK {seq_num} lost in transmission'
                    })
                    # DO NOT break here. Even if this ACK is lost, the next packet 
                    # in the window might trigger an ACK that cumulatively covers this one.
            
            # Apply cumulative ACK state update
            if highest_ack != -1:
                self.next_ack_expected = highest_ack + 1
            
            # If no ACK received and we've been waiting, trigger timeout
            if not ack_received and self.next_seq_num > self.next_ack_expected:
                self.current_time += self.timeout_duration
                self.events.append({
                    'time': self.current_time,
                    'event_type': 'timeout',
                    'packet_num': self.next_ack_expected,
                    'description': f'⏱️ TIMEOUT! Go-Back-N: Retransmitting from Packet {self.next_ack_expected}'
                })
                
                # Go back and retransmit
                self.retransmissions += (self.next_seq_num - self.next_ack_expected)
                self.next_seq_num = self.next_ack_expected
                self.sent_packets.clear()
            else:
                self.current_time += 50
        
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
                'total_time': self.current_time,
                'window_size': self.window_size
            }
        }