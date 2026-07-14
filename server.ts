import express from "express";
import path from "path";
import http from "http";
import net from "net";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Track connected WebSocket clients
  const wsClients = new Set<WebSocket>();

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    wsClients.add(ws);
    console.log(`[WS] Client connected. Total: ${wsClients.size}`);

    // Send initial configuration or connection confirmation
    ws.send(JSON.stringify({ type: "system", message: "CONNECTED_TO_SYNC_DOCK" }));

    ws.on("message", (message) => {
      try {
        const payload = message.toString().trim();
        console.log(`[WS] Received: ${payload}`);
        // Broadcast to all other connected clients (such as the React app)
        for (const client of wsClients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }
      } catch (err) {
        console.error("[WS] Error handling message:", err);
      }
    });

    ws.on("close", () => {
      wsClients.delete(ws);
      console.log(`[WS] Client disconnected. Total: ${wsClients.size}`);
    });

    ws.on("error", (err) => {
      console.error("[WS] Socket error:", err);
    });
  });

  // Handle WebSocket upgrade
  server.on("upgrade", (request, socket, head) => {
    try {
      const pathname = request.url ? request.url.split("?")[0] : "";
      if (pathname === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch (err) {
      console.error("[WS] Upgrade error:", err);
    }
  });

  // Setup TCP Socket Server on Port 5000 for local Python TCP client connection
  const TCP_PORT = 5000;
  const tcpServer = net.createServer((socket) => {
    console.log(`[TCP] Connection from ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on("data", (data) => {
      const command = data.toString().trim();
      if (command) {
        console.log(`[TCP] Received TCP command: ${command}`);
        // Broadcast to all WebSocket clients (especially the React game)
        for (const ws of wsClients) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(command);
          }
        }
      }
    });

    socket.on("end", () => {
      console.log("[TCP] Client disconnected");
    });

    socket.on("error", (err) => {
      console.error("[TCP] Socket error:", err);
    });
  });

  tcpServer.listen(TCP_PORT, "0.0.0.0", () => {
    console.log(`[TCP] Server running on port ${TCP_PORT}`);
  });

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", ws_clients: wsClients.size, tcp_port: TCP_PORT });
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
