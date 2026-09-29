from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

from app.services.train_simulator import train_sim
from app.data.corridor_data import STATIONS, SECTIONS
from app.data.train_fleet_data import TRAIN_FLEET

router = APIRouter(prefix="/api/trains", tags=["Trains"])

def get_live_fleet() -> List[Dict[str, Any]]:
    """Returns the fleet with the primary simulation train updated to live telemetry."""
    sim_state = train_sim.get_state()
    primary_sim = sim_state["train"]
    
    fleet = []
    for tr in TRAIN_FLEET:
        t_copy = dict(tr)
        if t_copy["id"] == train_sim.train_id:
            # Overwrite with live moving train telemetry
            t_copy["latitude"] = primary_sim["latitude"]
            t_copy["longitude"] = primary_sim["longitude"]
            t_copy["speed_kmh"] = primary_sim["speed_kmh"]
            t_copy["current_delay_min"] = primary_sim["current_delay_min"]
            t_copy["status"] = primary_sim["status"]
            t_copy["current_station"] = primary_sim["current_station"]
            t_copy["next_station"] = primary_sim["next_station"]
            t_copy["next_station_code"] = primary_sim["next_station_code"]
            t_copy["distance_to_next_km"] = primary_sim["distance_to_next_km"]
            t_copy["progress_percent"] = primary_sim["progress_percent"]
            t_copy["upcoming_stations"] = sim_state["upcoming_stations"]
            t_copy["why_eta_changed"] = sim_state["why_eta_changed"]
        fleet.append(t_copy)
    return fleet

@router.get("")
def get_all_trains(search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns list of active coaching trains monitored, with optional search filter."""
    fleet = get_live_fleet()
    if not search:
        return fleet
        
    s = str(search).strip().lower()
    return [
        t for t in fleet
        if s in t["train_number"].lower()
        or s in t["name"].lower()
        or s in t["origin"].lower()
        or s in t["destination"].lower()
        or s in t.get("current_station", "").lower()
        or s in t.get("next_station", "").lower()
    ]

@router.get("/{train_id}")
def get_train_by_id(train_id: str) -> Dict[str, Any]:
    fleet = get_live_fleet()
    for t in fleet:
        if t["id"] == train_id or t["train_number"] == train_id:
            return t
    raise HTTPException(status_code=404, detail="Train not found")

@router.get("/{train_id}/eta")
def get_train_eta_forecast(train_id: str) -> Dict[str, Any]:
    """Returns live dynamic ETA forecast for any of the 6 monitored coaching trains."""
    fleet = get_live_fleet()
    for t in fleet:
        if t["id"] == train_id or t["train_number"] == train_id:
            return {
                "train_id": t["id"],
                "train_number": t["train_number"],
                "train_name": t["name"],
                "origin": t["origin"],
                "destination": t["destination"],
                "current_station": t["current_station"],
                "next_station": t["next_station"],
                "speed_kmh": t["speed_kmh"],
                "current_delay_min": t["current_delay_min"],
                "status": t["status"],
                "upcoming_stations": t.get("upcoming_stations", []),
                "why_eta_changed": t.get("why_eta_changed", []),
                "sections": t.get("sections", []),
                "is_simulation_target": t.get("is_simulation_target", False)
            }
    raise HTTPException(status_code=404, detail="Train not found")

@router.get("/{train_id}/route")
def get_train_route(train_id: str) -> Dict[str, Any]:
    return {
        "train_id": train_id,
        "corridor_name": "Delhi – Kota – Agra Junction Demonstration Corridor",
        "stations": STATIONS,
        "sections": [
            {
                "id": s["id"],
                "name": s["name"],
                "from_station": s["from_station"],
                "to_station": s["to_station"],
                "distance_km": s["distance_km"],
                "polyline": s["polyline"]
            }
            for s in SECTIONS
        ]
    }

@router.get("/{train_id}/sections")
def get_train_sections(train_id: str) -> List[Dict[str, Any]]:
    """Returns train-specific corridor sections with health and speed limits."""
    fleet = get_live_fleet()
    for t in fleet:
        if t["id"] == train_id or t["train_number"] == train_id:
            return t.get("sections", [])
    raise HTTPException(status_code=404, detail="Train not found")
