"""
Rider V-Sync Socket Client
A Python-based TCP client that transmits gesture commands to the game.
"""

import socket
import time

class SocketClient:
    def __init__(self, host='127.0.0.1', port=5000):
        self.host = host
        self.port = port
        self.client_socket = None
        self.connected = False

    def connect(self):
        """
        Connects to the server with error fallback.
        """
        try:
            self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            # Set a moderate timeout for connection attempts
            self.client_socket.settimeout(2.0)
            self.client_socket.connect((self.host, self.port))
            self.client_socket.settimeout(None) # reset back to blocking mode
            self.connected = True
            print(f"[SocketClient] Successfully connected to TCP gateway at {self.host}:{self.port}")
            return True
        except Exception as e:
            self.connected = False
            print(f"[SocketClient] Failed to connect to TCP gateway: {e}")
            return False

    def send_command(self, command: str) -> bool:
        """
        Sends a string command over the TCP socket. Reconnects on failure.
        """
        if not self.connected or self.client_socket is None:
            self.connect()
        
        if self.connected and self.client_socket:
            try:
                self.client_socket.sendall(f"{command}\n".encode('utf-8'))
                return True
            except Exception as e:
                print(f"[SocketClient] Error sending command '{command}': {e}")
                self.connected = False
                if self.client_socket:
                    try:
                        self.client_socket.close()
                    except:
                        pass
                    self.client_socket = None
                return False
        return False

    def close(self):
        """
        Gracefully closes the socket.
        """
        if self.client_socket:
            try:
                self.client_socket.close()
                print("[SocketClient] Socket closed successfully.")
            except Exception as e:
                print(f"[SocketClient] Error closing socket: {e}")
            self.client_socket = None
            self.connected = False
