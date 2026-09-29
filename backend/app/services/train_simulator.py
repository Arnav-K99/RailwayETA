import asyncio
import math
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from app.data.corridor_data import STATIONS, SECTIONS
from app.services.eta_engine import eta_service
from app.services.event_engine import event_manager

class TrainSimulator:
    def __init__(self):
        self.train_id = "12951"
        self.train_number = "12951"
        self.name = "Rajdhani Express"
        self.origin = "Delhi"
        self.destination = "Agra Cantt"
        
        # Simulation control parameters
        self.is_running = False
        self.is_paused = False
        self.speed_multiplier = 10.0 # Default 10x
        self._task: Optional[asyncio.Task] = None
        self._listeners = []

        self.reset()

    def reset(self):
        """Resets the train to initial demonstration state: at Kota departing towards Sawai Madhopur."""
        self.is_running = False
        self.is_paused = False
        
        # Start at 18:35:00 at Kota Junction (departing Kota)
        self.sim_time = datetime(2026, 9, 30, 18, 35, 0)
        self.section_index = 1 # Index 1 corresponds to SEC-KOTA-SWM
        self.current_section = SECTIONS[self.section_index]
        self.polyline = self.current_section["polyline"]
        
        # Position at start of Kota -> SWM
        self.current_lat = self.polyline[0][0]
        self.current_lon = self.polyline[0][1]
        
        # Telemetry
        self.speed_kmh = 72.0
        self.target_speed_kmh = 115.0
        self.current_delay_min = 15.0 # Initial baseline delay per spec
        self.status = "READY" # READY, RUNNING, HALTED_AT_STATION, PAUSED, COMPLETED
        
        # Progress within section: 0.0 to 1.0
        self.section_progress = 0.0
        self.point_index = 0
        self.total_points = len(self.polyline)
        
        # Station halt timer (simulated seconds)
        self.halt_seconds_remaining = 0.0
        
        # Clear operational events on reset
        event_manager.clear_all_events()

    def start(self):
        if not self.is_running:
            self.is_running = True
            self.is_paused = False
            self.status = "RUNNING"
            if self._task is None or self._task.done():
                self._task = asyncio.create_task(self._simulation_loop())

    def pause(self):
        if self.is_running:
            self.is_paused = True
            self.status = "PAUSED"

    def resume(self):
        if self.is_running and self.is_paused:
            self.is_paused = False
            self.status = "RUNNING"

    def set_speed_multiplier(self, factor: float):
        self.speed_multiplier = max(1.0, min(factor, 100.0))

    def get_state(self) -> Dict[str, Any]:
        from_st = next(s for s in STATIONS if s["id"] == self.current_section["from_station"])
        to_st = next(s for s in STATIONS if s["id"] == self.current_section["to_station"])
        
        dist_total = self.current_section["distance_km"]
        dist_covered = dist_total * self.section_progress
        dist_remaining = max(0.0, dist_total - dist_covered)

        # Call dynamic ETA Engine
        eta_results = eta_service.calculate_etas(
            current_sim_time=self.sim_time,
            current_lat=self.current_lat,
            current_lon=self.current_lon,
            current_speed_kmh=self.speed_kmh,
            current_delay_min=self.current_delay_min,
            current_section_index=self.section_index,
            progress_in_section=self.section_progress
        )

        return {
            "train": {
                "id": self.train_id,
                "train_number": self.train_number,
                "name": self.name,
                "origin": self.origin,
                "destination": self.destination,
                "latitude": round(self.current_lat, 5),
                "longitude": round(self.current_lon, 5),
                "speed_kmh": round(self.speed_kmh, 1),
                "current_delay_min": round(self.current_delay_min, 1),
                "status": self.status,
                "current_station": from_st["name"],
                "next_station": to_st["name"],
                "next_station_code": to_st["code"],
                "distance_to_next_km": round(dist_remaining, 1),
                "progress_percent": round(self.section_progress * 100, 1),
                "current_section_id": self.current_section["id"],
                "current_section_name": self.current_section["name"]
            },
            "simulation": {
                "sim_time": self.sim_time.strftime("%H:%M:%S"),
                "speed_multiplier": self.speed_multiplier,
                "is_running": self.is_running,
                "is_paused": self.is_paused
            },
            "upcoming_stations": eta_results["upcoming_stations"],
            "why_eta_changed": eta_results["why_eta_changed"],
            "active_events": event_manager.get_active_events(),
            "timestamp": datetime.now().isoformat()
        }

    async def _simulation_loop(self):
        """Simulation physics loop updating train state continuously with proportional speed scaling."""
        dt_real = 0.25 # Tick every 250 ms in real time for responsive motion
        
        while self.is_running:
            try:
                await asyncio.sleep(dt_real)
                
                if self.is_paused:
                    continue

                # Scale simulation clock and distance proportionally with speed_multiplier
                sim_dt_seconds = dt_real * (self.speed_multiplier * 5.0)
                self.sim_time = self.sim_time + timedelta(seconds=sim_dt_seconds)
                
                # Check for active operational disruptions affecting current section
                active_events = event_manager.get_section_events(self.current_section["id"])
                has_tsr = any(e["type"] == "speed_restriction" for e in active_events)
                has_halt = any(e["type"] == "unscheduled_halt" for e in active_events)
                has_congestion = any(e["type"] == "congestion" for e in active_events)
                has_maint = any(e["type"] == "maintenance_block" for e in active_events)

                # 1. Handle Station Halt or Unscheduled Halt
                if has_halt:
                    self.speed_kmh = max(0.0, self.speed_kmh - 25.0 * dt_real)
                    self.status = "SIGNAL_HALT"
                    self.current_delay_min += (sim_dt_seconds / 60.0)
                    continue

                if self.halt_seconds_remaining > 0:
                    self.halt_seconds_remaining -= sim_dt_seconds
                    self.speed_kmh = 0.0
                    self.status = "STATION_HALT"
                    if self.halt_seconds_remaining <= 0:
                        self.status = "RUNNING"
                    continue

                # 2. Dynamic Speed Regulation based on conditions
                max_perm = self.current_section["max_permissible_speed_kmh"]
                if has_tsr:
                    self.target_speed_kmh = 30.0
                elif has_maint or has_congestion:
                    self.target_speed_kmh = 55.0
                else:
                    self.target_speed_kmh = max_perm * 0.92

                # Smooth acceleration / deceleration
                if self.speed_kmh < self.target_speed_kmh:
                    self.speed_kmh = min(self.target_speed_kmh, self.speed_kmh + 12.0 * dt_real)
                elif self.speed_kmh > self.target_speed_kmh:
                    self.speed_kmh = max(self.target_speed_kmh, self.speed_kmh - 18.0 * dt_real)

                # 3. Distance & Position Traversal
                # Distance covered in sim_dt_seconds: (km/h) * (seconds / 3600)
                dist_delta_km = self.speed_kmh * (sim_dt_seconds / 3600.0)
                sec_dist = self.current_section["distance_km"]
                
                # Update delay if running slower than section scheduled average
                expected_speed = (sec_dist / self.current_section["historical_avg_time_min"]) * 60.0
                if self.speed_kmh < expected_speed:
                    loss_rate_min = ((expected_speed - self.speed_kmh) / expected_speed) * (sim_dt_seconds / 60.0)
                    self.current_delay_min += loss_rate_min * 0.35

                # Progress along polyline
                delta_fraction = dist_delta_km / sec_dist
                self.section_progress = min(1.0, self.section_progress + delta_fraction)
                
                # Smooth continuous coordinate interpolation along polyline
                exact_idx = self.section_progress * (self.total_points - 1)
                p1 = min(int(exact_idx), self.total_points - 1)
                p2 = min(p1 + 1, self.total_points - 1)
                sub_t = exact_idx - p1
                
                lat1, lon1 = self.polyline[p1]
                lat2, lon2 = self.polyline[p2]
                
                self.current_lat = round(lat1 + (lat2 - lat1) * sub_t, 6)
                self.current_lon = round(lon1 + (lon2 - lon1) * sub_t, 6)

                # 4. Check Section Arrival & Next Section Transition
                if self.section_progress >= 0.999:
                    # Train reached to_station
                    to_station_id = self.current_section["to_station"]
                    
                    if self.section_index < len(SECTIONS) - 1:
                        # Advance to next section
                        self.section_index += 1
                        self.current_section = SECTIONS[self.section_index]
                        self.polyline = self.current_section["polyline"]
                        self.total_points = len(self.polyline)
                        self.section_progress = 0.0
                        self.point_index = 0
                        
                        # Halt at intermediate junction for 20-30 seconds sim time
                        self.halt_seconds_remaining = 35.0
                        self.status = "STATION_HALT"
                    else:
                        # Journey completed at Agra Cantt
                        self.status = "COMPLETED"
                        self.speed_kmh = 0.0
                        self.is_running = False

            except Exception as e:
                print(f"[Train Simulator] Error in simulation step: {e}")
                await asyncio.sleep(1.0)

# Global singleton
train_sim = TrainSimulator()
