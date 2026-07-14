"""
Rider V-Sync Socket Server
A standalone Python-based TCP socket server to assist in testing and processing telemetry commands.
"""

import socket
import threading

class SocketServer:
    def __init__(self, host='0.0.0.0', port=5000):
        self.host = host
        self.port = port
        self.server_socket = None
        self.running = False
        self.clients = []

    def start(self) -> bool:
        """
        Starts the TCP socket server and spins up a background thread to accept clients.
        """
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # Enable immediate address reuse to avoid 'Address already in use' errors
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            self.running = True
            print(f"[SocketServer] Server actively listening on {self.host}:{self.port}...")
            
            # Start acceptance loop in background
            self.accept_thread = threading.Thread(target=self._accept_loop, daemon=True)
            self.accept_thread.start()
            return True
        except Exception as e:
            print(f"[SocketServer] Bound error on {self.host}:{self.port}: {e}")
            return False

    def _accept_loop(self):
        """
        Accepts incoming client connections.
        """
        while self.running:
            try:
                client_socket, client_address = self.server_socket.accept()
                print(f"[SocketServer] Connection established with {client_address}")
                self.clients.append(client_socket)
                
                # Delegate client communication to a dedicated thread
                client_thread = threading.Thread(
                    target=self._handle_client, 
                    args=(client_socket, client_address), 
                    daemon=True
                )
                client_thread.start()
            except Exception:
                break

    def _handle_client(self, client_socket, client_address):
        """
        Handles data transmission from a connected client.
        """
        while self.running:
            try:
                data = client_socket.recv(1024)
                if not data:
                    break
                command = data.decode('utf-8').strip()
                if command:
                    print(f"[SocketServer] Received command from {client_address}: {command}")
            except Exception:
                break
        
        print(f"[SocketServer] Client {client_address} has disconnected.")
        if client_socket in self.clients:
            self.clients.remove(client_socket)
        try:
            client_socket.close()
        except:
            pass

    def stop(self):
        """
        Stops the server and releases all connected sockets.
        """
        self.running = False
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass
        for c in list(self.clients):
            try:
                c.close()
            except Exception:
                pass
        self.clients.clear()
        print("[SocketServer] Server stopped successfully.")
