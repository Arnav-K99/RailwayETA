from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TrainTelemetry(BaseModel):
    id: str
    train_number: str
    name: str
    origin: str
    destination: str
    latitude: float
    longitude: float
    speed_kmh: float
    current_delay_min: float
    status: str
    current_station: str
    next_station: str
    next_station_code: str
    distance_to_next_km: float
    progress_percent: float
    current_section_id: str
    current_section_name: str

class UpcomingStationETA(BaseModel):
    station_id: str
    station_code: str
    station_name: str
    scheduled_arrival: str
    predicted_eta: str
    predicted_eta_full: str
    delay_minutes: float
    confidence_percent: int
    confidence_range: str
    distance_km: float
    has_active_disruption: bool

class WhyEtaChangedItem(BaseModel):
    factor: str
    category: str
    impact_min: float
    description: str

class OperationalEventCreate(BaseModel):
    type: str # 'congestion', 'speed_restriction', 'maintenance_block', 'unscheduled_halt', 'heavy_rain'
    section_id: str = "SEC-KOTA-SWM"
    title: Optional[str] = None
    severity: str = "HIGH"
    impact_minutes: Optional[float] = None
    description: Optional[str] = None

class OperationalEventResponse(BaseModel):
    id: str
    type: str
    section_id: str
    title: str
    severity: str
    impact_minutes: float
    weather_factor: float
    description: str
    active: bool

class SimulationControlRequest(BaseModel):
    action: str # 'start', 'pause', 'resume', 'reset'
    speed_multiplier: Optional[float] = None

class NetworkSectionCondition(BaseModel):
    section_id: str
    name: str
    from_station: str
    to_station: str
    distance_km: float
    max_speed_kmh: float
    historical_avg_time_min: float
    status: str # 'NORMAL', 'CONGESTED', 'RESTRICTED', 'MAINTENANCE'
    active_events: List[OperationalEventResponse]
    delay_impact_min: float
