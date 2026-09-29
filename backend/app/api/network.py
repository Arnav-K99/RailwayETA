from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional

from app.data.corridor_data import SECTIONS, STATIONS
from app.data.train_fleet_data import TRAIN_FLEET
from app.services.event_engine import event_manager

router = APIRouter(prefix="/api/network", tags=["Network Conditions"])

@router.get("/conditions")
def get_network_conditions(train_id: Optional[str] = Query(None, description="Filter sections by specific train corridor")) -> List[Dict[str, Any]]:
    active_events = event_manager.get_active_events()
    
    # If train_id specified and not primary simulation train, return that train's specific corridor sections
    if train_id and train_id != "12951":
        for tr in TRAIN_FLEET:
            if tr["id"] == train_id or tr["train_number"] == train_id:
                train_sections = tr.get("sections", [])
                results = []
                for s in train_sections:
                    status = s.get("status", "NORMAL")
                    impact = s.get("expected_impact_min", 0.0)
                    status_color = "red" if status == "MAINTENANCE" else ("amber" if status in ["CONGESTED", "SPEED_RESTRICTION"] else "emerald")
                    results.append({
                        "section_id": s["id"],
                        "section_name": s["name"],
                        "from_station": s["name"].split("→")[0].strip() if "→" in s["name"] else s["name"],
                        "to_station": s["name"].split("→")[1].strip() if "→" in s["name"] else s["name"],
                        "distance_km": s.get("distance_km", 50.0),
                        "max_permissible_speed_kmh": s.get("speed_limit", 120.0),
                        "historical_avg_time_min": round((s.get("distance_km", 50.0) / 100.0) * 60, 1),
                        "track_type": "Broad Gauge 1676mm Electrified",
                        "status": status,
                        "status_color": status_color,
                        "has_congestion": (status == "CONGESTED"),
                        "has_speed_restriction": (status == "SPEED_RESTRICTION"),
                        "has_maintenance": (status == "MAINTENANCE"),
                        "expected_impact_min": impact,
                        "active_events": [
                            {"id": f"EVT-{s['id']}", "title": f"{status.title()} Order on {s['name']}", "impact_minutes": impact}
                        ] if impact > 0 else []
                    })
                return results

    # Default / Primary corridor
    results = []
    for sec in SECTIONS:
        sec_id = sec["id"]
        from_st = next(s for s in STATIONS if s["id"] == sec["from_station"])
        to_st = next(s for s in STATIONS if s["id"] == sec["to_station"])
        
        sec_events = [e for e in active_events if e.get("section_id") == sec_id or e.get("section_id") == "ALL"]
        
        has_congestion = any(e["type"] == "congestion" for e in sec_events)
        has_tsr = any(e["type"] == "speed_restriction" for e in sec_events)
        has_maint = any(e["type"] == "maintenance_block" for e in sec_events)
        
        if has_maint:
            status = "MAINTENANCE"
            status_color = "red"
        elif has_congestion:
            status = "HIGH CONGESTION"
            status_color = "amber"
        elif has_tsr:
            status = "SPEED RESTRICTION"
            status_color = "amber"
        else:
            status = "NORMAL"
            status_color = "emerald"

        total_impact = sum(e.get("impact_minutes", 0.0) for e in sec_events)

        results.append({
            "section_id": sec_id,
            "section_name": f"{from_st['name']} → {to_st['name']}",
            "from_station": from_st["name"],
            "to_station": to_st["name"],
            "distance_km": sec["distance_km"],
            "max_permissible_speed_kmh": sec["max_permissible_speed_kmh"],
            "historical_avg_time_min": sec["historical_avg_time_min"],
            "track_type": sec.get("track_type", "Double Electrified"),
            "status": status,
            "status_color": status_color,
            "has_congestion": has_congestion,
            "has_speed_restriction": has_tsr,
            "has_maintenance": has_maint,
            "expected_impact_min": round(total_impact, 1),
            "active_events": sec_events
        })

    return results
