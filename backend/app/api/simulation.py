from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.services.train_simulator import train_sim
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

class SpeedChangeRequest(BaseModel):
    multiplier: float

@router.get("/state")
def get_simulation_state() -> Dict[str, Any]:
    return train_sim.get_state()

@router.post("/start")
async def start_simulation() -> Dict[str, Any]:
    train_sim.start()
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Simulation started", "state": state}

@router.post("/pause")
async def pause_simulation() -> Dict[str, Any]:
    train_sim.pause()
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Simulation paused", "state": state}

@router.post("/resume")
async def resume_simulation() -> Dict[str, Any]:
    train_sim.resume()
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Simulation resumed", "state": state}

@router.post("/reset")
async def reset_simulation() -> Dict[str, Any]:
    train_sim.reset()
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Simulation reset to Kota initial position", "state": state}

@router.post("/speed")
async def set_simulation_speed(req: SpeedChangeRequest) -> Dict[str, Any]:
    train_sim.set_speed_multiplier(req.multiplier)
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": f"Simulation speed set to {req.multiplier}x", "speed_multiplier": req.multiplier}
