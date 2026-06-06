import random
from .base_protocol import BaseProtocol


class GoBackNProtocol(BaseProtocol):
    def __init__(self, window_size=4, **kwargs):
        super().__init__(**kwargs)
        self.window_size = window_size  # Window size
        self.next_seq_num = 0
        self.next_ack_expected = 0
        self.sent_packets = {}  # {seq_num: {'lost': bool, 'corrupted': bool}}

    def simulate(self):
        iterations = 0 # For safety guard

        while self.next_ack_expected < self.total_packets:  # While not all packets delivered
            iterations += 1 # Increment iterations
            if iterations > self.MAX_ITERATIONS:
                self._add_event('error', self.next_ack_expected,
                                'Simulation stopped: max retransmission limit reached')
                break

            # Send all packets that fit in current window
            window_end = min(self.next_ack_expected + self.window_size, self.total_packets) # Calculate window end, it means how many packets to send
            packets_to_send = window_end - self.next_seq_num    # Calculate how many packets to send

            if packets_to_send <= 0 and self.next_seq_num >= self.total_packets:
                # All sent, waiting for ACKs
                packets_to_send = 0

            for _ in range(max(packets_to_send, 0)):    # Send packets
                if self.next_seq_num >= self.total_packets:  # If all packets sent
                    break

                seq = self.next_seq_num  # Packet sequence number
                is_lost = random.random() < self.loss_rate  # Randomly determine if packet is lost
                is_corrupted = (self.simulate_corruption and # if user wants to simulate corruption
                                not is_lost and     # if packet is not lost
                                random.random() < 0.12)

                chunk_start = seq * 10      # Packet chunk start index
                chunk = self.message[chunk_start:chunk_start + 10] if self.message else ''  # if message is empty then chunk will be empty
                content = f'P{seq}: {chunk}' if chunk else f'P{seq}'    # if chunk is empty then content will be P{seq} which is packet number
                status = ' [LOST]' if is_lost else (' [CORRUPTED]' if is_corrupted else '')  # if packet is lost or corrupted then status will be [LOST] or [CORRUPTED]

                self._add_event('send', seq,
                                f'Sending Packet {seq} (window [{self.next_ack_expected}..{window_end - 1}]) | {content}{status}')  # Add send event
                self._add_ladder_send(seq, lost=is_lost, corrupted=is_corrupted)    # Add send event to ladder
                self.sent_packets[seq] = {'lost': is_lost, 'corrupted': is_corrupted}
                self.total_packets_sent += 1    # Increment total packets sent

                if is_lost:
                    self._add_event('loss', seq, f'Packet {seq} lost in channel')
                if is_corrupted:
                    self.corrupted_packets += 1
                    self._add_event('loss', seq, f'Packet {seq} corrupted in channel')

                self.next_seq_num += 1  # Increment next sequence number
                self.current_time += self.transmission_delay    # Increment current time

            # Wait for ACKs
            ack_delay = self.ack_delay
            if self.simulate_late_ack and random.random() < 0.2:    # if user wants to simulate late ack
                extra = random.randint(150, 500)    # Randomly generate extra delay
                ack_delay += extra      # Add extra delay
                self._add_event('timeout', self.next_ack_expected,
                                f'ACK delayed by {extra}ms (late arrival)')  # Add timeout event

            self.current_time += ack_delay  # Increment current time

            # Process ACKs — strict in-order (GBN rule)
            highest_acked = -1      # Highest sequence number acknowledged, -1 means none
            for seq in range(self.next_ack_expected, self.next_seq_num):    # For each ACK  
                if seq not in self.sent_packets:    # If packet not sent
                    break
                pkt = self.sent_packets[seq]    # Get packet from sent packets
                # GBN: stop at first lost/corrupted — receiver discards rest
                if pkt['lost'] or pkt['corrupted']:     # If packet lost or corrupted
                    break

                ack_lost = random.random() < (self.loss_rate * 0.3)     # Randomly determine if ACK is lost
                if ack_lost:
                    self._add_event('loss', seq, f'ACK {seq} lost in channel')  # Add loss event
                    self._add_ladder_ack(seq, lost=True)
                    # Cumulative — if later ACK arrives it covers this
                else:
                    self._add_event('ack', seq,
                                    f'Received ACK {seq} (cumulative) — window advances')    # Add ack event
                    self._add_ladder_ack(seq)   # Add ack event to ladder
                    self.acks_received += 1     # Increment acks received
                    highest_acked = seq     # Update highest sequence number acknowledged

                    if self.simulate_duplicate_ack and random.random() < 0.12:  # if user wants to simulate duplicate ack
                        self.current_time += 30  # Increment current time
                        self._add_event('ack', seq, f'Duplicate ACK {seq} received (ignored)')  # Add ack event
                        self.duplicate_acks += 1    # Increment duplicate acks

            if highest_acked >= 0:  # If ACK received
                self.next_ack_expected = highest_acked + 1  # Update next ACK expected
                self._record_delivery(self.next_ack_expected)    # Record delivery
                self.current_time += 20  # Increment current time
            else:
                # No ACK received — timeout, go back to base
                self.current_time += self.timeout_duration  # Increment current time
                retransmit_count = self.next_seq_num - self.next_ack_expected    # Number of packets to retransmit
                self._add_event('timeout', self.next_ack_expected,
                                f'TIMEOUT — Go-Back-N: retransmitting {retransmit_count} packet(s) from Packet {self.next_ack_expected}')    # Add timeout event
                self._add_ladder_timeout(self.next_ack_expected)    # Add timeout event to ladder
                self.retransmissions += retransmit_count    # Increment retransmissions
                # Reset seq pointer — window rolls back
                self.next_seq_num = self.next_ack_expected  # Reset next sequence number
                # Clear sent state for rolled-back packets
                for seq in range(self.next_ack_expected, self.next_seq_num + retransmit_count):
                    self.sent_packets.pop(seq, None)    # Remove packet from sent packets

        return self._get_base_result(extra_stats={'window_size': self.window_size})
