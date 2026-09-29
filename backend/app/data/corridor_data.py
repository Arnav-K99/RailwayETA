import math
from typing import List, Dict, Any

# Stations along the demonstration corridor:
# Delhi -> Kota -> Sawai Madhopur -> Gangapur City -> Bharatpur -> Mathura -> Agra
STATIONS: List[Dict[str, Any]] = [
    {
        "id": "NDLS",
        "code": "NDLS",
        "name": "New Delhi",
        "lat": 28.6431,
        "lon": 77.2197,
        "distance_from_origin_km": 0.0,
        "scheduled_arrival": "16:55",
        "scheduled_departure": "16:55",
        "platform": 1,
        "zone": "NR"
    },
    {
        "id": "KOTA",
        "code": "KOTA",
        "name": "Kota Junction",
        "lat": 25.2138,
        "lon": 75.8648,
        "distance_from_origin_km": 465.0,
        "scheduled_arrival": "18:30",
        "scheduled_departure": "18:35",
        "platform": 2,
        "zone": "WCR"
    },
    {
        "id": "SWM",
        "code": "SWM",
        "name": "Sawai Madhopur",
        "lat": 25.9928,
        "lon": 76.3683,
        "distance_from_origin_km": 573.0,  # +108 km
        "scheduled_arrival": "19:30",
        "scheduled_departure": "19:32",
        "platform": 1,
        "zone": "WCR"
    },
    {
        "id": "GGC",
        "code": "GGC",
        "name": "Gangapur City",
        "lat": 26.4716,
        "lon": 76.7188,
        "distance_from_origin_km": 637.0,  # +64 km
        "scheduled_arrival": "20:20",
        "scheduled_departure": "20:22",
        "platform": 3,
        "zone": "WCR"
    },
    {
        "id": "BTE",
        "code": "BTE",
        "name": "Bharatpur",
        "lat": 27.2152,
        "lon": 77.4930,
        "distance_from_origin_km": 757.0,  # +120 km
        "scheduled_arrival": "22:00",
        "scheduled_departure": "22:02",
        "platform": 2,
        "zone": "WCR"
    },
    {
        "id": "MTJ",
        "code": "MTJ",
        "name": "Mathura",
        "lat": 27.4924,
        "lon": 77.6737,
        "distance_from_origin_km": 792.0,  # +35 km
        "scheduled_arrival": "22:50",
        "scheduled_departure": "22:55",
        "platform": 1,
        "zone": "NCR"
    },
    {
        "id": "AGC",
        "code": "AGC",
        "name": "Agra Cantt",
        "lat": 27.1593,
        "lon": 77.9942,
        "distance_from_origin_km": 846.0,  # +54 km
        "scheduled_arrival": "23:40",
        "scheduled_departure": "23:40",
        "platform": 4,
        "zone": "NCR"
    }
]

# Section definitions between stations
SECTIONS: List[Dict[str, Any]] = [
    {
        "id": "SEC-NDLS-KOTA",
        "from_station": "NDLS",
        "to_station": "KOTA",
        "name": "Delhi → Kota",
        "distance_km": 465.0,
        "historical_avg_time_min": 275.0,
        "historical_std_time_min": 14.5,
        "max_permissible_speed_kmh": 130.0,
        "track_type": "Double Electrified (Automatic Block)",
        "gradient": "Level"
    },
    {
        "id": "SEC-KOTA-SWM",
        "from_station": "KOTA",
        "to_station": "SWM",
        "name": "Kota → Sawai Madhopur",
        "distance_km": 108.0,
        "historical_avg_time_min": 58.0,
        "historical_std_time_min": 6.2,
        "max_permissible_speed_kmh": 130.0,
        "track_type": "Double Electrified (Automatic Block)",
        "gradient": "1 in 200 rising"
    },
    {
        "id": "SEC-SWM-GGC",
        "from_station": "SWM",
        "to_station": "GGC",
        "name": "Sawai Madhopur → Gangapur City",
        "distance_km": 64.0,
        "historical_avg_time_min": 48.0,
        "historical_std_time_min": 5.1,
        "max_permissible_speed_kmh": 120.0,
        "track_type": "Double Electrified",
        "gradient": "Level"
    },
    {
        "id": "SEC-GGC-BTE",
        "from_station": "GGC",
        "to_station": "BTE",
        "name": "Gangapur City → Bharatpur",
        "distance_km": 120.0,
        "historical_avg_time_min": 98.0,
        "historical_std_time_min": 9.4,
        "max_permissible_speed_kmh": 110.0,
        "track_type": "Double Electrified",
        "gradient": "1 in 150 undulating"
    },
    {
        "id": "SEC-BTE-MTJ",
        "from_station": "BTE",
        "to_station": "MTJ",
        "name": "Bharatpur → Mathura",
        "distance_km": 35.0,
        "historical_avg_time_min": 48.0,
        "historical_std_time_min": 4.8,
        "max_permissible_speed_kmh": 100.0,
        "track_type": "Triple Electrified Junction Approach",
        "gradient": "Level"
    },
    {
        "id": "SEC-MTJ-AGC",
        "from_station": "MTJ",
        "to_station": "AGC",
        "name": "Mathura → Agra Cantt",
        "distance_km": 54.0,
        "historical_avg_time_min": 45.0,
        "historical_std_time_min": 4.2,
        "max_permissible_speed_kmh": 120.0,
        "track_type": "Double Electrified",
        "gradient": "Level"
    }
]

def generate_interpolated_points(start_lat: float, start_lon: float, end_lat: float, end_lon: float, count: int = 30) -> List[List[float]]:
    """Generate intermediate coordinates along the railway track between consecutive stations."""
    points = []
    for i in range(count + 1):
        t = i / float(count)
        lat = start_lat + (end_lat - start_lat) * t
        lon = start_lon + (end_lon - start_lon) * t
        points.append([round(lat, 5), round(lon, 5)])
    return points

# Pre-generate full detailed route coordinates with realistic sub-points
FULL_ROUTE_POLYLINE: List[Dict[str, Any]] = []

for sec in SECTIONS:
    from_st = next(s for s in STATIONS if s["id"] == sec["from_station"])
    to_st = next(s for s in STATIONS if s["id"] == sec["to_station"])
    # 25-40 interpolation steps per section
    steps = max(20, int(sec["distance_km"] / 3.0))
    sub_points = generate_interpolated_points(from_st["lat"], from_st["lon"], to_st["lat"], to_st["lon"], count=steps)
    
    sec["polyline"] = sub_points
