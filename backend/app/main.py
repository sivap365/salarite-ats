import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.activity import activity_manager
from app.db import Base, engine
from app.routes.admin import router as admin_router
from app.routes.interviews import router as interviews_router
from app.routes.tasks import router as tasks_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salarite ATS API", version="1.0.0")

cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router, prefix="/api")
app.include_router(interviews_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.websocket("/ws/activity")
async def activity_websocket(websocket: WebSocket):
    await activity_manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive and consume ping messages if sent.
            await websocket.receive_text()
    except WebSocketDisconnect:
        activity_manager.disconnect(websocket)
