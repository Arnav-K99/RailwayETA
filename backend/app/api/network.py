from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional

from app.data.corridor_data import SECTIONS, STATIONS
from app.data.train_fleet_data import TRAIN_FLEET
from app.services.event_engine import event_manager
from app.services.train_simulator import train_sim

router = APIRouter(prefix="/api/network", tags=["Network Conditions"])


def _fleet_rows(tr: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Sections of a non-simulated train, straight from its fleet data (same source as the dashboard)."""
    results = []
    for s in tr.get("sections", []):
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
                {"id": f"EVT-{s['id']}", "title": f"{status.replace('_', ' ').title()} Order on {s['name']}", "impact_minutes": impact}
            ] if impact > 0 else [],
            "train_state": None,
            "progress_percent": None,
            "live_speed_kmh": None,
        })
    return results


def _live_rows() -> List[Dict[str, Any]]:
    """Sections of the simulated 12951 run: live events plus where the train is right now."""
    active_events = event_manager.get_active_events()
    sim_state = train_sim.get_state()["train"]
    journey_ids = {s["id"] for s in next(t for t in TRAIN_FLEET if t["id"] == train_sim.train_id)["sections"]}
    completed = sim_state["status"] == "COMPLETED"

    results = []
    for idx, sec in enumerate(SECTIONS):
        sec_id = sec["id"]
        if sec_id not in journey_ids:
            continue  # e.g. Delhi → Kota: the simulated run starts at Kota
        from_st = next(s for s in STATIONS if s["id"] == sec["from_station"])
        to_st = next(s for s in STATIONS if s["id"] == sec["to_station"])

        sec_events = [e for e in active_events if e.get("section_id") == sec_id or e.get("section_id") == "ALL"]
        has_congestion = any(e["type"] == "congestion" for e in sec_events)
        has_tsr = any(e["type"] == "speed_restriction" for e in sec_events)
        has_maint = any(e["type"] == "maintenance_block" for e in sec_events)

        if has_maint:
            status, status_color = "MAINTENANCE", "red"
        elif has_congestion:
            status, status_color = "CONGESTED", "amber"
        elif has_tsr:
            status, status_color = "SPEED RESTRICTION", "amber"
        else:
            status, status_color = "NORMAL", "emerald"

        # Where the live train is relative to this section
        if completed or idx < train_sim.section_index:
            train_state = "PASSED"
        elif idx == train_sim.section_index:
            train_state = "CURRENT"
        else:
            train_state = "AHEAD"
        is_current = train_state == "CURRENT"

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
            "expected_impact_min": round(sum(e.get("impact_minutes", 0.0) for e in sec_events), 1),
            "active_events": sec_events,
            "train_state": train_state,
            "progress_percent": sim_state["progress_percent"] if is_current else None,
            "live_speed_kmh": sim_state["speed_kmh"] if is_current else None,
        })
    return results


@router.get("/conditions")
def get_network_conditions(train_id: Optional[str] = Query(None, description="Filter sections by specific train corridor")) -> List[Dict[str, Any]]:
    # One train: the simulated train is live, the others come from their fleet data
    if train_id:
        if train_id == train_sim.train_id:
            return _live_rows()
        for tr in TRAIN_FLEET:
            if tr["id"] == train_id or tr["train_number"] == train_id:
                return _fleet_rows(tr)
        return []

    # Entire network: every monitored train's sections, each section listed once
    results: List[Dict[str, Any]] = _live_rows()
    seen = {r["section_id"] for r in results}
    for tr in TRAIN_FLEET:
        if tr["id"] == train_sim.train_id:
            continue
        for row in _fleet_rows(tr):
            if row["section_id"] not in seen:
                seen.add(row["section_id"])
                results.append(row)
    return results
