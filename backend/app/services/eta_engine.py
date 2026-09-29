import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from app.data.corridor_data import STATIONS, SECTIONS
from app.services.prediction_model import prediction_engine
from app.services.event_engine import event_manager

def parse_time_str(time_str: str, base_date: Optional[datetime] = None) -> datetime:
    """Parses 'HH:MM' or 'HH:MM:SS' into a datetime object."""
    if base_date is None:
        base_date = datetime(2026, 9, 30, 0, 0, 0)
    parts = [int(p) for p in time_str.split(":")]
    h = parts[0]
    m = parts[1]
    s = parts[2] if len(parts) > 2 else 0
    return base_date.replace(hour=h, minute=m, second=s, microsecond=0)

def format_time_str(dt: datetime) -> str:
    return dt.strftime("%H:%M")

def format_time_full(dt: datetime) -> str:
    return dt.strftime("%H:%M:%S")

class HybridETAEngine:
    """
    Hybrid ETA Forecasting Engine combining:
    1. Machine Learning (Gradient Boosted Regressor on Section Historical Data)
    2. Dynamic Operational Constraints (TSRs, Congestion Queues, Mega Blocks)
    3. Downstream Cumulative Propagation Logic
    4. Probabilistic Uncertainty & Confidence Estimation
    5. Causal Explainability Attribution ('Why ETA Changed')
    """

    def calculate_etas(
        self,
        current_sim_time: datetime,
        current_lat: float,
        current_lon: float,
        current_speed_kmh: float,
        current_delay_min: float,
        current_section_index: int,
        progress_in_section: float # 0.0 to 1.0
    ) -> Dict[str, Any]:
        
        active_events = event_manager.get_active_events()
        
        # Aggregated operational factors
        corridor_weather_factor = 1.0
        unscheduled_halt_min = 0.0
        
        for ev in active_events:
            if ev["type"] == "heavy_rain":
                corridor_weather_factor = max(corridor_weather_factor, ev.get("weather_factor", 1.15))
            if ev["type"] == "unscheduled_halt":
                unscheduled_halt_min += ev.get("impact_minutes", 6.0)

        upcoming_stations = []
        explanation_items = []
        
        # Tracker for downstream propagation
        running_time = current_sim_time
        accumulated_delay = current_delay_min + unscheduled_halt_min
        
        total_congestion_impact = 0.0
        total_tsr_impact = 0.0
        total_maint_impact = 0.0
        total_weather_impact = 0.0
        cumulative_variance = 4.0 # Baseline model variance

        # Determine remaining sections
        # current_section_index corresponds to SECTIONS index (0: NDLS-KOTA, 1: KOTA-SWM, etc.)
        remaining_sections = SECTIONS[current_section_index:]
        
        for hop_idx, sec in enumerate(remaining_sections):
            sec_id = sec["id"]
            to_station_id = sec["to_station"]
            station_info = next(s for s in STATIONS if s["id"] == to_station_id)
            
            # Check section-specific events
            sec_events = [ev for ev in active_events if ev.get("section_id") == sec_id or ev.get("section_id") == "ALL"]
            
            has_tsr = any(ev["type"] == "speed_restriction" for ev in sec_events)
            has_maint = any(ev["type"] == "maintenance_block" for ev in sec_events)
            has_congestion = any(ev["type"] == "congestion" for ev in sec_events)
            
            # Section operational impacts
            sec_congestion_min = 8.0 if has_congestion else 0.0
            sec_tsr_min = 7.0 if has_tsr else 0.0
            sec_maint_min = 12.0 if has_maint else 0.0
            
            # Distance remaining in section
            total_dist = sec["distance_km"]
            if hop_idx == 0:
                dist_factor = max(0.01, 1.0 - progress_in_section)
                rem_dist = total_dist * dist_factor
            else:
                dist_factor = 1.0
                rem_dist = total_dist

            # ML Feature Vector Preparation
            operational_speed = current_speed_kmh if (hop_idx == 0 and current_speed_kmh > 15) else (
                45.0 if has_tsr else sec["max_permissible_speed_kmh"] * 0.90
            )
            
            feature_vector = {
                "distance_km": rem_dist,
                "historical_avg_time_min": sec["historical_avg_time_min"] * dist_factor,
                "historical_std_time_min": sec["historical_std_time_min"] * math.sqrt(dist_factor),
                "current_speed_kmh": operational_speed,
                "current_delay_min": accumulated_delay,
                "time_of_day_hour": running_time.hour,
                "day_of_week": running_time.weekday(),
                "weather_factor": corridor_weather_factor,
                "congestion_factor": 1.4 if has_congestion else (1.15 if 18 <= running_time.hour <= 21 else 1.0),
                "speed_restriction_active": 1 if has_tsr else 0,
                "speed_restriction_kmh": 30.0 if has_tsr else sec["max_permissible_speed_kmh"],
                "maintenance_block_active": 1 if has_maint else 0,
                "previous_section_delay_min": accumulated_delay
            }
            
            # 1. Base ML model predicted traversal time
            ml_base_time = prediction_engine.predict_section_time(feature_vector)
            
            # 2. Add explicit operational constraint increments
            rule_increment = (sec_congestion_min + sec_tsr_min + sec_maint_min) * dist_factor
            weather_increment = ml_base_time * (corridor_weather_factor - 1.0)
            
            total_section_time = ml_base_time + rule_increment + weather_increment
            
            # Track explainability metrics for first 2 hops
            if hop_idx <= 1:
                total_congestion_impact += sec_congestion_min * dist_factor
                total_tsr_impact += sec_tsr_min * dist_factor
                total_maint_impact += sec_maint_min * dist_factor
                total_weather_impact += weather_increment

            # Advance simulation clock along section
            running_time = running_time + timedelta(minutes=total_section_time)
            
            # Scheduled arrival time
            scheduled_dt = parse_time_str(station_info["scheduled_arrival"], base_date=current_sim_time)
            
            # Arrival delay at this upcoming station
            predicted_arrival_dt = running_time
            delay_minutes = (predicted_arrival_dt - scheduled_dt).total_seconds() / 60.0
            accumulated_delay = delay_minutes # Downstream delay propagation
            
            # Uncertainty estimation
            cumulative_variance += (sec["historical_std_time_min"] * math.sqrt(dist_factor)) ** 2
            uncertainty_std = math.sqrt(cumulative_variance)
            margin_min = max(2, int(round(uncertainty_std * 0.9)))
            
            lower_bound_dt = predicted_arrival_dt - timedelta(minutes=margin_min)
            upper_bound_dt = predicted_arrival_dt + timedelta(minutes=margin_min)
            
            # Confidence decays with number of hops and active disruptions
            confidence_pct = max(68, int(round(94 - (hop_idx * 3.5) - (abs(delay_minutes) * 0.12))))
            
            upcoming_stations.append({
                "station_id": station_info["id"],
                "station_code": station_info["code"],
                "station_name": station_info["name"],
                "scheduled_arrival": station_info["scheduled_arrival"],
                "predicted_eta": format_time_str(predicted_arrival_dt),
                "predicted_eta_full": format_time_full(predicted_arrival_dt),
                "delay_minutes": round(delay_minutes, 1),
                "confidence_percent": confidence_pct,
                "confidence_range": f"{format_time_str(lower_bound_dt)} – {format_time_str(upper_bound_dt)}",
                "distance_km": round(rem_dist, 1),
                "has_active_disruption": (has_tsr or has_maint or has_congestion)
            })
            
            # Add scheduled station halt duration before departing to next section
            halt_min = 2.0
            if station_info["id"] in ["KOTA", "MTJ"]:
                halt_min = 5.0
            running_time = running_time + timedelta(minutes=halt_min)

        # Build Explainability Waterfall ('Why Did ETA Change?')
        why_items = []
        if current_delay_min > 0.5:
            why_items.append({
                "factor": "Current Existing Delay",
                "category": "BASE_DELAY",
                "impact_min": round(current_delay_min, 1),
                "description": "Inherited delay from previous section running"
            })
        if total_congestion_impact > 0:
            why_items.append({
                "factor": "Traffic Congestion",
                "category": "CONGESTION",
                "impact_min": round(total_congestion_impact, 1),
                "description": "High section occupancy / freight train queuing"
            })
        if total_tsr_impact > 0:
            why_items.append({
                "factor": "Temporary Speed Restriction",
                "category": "TSR",
                "impact_min": round(total_tsr_impact, 1),
                "description": "TSR 30 km/h caution order in active block"
            })
        if total_maint_impact > 0:
            why_items.append({
                "factor": "Maintenance Block",
                "category": "MAINTENANCE",
                "impact_min": round(total_maint_impact, 1),
                "description": "OHE power block / Single-line operation"
            })
        if unscheduled_halt_min > 0:
            why_items.append({
                "factor": "Unscheduled Halt",
                "category": "HALT",
                "impact_min": round(unscheduled_halt_min, 1),
                "description": "Station / junction signal hold"
            })
        if total_weather_impact > 0.5:
            why_items.append({
                "factor": "Monsoon / Weather Drag",
                "category": "WEATHER",
                "impact_min": round(total_weather_impact, 1),
                "description": "Wet rail adhesion & reduced visibility caution"
            })

        # Sectional buffer / recovery credit if train running briskly
        first_hop_delay = upcoming_stations[0]["delay_minutes"] if upcoming_stations else current_delay_min
        explained_sum = sum(item["impact_min"] for item in why_items)
        residual_variance = round(first_hop_delay - explained_sum, 1)
        
        if abs(residual_variance) >= 1.0:
            why_items.append({
                "factor": "Sectional Recovery / Variance",
                "category": "HISTORICAL_PATTERN",
                "impact_min": residual_variance,
                "description": "Historical headway variability & slack absorption"
            })

        return {
            "upcoming_stations": upcoming_stations,
            "next_station": upcoming_stations[0] if upcoming_stations else None,
            "why_eta_changed": why_items,
            "active_events_count": len(active_events),
            "calculated_at": format_time_full(current_sim_time)
        }

# Global singleton
eta_service = HybridETAEngine()
