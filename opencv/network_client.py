"""
Rider V-Sync Network Client Proxy
Wrapper interface that maps gesture outputs to the underlying TCP socket transmission.
"""

import sys
import os

# Add project root to python path to import network modules seamlessly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from network.socket_client import SocketClient

class NetworkClient:
    def __init__(self, host: str = '127.0.0.1', port: int = 5000):
        self.client = SocketClient(host=host, port=port)

    def connect(self) -> bool:
        """
        Connects to the socket server.
        """
        return self.client.connect()

    def send_gesture(self, gesture: str) -> bool:
        """
        Transmits a filtered gesture to the server.
        """
        return self.client.send_command(gesture)

    @property
    def is_connected(self) -> bool:
        """
        Checks current socket client connection state.
        """
        return self.client.connected

    def close(self):
        """
        Closes socket connections gracefully.
        """
        self.client.close()
