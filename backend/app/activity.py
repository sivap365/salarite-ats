import json
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket


class ActivityManager:
    def __init__(self):
        self.connections: list[WebSocket] = []
        self.events: list[dict[str, Any]] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)
        await websocket.send_text(json.dumps({"type": "history", "data": self.events[-50:]}))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def publish(self, event_type: str, message: str, meta: dict[str, Any] | None = None):
        event = {
            "type": event_type,
            "message": message,
            "meta": meta or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.events.append(event)

        stale_connections: list[WebSocket] = []
        for websocket in self.connections:
            try:
                await websocket.send_text(json.dumps({"type": "event", "data": event}))
            except Exception:
                stale_connections.append(websocket)

        for websocket in stale_connections:
            self.disconnect(websocket)


activity_manager = ActivityManager()
