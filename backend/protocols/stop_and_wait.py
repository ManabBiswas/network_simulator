import random
from .base_protocol import BaseProtocol


class StopAndWaitProtocol(BaseProtocol):
    def __init__(self, **kwargs):   # kwargs are passed to BaseProtocol
        super().__init__(**kwargs) # Inherit from BaseProtocol
        self.next_seq_num = 0        # Next packet to send
        self.next_ack_expected = 0   # Next expected ACK

    def simulate(self):
        iterations = 0 # For safety guard. If too many iterations, stop (Infinite loop cases)

        while self.next_ack_expected < self.total_packets:  # While not all packets delivered
            iterations += 1  # Increment iterations
            if iterations > self.MAX_ITERATIONS:         # If too many iterations. to stop infinite loop
                self._add_event('error', self.next_seq_num,     # Add error event
                                'Simulation stopped: max retransmission limit reached')
                break

            is_lost = random.random() < self.loss_rate  # Randomly determine if packet is lost. if randomly gen number in each loop is less than loss rate of packet only then it is lost
            is_corrupted = (self.simulate_corruption and # if user wants to simulate corruption
                            not is_lost and  # if packet is not lost
                            random.random() < 0.12) # if randomly gen number in each loop is less than 0.12 then packet is corrupted. its 0.12 hardcoded value to simulate corruption real life is 0.01 or lower.

            # Build packet content label
            chunk_start = self.next_seq_num * 10  # Packet chunk start index. next_seq_num means packet number {0, 1, 2, 3, 4, 5, 6, 7, 8, 9} each packet has 10 chars in message
            chunk = self.message[chunk_start:chunk_start + 10] if self.message else '' # if message is empty then chunk will be empty
            content = f'P{self.next_seq_num}: {chunk}' if chunk else f'P{self.next_seq_num}' # if chunk is empty then content will be P{self.next_seq_num} which is packet number

            status = ' [LOST]' if is_lost else (' [CORRUPTED]' if is_corrupted else '') # if packet is lost or corrupted then status will be [LOST] or [CORRUPTED]
            self._add_event('send', self.next_seq_num,
                            f'Sending Packet {self.next_seq_num} | {content}{status}') # Add send event with details.
            self._add_ladder_send(self.next_seq_num, lost=is_lost, corrupted=is_corrupted) # Add send event to ladder
            self.total_packets_sent += 1  # Increment total packets sent successfully
            self.current_time += self.transmission_delay  # Increment current time by transmission delay

            if is_lost:
                self._add_event('loss', self.next_seq_num,
                                f'Packet {self.next_seq_num} lost in channel') # Add loss event
                self.current_time += self.timeout_duration
                self._add_event('timeout', self.next_seq_num,
                                f'TIMEOUT — No ACK for Packet {self.next_seq_num}, retransmitting') # Add timeout event
                self._add_ladder_timeout(self.next_seq_num) # Add timeout event to ladder
                self.retransmissions += 1 # Increment retransmissions because packet is lost.
                continue

            if is_corrupted:
                self._add_event('loss', self.next_seq_num,
                                f'Packet {self.next_seq_num} corrupted — receiver requests retransmit')
                self.corrupted_packets += 1
                self.current_time += self.timeout_duration
                self._add_event('timeout', self.next_seq_num,
                                f'TIMEOUT — Packet {self.next_seq_num} corrupted, retransmitting')
                self._add_ladder_timeout(self.next_seq_num)
                self.retransmissions += 1
                continue

            # Apply late ACK simulation
            ack_delay = self.ack_delay  # Default ACK delay
            if self.simulate_late_ack and random.random() < 0.2:    # 20% chance of late ACK, 20% chance of 200-600ms delay
                extra = random.randint(200, 600) # Random delay between 200 and 600ms is the extra time need due to the delay
                ack_delay += extra  # Add delay to ACK delay
                self._add_event('timeout', self.next_seq_num,     # Add timeout event
                                f'ACK {self.next_seq_num} delayed by {extra}ms')     # Add timeout event

            self.current_time += ack_delay  # Increment current time by ACK delay

            # ACK loss
            ack_lost = random.random() < (self.loss_rate * 0.4)  # 40% chance of ACK loss
            if ack_lost:
                self._add_event('loss', self.next_seq_num,
                                f'ACK {self.next_seq_num} lost in channel') # Add loss event
                self._add_ladder_ack(self.next_seq_num, lost=True)  # Add loss event to ladder
                self.current_time += self.timeout_duration  # Increment current time by timeout duration
                self._add_event('timeout', self.next_seq_num,
                                f'TIMEOUT — ACK {self.next_seq_num} lost, retransmitting Packet {self.next_seq_num}')   # Add timeout event
                self._add_ladder_timeout(self.next_seq_num)  # Add timeout event to ladder
                self.retransmissions += 1   # Increment retransmissions
                continue

            # Successful ACK
            self._add_event('ack', self.next_seq_num,
                            f'Received ACK {self.next_seq_num} — Packet delivered successfully')    # Add ack event with details for successful ACK delivery
            self._add_ladder_ack(self.next_seq_num)  # Add ack event to ladder
            self.acks_received += 1     # Increment acks received

            # Duplicate ACK simulation
            if self.simulate_duplicate_ack and random.random() < 0.15:  # 15% chance of duplicate ACK
                self.current_time += 40  # Increment current time by 40ms
                self._add_event('ack', self.next_seq_num,
                                f'Duplicate ACK {self.next_seq_num} received (ignored)')    # Add duplicate ack event
                self.duplicate_acks += 1    # Increment duplicate acks

            self.next_seq_num += 1  # Increment next sequence number
            self.next_ack_expected += 1 # Increment next expected ACK
            self._record_delivery(self.next_ack_expected)   # Record delivery
            self.current_time += 30  # Increment current time by 30ms

        return self._get_base_result()
