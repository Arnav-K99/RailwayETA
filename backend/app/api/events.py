from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional

from app.schemas.schemas import OperationalEventCreate, OperationalEventResponse
from app.services.event_engine import event_manager
from app.services.train_simulator import train_sim
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/events", tags=["Operational Events"])

@router.get("")
def list_events() -> List[Dict[str, Any]]:
    return event_manager.get_all_events()

@router.post("")
async def create_event(payload: OperationalEventCreate) -> Dict[str, Any]:
    event = event_manager.trigger_event(
        event_type=payload.type,
        section_id=payload.section_id,
        title=payload.title,
        severity=payload.severity,
        impact_minutes=payload.impact_minutes or 8.0,
        description=payload.description or ""
    )
    # Broadcast updated train ETA immediately
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Operational event registered", "event": event}

@router.delete("/{event_id}")
async def delete_event(event_id: str) -> Dict[str, Any]:
    success = event_manager.remove_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Operational event removed", "event_id": event_id}

@router.post("/toggle/{event_id}")
async def toggle_event(event_id: str) -> Dict[str, Any]:
    event = event_manager.toggle_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "Event toggled", "event": event}

@router.post("/clear")
async def clear_all_events() -> Dict[str, Any]:
    event_manager.clear_all_events()
    state = train_sim.get_state()
    await ws_manager.broadcast(state)
    return {"message": "All operational events cleared"}
