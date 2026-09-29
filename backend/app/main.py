import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models.database import init_db
from app.services.prediction_model import prediction_engine
from app.services.train_simulator import train_sim
from app.services.websocket_manager import ws_manager
from app.api import trains, simulation, events, network, analytics

# Continuous background broadcast worker
async def simulation_broadcast_worker():
    while True:
        try:
            if ws_manager.active_connections:
                state = train_sim.get_state()
                await ws_manager.broadcast(state)
        except Exception as e:
            print(f"[WS Broadcast Error] {e}")
        await asyncio.sleep(0.25)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[RailETA Engine] Initializing SQLite database...")
    init_db()
    print("[RailETA Engine] Initializing ML prediction model...")
    _ = prediction_engine.get_diagnostics()
    
    # Start WS broadcast task and simulator
    train_sim.start()
    broadcast_task = asyncio.create_task(simulation_broadcast_worker())
    print("[RailETA Engine] Live simulation & WebSocket broadcast online.")
    
    yield
    
    # Shutdown
    broadcast_task.cancel()
    if train_sim._task and not train_sim._task.done():
        train_sim._task.cancel()
    print("[RailETA Engine] Engine cleanly shut down.")

app = FastAPI(
    title="RailETA — Dynamic Train ETA Forecasting & Operations Intelligence",
    description="Smart India Hackathon Prototype: Section-wise machine learning ETA prediction engine for Indian Railways.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(trains.router)
app.include_router(simulation.router)
app.include_router(events.router)
app.include_router(network.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "system": "RailETA Operations Intelligence API",
        "status": "OPERATIONAL",
        "problem_statement": "Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains",
        "active_train": train_sim.train_number,
        "docs_url": "/docs",
        "websocket_endpoint": "/ws/simulation"
    }

@app.websocket("/ws/simulation")
async def websocket_simulation_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    # Send immediate state on initial connection
    try:
        initial_state = train_sim.get_state()
        await websocket.send_json(initial_state)
        
        while True:
            # Keep connection open and receive any incoming messages
            data = await websocket.receive_text()
            # If client sends ping or command
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)
