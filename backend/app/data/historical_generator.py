import os
import random
import numpy as np
import pandas as pd
from typing import Tuple
from app.data.corridor_data import SECTIONS

DATA_PATH = os.path.join(os.path.dirname(__file__), "historical_runs.csv")

def generate_synthetic_historical_data(n_samples: int = 12000, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic historical train run records for sections across the corridor.
    Simulates physical dynamics, operational anomalies, weather, and scheduling.
    """
    np.random.seed(seed)
    random.seed(seed)

    records = []
    
    for _ in range(n_samples):
        # Pick a random section
        sec = random.choice(SECTIONS)
        sec_id = sec["id"]
        dist = sec["distance_km"]
        hist_avg = sec["historical_avg_time_min"]
        hist_std = sec["historical_std_time_min"]
        max_speed = sec["max_permissible_speed_kmh"]
        
        # Operational context
        time_of_day = random.randint(0, 23)
        day_of_week = random.randint(0, 6) # 0 = Monday, 6 = Sunday
        
        # Peak traffic hours (08:00 - 11:00 and 17:00 - 21:00)
        is_peak = (8 <= time_of_day <= 11) or (17 <= time_of_day <= 21)
        
        # Congestion factor: 1.0 (clear) to 1.6 (severe junction queue)
        if is_peak:
            congestion_factor = np.random.beta(a=3, b=4) * 0.6 + 1.0
        else:
            congestion_factor = np.random.beta(a=2, b=6) * 0.4 + 1.0
            
        # Weather factor: 1.0 (clear) to 1.3 (heavy rain/fog)
        weather_roll = random.random()
        if weather_roll < 0.75:
            weather_factor = 1.0 # Clear
        elif weather_roll < 0.90:
            weather_factor = float(np.random.uniform(1.05, 1.15)) # Moderate rain
        else:
            weather_factor = float(np.random.uniform(1.15, 1.30)) # Heavy rain / fog
            
        # Temporary Speed Restriction (TSR)
        has_tsr = 1 if random.random() < 0.18 else 0
        if has_tsr:
            tsr_speed = random.choice([30.0, 45.0, 60.0])
            tsr_delay = (dist * 0.25) * ((1.0 / tsr_speed) - (1.0 / max_speed)) * 60.0
            tsr_delay = max(2.0, min(tsr_delay, 18.0))
        else:
            tsr_speed = max_speed
            tsr_delay = 0.0

        # Maintenance Block (Mega block / Caution order)
        has_maint_block = 1 if random.random() < 0.10 else 0
        maint_delay = float(np.random.uniform(8.0, 22.0)) if has_maint_block else 0.0
        
        # Previous Section Delay
        prev_delay = max(0.0, float(np.random.exponential(scale=10.0)))
        
        # Train current operating speed entered into section
        base_speed = float(np.random.uniform(0.75, 1.0) * max_speed)
        if has_tsr:
            current_speed = min(base_speed, tsr_speed)
        else:
            current_speed = base_speed
            
        # Physics baseline time = (distance / current_speed) * 60 min
        base_travel_time = (dist / max(current_speed, 25.0)) * 60.0
        
        # Dispatch knock-on effect (trains delayed > 15 min often get lower priority at junctions)
        knock_on_delay = 0.0
        if prev_delay > 15.0 and random.random() < 0.4:
            knock_on_delay = float(np.random.uniform(3.0, 12.0))
            
        # Real-world Indian Railways operational variance:
        # Loop line siding delays, signal checks, braking curves, and headway jitter
        signal_jitter = float(np.random.normal(0, hist_std * 1.05))
        loop_line_hold = float(np.random.exponential(scale=3.5)) if random.random() < 0.22 else 0.0
        driver_throttle_variance = float(np.random.normal(0, 2.2))
        
        actual_time = (
            base_travel_time * (congestion_factor ** 0.82) * weather_factor
            + tsr_delay
            + maint_delay
            + knock_on_delay
            + signal_jitter
            + loop_line_hold
            + driver_throttle_variance
        )
        
        # Ensure physical floor (cannot travel faster than maximum permissible speed without stopping)
        physical_min_time = (dist / max_speed) * 60.0 * 0.95
        actual_time = max(physical_min_time, actual_time)
        
        records.append({
            "section_id": sec_id,
            "distance_km": dist,
            "max_permissible_speed_kmh": max_speed,
            "historical_avg_time_min": hist_avg,
            "historical_std_time_min": hist_std,
            "current_speed_kmh": round(current_speed, 1),
            "current_delay_min": round(prev_delay, 1),
            "time_of_day_hour": time_of_day,
            "day_of_week": day_of_week,
            "weather_factor": round(weather_factor, 3),
            "congestion_factor": round(congestion_factor, 3),
            "speed_restriction_active": has_tsr,
            "speed_restriction_kmh": round(tsr_speed, 1),
            "maintenance_block_active": has_maint_block,
            "previous_section_delay_min": round(prev_delay, 1),
            "actual_section_time_min": round(actual_time, 2)
        })

    df = pd.DataFrame(records)
    df.to_csv(DATA_PATH, index=False)
    return df

def get_or_create_historical_data() -> pd.DataFrame:
    """Returns cached historical data or generates fresh dataset."""
    if os.path.exists(DATA_PATH):
        try:
            return pd.read_csv(DATA_PATH)
        except Exception:
            pass
    return generate_synthetic_historical_data()

if __name__ == "__main__":
    df = generate_synthetic_historical_data(12000)
    print(f"Generated {len(df)} historical section records at {DATA_PATH}")
    print(df.head())
