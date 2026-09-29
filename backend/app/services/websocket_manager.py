import asyncio
import json
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect

class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._broadcast_task: asyncio.Task = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
            
        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
                
        for dead in dead_connections:
            self.active_connections.discard(dead)

# Global singleton
ws_manager = WebSocketManager()
