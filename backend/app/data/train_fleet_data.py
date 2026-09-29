from typing import List, Dict, Any

TRAIN_FLEET: List[Dict[str, Any]] = [
    {
        "id": "12951",
        "train_number": "12951",
        "name": "Mumbai Tejas Rajdhani Express",
        "origin": "New Delhi (NDLS)",
        "destination": "Mumbai Central (MMCT)",
        "current_station": "Kota Junction",
        "next_station": "Sawai Madhopur",
        "next_station_code": "SWM",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "speed_kmh": 72.0,
        "current_delay_min": 15.0,
        "status": "RUNNING",
        "zone": "WCR / NCR",
        "type": "PREMIER_SUPERFAST",
        "is_simulation_target": True,
        "sections": [
            {"id": "SEC-KOTA-SWM", "name": "Kota → Sawai Madhopur", "distance_km": 108.0, "status": "CONGESTED", "speed_limit": 130, "expected_impact_min": 8.0},
            {"id": "SEC-SWM-GGC", "name": "Sawai Madhopur → Gangapur City", "distance_km": 64.0, "status": "NORMAL", "speed_limit": 120, "expected_impact_min": 0.0},
            {"id": "SEC-GGC-BTE", "name": "Gangapur City → Bharatpur", "distance_km": 120.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0},
            {"id": "SEC-BTE-MTJ", "name": "Bharatpur → Mathura", "distance_km": 35.0, "status": "NORMAL", "speed_limit": 100, "expected_impact_min": 0.0},
            {"id": "SEC-MTJ-AGC", "name": "Mathura → Agra Cantt", "distance_km": 54.0, "status": "NORMAL", "speed_limit": 120, "expected_impact_min": 0.0}
        ],
        "upcoming_stations": [
            {"station_id": "SWM", "station_code": "SWM", "station_name": "Sawai Madhopur", "scheduled_arrival": "19:30", "predicted_eta": "19:48", "delay_minutes": 18.0, "confidence_percent": 91, "confidence_range": "19:44 – 19:53", "distance_km": 108.0, "has_active_disruption": True},
            {"station_id": "GGC", "station_code": "GGC", "station_name": "Gangapur City", "scheduled_arrival": "20:20", "predicted_eta": "20:42", "delay_minutes": 22.0, "confidence_percent": 88, "confidence_range": "20:36 – 20:48", "distance_km": 64.0, "has_active_disruption": False},
            {"station_id": "BTE", "station_code": "BTE", "station_name": "Bharatpur", "scheduled_arrival": "22:00", "predicted_eta": "22:28", "delay_minutes": 28.0, "confidence_percent": 85, "confidence_range": "22:20 – 22:36", "distance_km": 120.0, "has_active_disruption": False},
            {"station_id": "MTJ", "station_code": "MTJ", "station_name": "Mathura", "scheduled_arrival": "22:50", "predicted_eta": "23:21", "delay_minutes": 31.0, "confidence_percent": 82, "confidence_range": "23:12 – 23:30", "distance_km": 35.0, "has_active_disruption": False},
            {"station_id": "AGC", "station_code": "AGC", "station_name": "Agra Cantt", "scheduled_arrival": "23:40", "predicted_eta": "00:12", "delay_minutes": 32.0, "confidence_percent": 79, "confidence_range": "00:02 – 00:22", "distance_km": 54.0, "has_active_disruption": False}
        ],
        "why_eta_changed": [
            {"factor": "Current Existing Delay", "category": "BASE_DELAY", "impact_min": 15.0, "description": "Inherited delay from previous section running"},
            {"factor": "Traffic Congestion", "category": "CONGESTION", "impact_min": 8.0, "description": "Heavy sectional freight queuing near Kota yard"},
            {"factor": "Sectional Headway Variance", "category": "HISTORICAL_PATTERN", "impact_min": 9.0, "description": "Historical evening peak slack absorption"}
        ]
    },
    {
        "id": "12002",
        "train_number": "12002",
        "name": "Bhopal Shatabdi Express",
        "origin": "New Delhi (NDLS)",
        "destination": "Rani Kamlapati (RKMP)",
        "current_station": "Mathura Junction",
        "next_station": "Agra Cantt",
        "next_station_code": "AGC",
        "latitude": 27.4924,
        "longitude": 77.6737,
        "speed_kmh": 128.0,
        "current_delay_min": 3.0,
        "status": "ON_TIME",
        "zone": "NCR",
        "type": "SHATABDI_EXPRESS",
        "is_simulation_target": False,
        "sections": [
            {"id": "SEC-MTJ-AGC", "name": "Mathura → Agra Cantt", "distance_km": 54.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-AGC-DHO", "name": "Agra Cantt → Dholpur", "distance_km": 55.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-DHO-GWL", "name": "Dholpur → Gwalior", "distance_km": 66.0, "status": "SPEED_RESTRICTION", "speed_limit": 45, "expected_impact_min": 6.0},
            {"id": "SEC-GWL-VGLJ", "name": "Gwalior → Jhansi Jn", "distance_km": 98.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-VGLJ-BPL", "name": "Jhansi → Bhopal Jn", "distance_km": 292.0, "status": "NORMAL", "speed_limit": 120, "expected_impact_min": 0.0}
        ],
        "upcoming_stations": [
            {"station_id": "AGC", "station_code": "AGC", "station_name": "Agra Cantt", "scheduled_arrival": "07:50", "predicted_eta": "07:53", "delay_minutes": 3.0, "confidence_percent": 96, "confidence_range": "07:51 – 07:55", "distance_km": 54.0, "has_active_disruption": False},
            {"station_id": "DHO", "station_code": "DHO", "station_name": "Dholpur Jn", "scheduled_arrival": "08:35", "predicted_eta": "08:39", "delay_minutes": 4.0, "confidence_percent": 93, "confidence_range": "08:36 – 08:42", "distance_km": 55.0, "has_active_disruption": False},
            {"station_id": "GWL", "station_code": "GWL", "station_name": "Gwalior Jn", "scheduled_arrival": "09:23", "predicted_eta": "09:33", "delay_minutes": 10.0, "confidence_percent": 90, "confidence_range": "09:29 – 09:37", "distance_km": 66.0, "has_active_disruption": True},
            {"station_id": "VGLJ", "station_code": "VGLJ", "station_name": "Jhansi Jn", "scheduled_arrival": "10:45", "predicted_eta": "10:56", "delay_minutes": 11.0, "confidence_percent": 86, "confidence_range": "10:50 – 11:02", "distance_km": 98.0, "has_active_disruption": False},
            {"station_id": "BPL", "station_code": "BPL", "station_name": "Bhopal Jn", "scheduled_arrival": "14:05", "predicted_eta": "14:18", "delay_minutes": 13.0, "confidence_percent": 81, "confidence_range": "14:08 – 14:28", "distance_km": 292.0, "has_active_disruption": False}
        ],
        "why_eta_changed": [
            {"factor": "Current Delay", "category": "BASE_DELAY", "impact_min": 3.0, "description": "Minor signal headway at Mathura yard exit"},
            {"factor": "Chambal Bridge TSR 45 km/h", "category": "TSR", "impact_min": 6.0, "description": "Bridge girder inspection Caution Order on Dholpur–Gwalior section"},
            {"factor": "Sectional Recovery Margin", "category": "HISTORICAL_PATTERN", "impact_min": 2.0, "description": "High horsepower WAP-7 capability absorbs partial loss"}
        ]
    },
    {
        "id": "22436",
        "train_number": "22436",
        "name": "Vande Bharat Express",
        "origin": "New Delhi (NDLS)",
        "destination": "Varanasi Jn (BSB)",
        "current_station": "Kanpur Central",
        "next_station": "Prayagraj Jn",
        "next_station_code": "PRYJ",
        "latitude": 26.4537,
        "longitude": 80.3507,
        "speed_kmh": 130.0,
        "current_delay_min": 0.0,
        "status": "ON_TIME",
        "zone": "NCR",
        "type": "VANDE_BHARAT",
        "is_simulation_target": False,
        "sections": [
            {"id": "SEC-CNB-PRYJ", "name": "Kanpur Central → Prayagraj Jn", "distance_km": 194.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-PRYJ-BSB", "name": "Prayagraj Jn → Varanasi Jn", "distance_km": 125.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0}
        ],
        "upcoming_stations": [
            {"station_id": "PRYJ", "station_code": "PRYJ", "station_name": "Prayagraj Jn", "scheduled_arrival": "12:08", "predicted_eta": "12:08", "delay_minutes": 0.0, "confidence_percent": 97, "confidence_range": "12:06 – 12:10", "distance_km": 194.0, "has_active_disruption": False},
            {"station_id": "BSB", "station_code": "BSB", "station_name": "Varanasi Jn", "scheduled_arrival": "14:00", "predicted_eta": "14:02", "delay_minutes": 2.0, "confidence_percent": 94, "confidence_range": "13:58 – 14:06", "distance_km": 125.0, "has_active_disruption": False}
        ],
        "why_eta_changed": [
            {"factor": "Optimal Track Headway", "category": "NOMINAL", "impact_min": 0.0, "description": "Automatic 4-aspect signaling clear block running on high speed corridor"},
            {"factor": "Approach Dwell Buffer", "category": "HISTORICAL_PATTERN", "impact_min": 2.0, "description": "Mandatory platform deceleration clearance into Varanasi"}
        ]
    },
    {
        "id": "12260",
        "train_number": "12260",
        "name": "Sealdah Duronto Express",
        "origin": "Bikaner (BKN)",
        "destination": "Sealdah (SDAH)",
        "current_station": "Dhanbad Junction",
        "next_station": "Asansol Junction",
        "next_station_code": "ASN",
        "latitude": 23.7957,
        "longitude": 86.4304,
        "speed_kmh": 88.0,
        "current_delay_min": 28.0,
        "status": "DELAYED",
        "zone": "ER",
        "type": "DURONTO_EXPRESS",
        "is_simulation_target": False,
        "sections": [
            {"id": "SEC-DHN-ASN", "name": "Dhanbad → Asansol", "distance_km": 58.0, "status": "MAINTENANCE", "speed_limit": 60, "expected_impact_min": 11.0},
            {"id": "SEC-ASN-DGR", "name": "Asansol → Durgapur", "distance_km": 43.0, "status": "CONGESTED", "speed_limit": 100, "expected_impact_min": 5.0},
            {"id": "SEC-DGR-BWN", "name": "Durgapur → Barddhaman", "distance_km": 64.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0},
            {"id": "SEC-BWN-SDAH", "name": "Barddhaman → Sealdah", "distance_km": 102.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0}
        ],
        "upcoming_stations": [
            {"station_id": "ASN", "station_code": "ASN", "station_name": "Asansol Jn", "scheduled_arrival": "10:45", "predicted_eta": "11:24", "delay_minutes": 39.0, "confidence_percent": 88, "confidence_range": "11:18 – 11:30", "distance_km": 58.0, "has_active_disruption": True},
            {"station_id": "DGR", "station_code": "DGR", "station_name": "Durgapur", "scheduled_arrival": "11:25", "predicted_eta": "12:09", "delay_minutes": 44.0, "confidence_percent": 84, "confidence_range": "12:01 – 12:17", "distance_km": 43.0, "has_active_disruption": True},
            {"station_id": "BWN", "station_code": "BWN", "station_name": "Barddhaman Jn", "scheduled_arrival": "12:20", "predicted_eta": "13:06", "delay_minutes": 46.0, "confidence_percent": 81, "confidence_range": "12:56 – 13:16", "distance_km": 64.0, "has_active_disruption": False},
            {"station_id": "SDAH", "station_code": "SDAH", "station_name": "Sealdah Terminus", "scheduled_arrival": "13:40", "predicted_eta": "14:28", "delay_minutes": 48.0, "confidence_percent": 78, "confidence_range": "14:15 – 14:41", "distance_km": 102.0, "has_active_disruption": False}
        ],
        "why_eta_changed": [
            {"factor": "Current Existing Delay", "category": "BASE_DELAY", "impact_min": 28.0, "description": "Coal belt freight congestion inherited from Mughalsarai"},
            {"factor": "Track Maintenance Block", "category": "MAINTENANCE", "impact_min": 11.0, "description": "Track packing and weld testing between Dhanbad & Asansol"},
            {"factor": "Asansol Suburban Queuing", "category": "CONGESTION", "impact_min": 5.0, "description": "Precedence conflict with peak suburban EMU rakes"},
            {"factor": "Headway Propagation", "category": "HISTORICAL_PATTERN", "impact_min": 4.0, "description": "Downstream cascading loss through Barddhaman junction"}
        ]
    },
    {
        "id": "12414",
        "train_number": "12414",
        "name": "Pooja Superfast Express",
        "origin": "Jammu Tawi (JAT)",
        "destination": "Ajmer Junction (AII)",
        "current_station": "Gurgaon (GGN)",
        "next_station": "Rewari Junction",
        "next_station_code": "RE",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "speed_kmh": 86.0,
        "current_delay_min": 12.0,
        "status": "MODERATE_DELAY",
        "zone": "NR / NWR",
        "type": "SUPERFAST_MAIL",
        "is_simulation_target": False,
        "sections": [
            {"id": "SEC-GGN-RE", "name": "Gurgaon → Rewari Jn", "distance_km": 52.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0},
            {"id": "SEC-RE-AWR", "name": "Rewari Jn → Alwar Jn", "distance_km": 75.0, "status": "SPEED_RESTRICTION", "speed_limit": 45, "expected_impact_min": 7.0},
            {"id": "SEC-AWR-BKI", "name": "Alwar Jn → Bandikui Jn", "distance_km": 60.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0},
            {"id": "SEC-BKI-JP", "name": "Bandikui Jn → Jaipur Jn", "distance_km": 90.0, "status": "CONGESTED", "speed_limit": 100, "expected_impact_min": 6.0},
            {"id": "SEC-JP-AII", "name": "Jaipur Jn → Ajmer Jn", "distance_km": 135.0, "status": "NORMAL", "speed_limit": 110, "expected_impact_min": 0.0}
        ],
        "upcoming_stations": [
            {"station_id": "RE", "station_code": "RE", "station_name": "Rewari Jn", "scheduled_arrival": "05:20", "predicted_eta": "05:32", "delay_minutes": 12.0, "confidence_percent": 94, "confidence_range": "05:29 – 05:35", "distance_km": 52.0, "has_active_disruption": False},
            {"station_id": "AWR", "station_code": "AWR", "station_name": "Alwar Jn", "scheduled_arrival": "06:30", "predicted_eta": "06:49", "delay_minutes": 19.0, "confidence_percent": 90, "confidence_range": "06:43 – 06:55", "distance_km": 75.0, "has_active_disruption": True},
            {"station_id": "BKI", "station_code": "BKI", "station_name": "Bandikui Jn", "scheduled_arrival": "07:45", "predicted_eta": "08:05", "delay_minutes": 20.0, "confidence_percent": 87, "confidence_range": "07:58 – 08:12", "distance_km": 60.0, "has_active_disruption": False},
            {"station_id": "JP", "station_code": "JP", "station_name": "Jaipur Jn", "scheduled_arrival": "09:30", "predicted_eta": "09:56", "delay_minutes": 26.0, "confidence_percent": 83, "confidence_range": "09:47 – 10:05", "distance_km": 90.0, "has_active_disruption": True},
            {"station_id": "AII", "station_code": "AII", "station_name": "Ajmer Jn", "scheduled_arrival": "12:10", "predicted_eta": "12:38", "delay_minutes": 28.0, "confidence_percent": 79, "confidence_range": "12:26 – 12:50", "distance_km": 135.0, "has_active_disruption": False}
        ],
        "why_eta_changed": [
            {"factor": "Current Existing Delay", "category": "BASE_DELAY", "impact_min": 12.0, "description": "Delhi Cantt yard crossing hold"},
            {"factor": "TSR 45 km/h on Rewari Curve", "category": "TSR", "impact_min": 7.0, "description": "Track renewal caution order on NWR section"},
            {"factor": "Jaipur Interlocking Congestion", "category": "CONGESTION", "impact_min": 6.0, "description": "Platform occupancy conflict at Jaipur Junction"},
            {"factor": "Slack Buffer Credit", "category": "HISTORICAL_PATTERN", "impact_min": 3.0, "description": "Phulera-Ajmer double line speed profile"}
        ]
    },
    {
        "id": "12953",
        "train_number": "12953",
        "name": "August Kranti Tejas Rajdhani",
        "origin": "Hazrat Nizamuddin (NZM)",
        "destination": "Mumbai Central (MMCT)",
        "current_station": "Hazrat Nizamuddin",
        "next_station": "Mathura Junction",
        "next_station_code": "MTJ",
        "latitude": 28.5889,
        "longitude": 77.2534,
        "speed_kmh": 118.0,
        "current_delay_min": 2.0,
        "status": "ON_TIME",
        "zone": "NR / WCR",
        "type": "PREMIER_SUPERFAST",
        "is_simulation_target": False,
        "sections": [
            {"id": "SEC-NZM-MTJ", "name": "Hazrat Nizamuddin → Mathura", "distance_km": 134.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-MTJ-SWM", "name": "Mathura → Sawai Madhopur", "distance_km": 216.0, "status": "CONGESTED", "speed_limit": 130, "expected_impact_min": 5.0},
            {"id": "SEC-SWM-KOTA", "name": "Sawai Madhopur → Kota Jn", "distance_km": 108.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-KOTA-RTM", "name": "Kota Jn → Ratlam Jn", "distance_km": 266.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0},
            {"id": "SEC-RTM-BRC", "name": "Ratlam Jn → Vadodara Jn", "distance_km": 261.0, "status": "NORMAL", "speed_limit": 120, "expected_impact_min": 0.0},
            {"id": "SEC-BRC-MMCT", "name": "Vadodara → Mumbai Central", "distance_km": 392.0, "status": "NORMAL", "speed_limit": 130, "expected_impact_min": 0.0}
        ],
        "upcoming_stations": [
            {"station_id": "MTJ", "station_code": "MTJ", "station_name": "Mathura Jn", "scheduled_arrival": "18:53", "predicted_eta": "18:55", "delay_minutes": 2.0, "confidence_percent": 97, "confidence_range": "18:53 – 18:57", "distance_km": 134.0, "has_active_disruption": False},
            {"station_id": "SWM", "station_code": "SWM", "station_name": "Sawai Madhopur", "scheduled_arrival": "21:13", "predicted_eta": "21:20", "delay_minutes": 7.0, "confidence_percent": 92, "confidence_range": "21:15 – 21:25", "distance_km": 216.0, "has_active_disruption": True},
            {"station_id": "KOTA", "station_code": "KOTA", "station_name": "Kota Junction", "scheduled_arrival": "22:30", "predicted_eta": "22:38", "delay_minutes": 8.0, "confidence_percent": 89, "confidence_range": "22:32 – 22:44", "distance_km": 108.0, "has_active_disruption": False},
            {"station_id": "RTM", "station_code": "RTM", "station_name": "Ratlam Junction", "scheduled_arrival": "01:53", "predicted_eta": "02:04", "delay_minutes": 11.0, "confidence_percent": 84, "confidence_range": "01:55 – 02:13", "distance_km": 266.0, "has_active_disruption": False},
            {"station_id": "MMCT", "station_code": "MMCT", "station_name": "Mumbai Central", "scheduled_arrival": "10:05", "predicted_eta": "10:19", "delay_minutes": 14.0, "confidence_percent": 79, "confidence_range": "10:05 – 10:33", "distance_km": 653.0, "has_active_disruption": False}
        ],
        "why_eta_changed": [
            {"factor": "Nominal Headway Departure", "category": "BASE_DELAY", "impact_min": 2.0, "description": "On-time departure from Hazrat Nizamuddin"},
            {"factor": "Gangapur City Freight Queue", "category": "CONGESTION", "impact_min": 5.0, "description": "High freight headway ahead in Western Railway block"},
            {"factor": "High Speed Traversal Buffer", "category": "HISTORICAL_PATTERN", "impact_min": 7.0, "description": "130 km/h WAP-7 speed regulation with automatic signals"}
        ]
    }
]
