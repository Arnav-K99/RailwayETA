import uuid
from typing import List, Dict, Any, Optional

class EventEngine:
    def __init__(self):
        # In-memory operational events registry
        self.events: Dict[str, Dict[str, Any]] = {}
        self._init_default_event_presets()

    def _init_default_event_presets(self):
        # Start clean or with neutral state
        self.events.clear()

    def get_all_events(self) -> List[Dict[str, Any]]:
        return list(self.events.values())

    def get_active_events(self) -> List[Dict[str, Any]]:
        return [ev for ev in self.events.values() if ev.get("active", True)]

    def get_section_events(self, section_id: str) -> List[Dict[str, Any]]:
        return [ev for ev in self.get_active_events() if ev.get("section_id") == section_id or ev.get("section_id") == "ALL"]

    def trigger_event(
        self,
        event_type: str,
        section_id: str = "SEC-KOTA-SWM",
        title: Optional[str] = None,
        severity: str = "HIGH",
        impact_minutes: float = 8.0,
        weather_factor: float = 1.0,
        description: str = ""
    ) -> Dict[str, Any]:
        event_id = f"EVT-{str(uuid.uuid4())[:8].upper()}"

        if event_type == "congestion":
            title = title or "Traffic Congestion Ahead"
            impact_minutes = 8.0
            description = description or "Heavy sectional freight & suburban congestion detected near yard throat."
        elif event_type == "speed_restriction":
            title = title or "Temporary Speed Restriction (TSR 30 km/h)"
            impact_minutes = 7.0
            description = description or "Engineering Caution Order: Track renewal & weld inspection zone."
        elif event_type == "maintenance_block":
            title = title or "Overhead Equipment (OHE) Maintenance Block"
            impact_minutes = 12.0
            description = description or "Scheduled power block on Up Line; single line working in effect."
        elif event_type == "unscheduled_halt":
            title = title or "Unscheduled Signal Halt"
            impact_minutes = 6.0
            description = description or "Signal hold at intermediate interlocking block due to platform reoccupation."
        elif event_type == "heavy_rain":
            title = title or "Monsoon Downpour & Reduced Visibility"
            impact_minutes = 5.0
            weather_factor = 1.15
            description = description or "Cautionary running due to heavy waterlogging and reduced signal sighting distance."
        else:
            title = title or "Operational Disruption"

        event = {
            "id": event_id,
            "type": event_type,
            "section_id": section_id,
            "title": title,
            "severity": severity,
            "impact_minutes": impact_minutes,
            "weather_factor": weather_factor,
            "description": description,
            "active": True
        }
        self.events[event_id] = event
        return event

    def remove_event(self, event_id: str) -> bool:
        if event_id in self.events:
            del self.events[event_id]
            return True
        return False

    def toggle_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        if event_id in self.events:
            self.events[event_id]["active"] = not self.events[event_id]["active"]
            return self.events[event_id]
        return None

    def clear_all_events(self):
        self.events.clear()

# Global singleton
event_manager = EventEngine()
