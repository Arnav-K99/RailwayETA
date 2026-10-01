import { Train, RouteData, NetworkSection, ModelAnalytics, SimulationState } from '../types/types';

export const MOCK_TRAINS: Train[] = [
  {
    id: "12951",
    train_number: "12951",
    name: "Mumbai Tejas Rajdhani Express",
    origin: "New Delhi (NDLS)",
    destination: "Mumbai Central (MMCT)",
    current_station: "Kota Junction",
    next_station: "Sawai Madhopur",
    next_station_code: "SWM",
    latitude: 25.2138,
    longitude: 75.8648,
    speed_kmh: 78.0,
    current_delay_min: 15.0,
    status: "RUNNING",
    current_section_id: "SEC-KOTA-SWM",
    current_section_name: "Kota → Sawai Madhopur",
    distance_to_next_km: 108.0,
    progress_percent: 35.0,
    zone: "WCR / NCR",
    type: "PREMIER_SUPERFAST"
  },
  {
    id: "12002",
    train_number: "12002",
    name: "Bhopal Shatabdi Express",
    origin: "New Delhi (NDLS)",
    destination: "Rani Kamlapati (RKMP)",
    current_station: "Mathura Junction",
    next_station: "Agra Cantt",
    next_station_code: "AGC",
    latitude: 27.4924,
    longitude: 77.6737,
    speed_kmh: 128.0,
    current_delay_min: 3.0,
    status: "ON_TIME",
    current_section_id: "SEC-MTJ-AGC",
    current_section_name: "Mathura → Agra Cantt",
    distance_to_next_km: 54.0,
    progress_percent: 20.0,
    zone: "NCR",
    type: "SHATABDI_EXPRESS"
  },
  {
    id: "22436",
    train_number: "22436",
    name: "Vande Bharat Express",
    origin: "New Delhi (NDLS)",
    destination: "Varanasi Jn (BSB)",
    current_station: "Kanpur Central",
    next_station: "Prayagraj Jn",
    next_station_code: "PRYJ",
    latitude: 26.4537,
    longitude: 80.3507,
    speed_kmh: 130.0,
    current_delay_min: 0.0,
    status: "ON_TIME",
    current_section_id: "SEC-CNB-PRYJ",
    current_section_name: "Kanpur Central → Prayagraj Jn",
    distance_to_next_km: 194.0,
    progress_percent: 15.0,
    zone: "NCR",
    type: "VANDE_BHARAT"
  },
  {
    id: "12260",
    train_number: "12260",
    name: "Sealdah Duronto Express",
    origin: "Bikaner (BKN)",
    destination: "Sealdah (SDAH)",
    current_station: "Dhanbad Junction",
    next_station: "Asansol Junction",
    next_station_code: "ASN",
    latitude: 23.7957,
    longitude: 86.4304,
    speed_kmh: 88.0,
    current_delay_min: 28.0,
    status: "DELAYED",
    current_section_id: "SEC-DHN-ASN",
    current_section_name: "Dhanbad → Asansol",
    distance_to_next_km: 58.0,
    progress_percent: 42.0,
    zone: "ER",
    type: "DURONTO_EXPRESS"
  },
  {
    id: "12414",
    train_number: "12414",
    name: "Pooja Superfast Express",
    origin: "Jammu Tawi (JAT)",
    destination: "Ajmer Junction (AII)",
    current_station: "Gurgaon (GGN)",
    next_station: "Rewari Junction",
    next_station_code: "RE",
    latitude: 28.4595,
    longitude: 77.0266,
    speed_kmh: 86.0,
    current_delay_min: 12.0,
    status: "MODERATE_DELAY",
    current_section_id: "SEC-GGN-RE",
    current_section_name: "Gurgaon → Rewari Jn",
    distance_to_next_km: 52.0,
    progress_percent: 28.0,
    zone: "NR / NWR",
    type: "SUPERFAST_MAIL"
  },
  {
    id: "12953",
    train_number: "12953",
    name: "August Kranti Tejas Rajdhani",
    origin: "Hazrat Nizamuddin (NZM)",
    destination: "Mumbai Central (MMCT)",
    current_station: "Hazrat Nizamuddin",
    next_station: "Mathura Junction",
    next_station_code: "MTJ",
    latitude: 28.5889,
    longitude: 77.2534,
    speed_kmh: 118.0,
    current_delay_min: 2.0,
    status: "ON_TIME",
    current_section_id: "SEC-NZM-MTJ",
    current_section_name: "Hazrat Nizamuddin → Mathura",
    distance_to_next_km: 134.0,
    progress_percent: 18.0,
    zone: "NR / WCR",
    type: "PREMIER_SUPERFAST"
  }
];

export const MOCK_TRAIN_DETAILS: Record<string, any> = {
  "12951": {
    ...MOCK_TRAINS[0],
    upcoming_stations: [
      { station_id: "SWM", station_code: "SWM", station_name: "Sawai Madhopur", scheduled_arrival: "19:30", predicted_eta: "19:48", delay_minutes: 18.0, confidence_percent: 91, confidence_range: "19:44 – 19:53", distance_km: 108.0, has_active_disruption: true },
      { station_id: "GGC", station_code: "GGC", station_name: "Gangapur City", scheduled_arrival: "20:20", predicted_eta: "20:42", delay_minutes: 22.0, confidence_percent: 88, confidence_range: "20:36 – 20:48", distance_km: 64.0, has_active_disruption: false },
      { station_id: "BTE", station_code: "BTE", station_name: "Bharatpur", scheduled_arrival: "22:00", predicted_eta: "22:28", delay_minutes: 28.0, confidence_percent: 85, confidence_range: "22:20 – 22:36", distance_km: 120.0, has_active_disruption: false },
      { station_id: "MTJ", station_code: "MTJ", station_name: "Mathura", scheduled_arrival: "22:50", predicted_eta: "23:21", delay_minutes: 31.0, confidence_percent: 82, confidence_range: "23:12 – 23:30", distance_km: 35.0, has_active_disruption: false },
      { station_id: "AGC", station_code: "AGC", station_name: "Agra Cantt", scheduled_arrival: "23:40", predicted_eta: "00:12", delay_minutes: 32.0, confidence_percent: 79, confidence_range: "00:02 – 00:22", distance_km: 54.0, has_active_disruption: false }
    ],
    why_eta_changed: [
      { factor: "Current Existing Delay", category: "BASE_DELAY", impact_min: 15.0, description: "Inherited delay from previous section running" },
      { factor: "Traffic Congestion", category: "CONGESTION", impact_min: 8.0, description: "Heavy sectional freight queuing near Kota yard" },
      { factor: "Sectional Headway Variance", category: "HISTORICAL_PATTERN", impact_min: 9.0, description: "Historical evening peak slack absorption" }
    ]
  },
  "12002": {
    ...MOCK_TRAINS[1],
    upcoming_stations: [
      { station_id: "AGC", station_code: "AGC", station_name: "Agra Cantt", scheduled_arrival: "07:50", predicted_eta: "07:53", delay_minutes: 3.0, confidence_percent: 96, confidence_range: "07:51 – 07:55", distance_km: 54.0, has_active_disruption: false },
      { station_id: "DHO", station_code: "DHO", station_name: "Dholpur Jn", scheduled_arrival: "08:35", predicted_eta: "08:39", delay_minutes: 4.0, confidence_percent: 93, confidence_range: "08:36 – 08:42", distance_km: 55.0, has_active_disruption: false },
      { station_id: "GWL", station_code: "GWL", station_name: "Gwalior Jn", scheduled_arrival: "09:23", predicted_eta: "09:33", delay_minutes: 10.0, confidence_percent: 90, confidence_range: "09:29 – 09:37", distance_km: 66.0, has_active_disruption: true },
      { station_id: "VGLJ", station_code: "VGLJ", station_name: "Jhansi Jn", scheduled_arrival: "10:45", predicted_eta: "10:56", delay_minutes: 11.0, confidence_percent: 86, confidence_range: "10:50 – 11:02", distance_km: 98.0, has_active_disruption: false },
      { station_id: "BPL", station_code: "BPL", station_name: "Bhopal Jn", scheduled_arrival: "14:05", predicted_eta: "14:18", delay_minutes: 13.0, confidence_percent: 81, confidence_range: "14:08 – 14:28", distance_km: 292.0, has_active_disruption: false }
    ],
    why_eta_changed: [
      { factor: "Current Delay", category: "BASE_DELAY", impact_min: 3.0, description: "Minor signal headway at Mathura yard exit" },
      { factor: "Chambal Bridge TSR 45 km/h", category: "TSR", impact_min: 6.0, description: "Bridge girder inspection Caution Order on Dholpur–Gwalior section" },
      { factor: "Sectional Recovery Margin", category: "HISTORICAL_PATTERN", impact_min: 2.0, description: "High horsepower WAP-7 capability absorbs partial loss" }
    ]
  },
  "22436": {
    ...MOCK_TRAINS[2],
    upcoming_stations: [
      { station_id: "PRYJ", station_code: "PRYJ", station_name: "Prayagraj Jn", scheduled_arrival: "12:08", predicted_eta: "12:08", delay_minutes: 0.0, confidence_percent: 97, confidence_range: "12:06 – 12:10", distance_km: 194.0, has_active_disruption: false },
      { station_id: "BSB", station_code: "BSB", station_name: "Varanasi Jn", scheduled_arrival: "14:00", predicted_eta: "14:02", delay_minutes: 2.0, confidence_percent: 94, confidence_range: "13:58 – 14:06", distance_km: 125.0, has_active_disruption: false }
    ],
    why_eta_changed: [
      { factor: "Optimal Track Headway", category: "NOMINAL", impact_min: 0.0, description: "Automatic 4-aspect signaling clear block running on high speed corridor" },
      { factor: "Approach Dwell Buffer", category: "HISTORICAL_PATTERN", impact_min: 2.0, description: "Mandatory platform deceleration clearance into Varanasi" }
    ]
  },
  "12260": {
    ...MOCK_TRAINS[3],
    upcoming_stations: [
      { station_id: "ASN", station_code: "ASN", station_name: "Asansol Jn", scheduled_arrival: "10:45", predicted_eta: "11:24", delay_minutes: 39.0, confidence_percent: 88, confidence_range: "11:18 – 11:30", distance_km: 58.0, has_active_disruption: true },
      { station_id: "DGR", station_code: "DGR", station_name: "Durgapur", scheduled_arrival: "11:25", predicted_eta: "12:09", delay_minutes: 44.0, confidence_percent: 84, confidence_range: "12:01 – 12:17", distance_km: 43.0, has_active_disruption: true },
      { station_id: "BWN", station_code: "BWN", station_name: "Barddhaman Jn", scheduled_arrival: "12:20", predicted_eta: "13:06", delay_minutes: 46.0, confidence_percent: 81, confidence_range: "12:56 – 13:16", distance_km: 64.0, has_active_disruption: false },
      { station_id: "SDAH", station_code: "SDAH", station_name: "Sealdah Terminus", scheduled_arrival: "13:40", predicted_eta: "14:28", delay_minutes: 48.0, confidence_percent: 78, confidence_range: "14:15 – 14:41", distance_km: 102.0, has_active_disruption: false }
    ],
    why_eta_changed: [
      { factor: "Current Existing Delay", category: "BASE_DELAY", impact_min: 28.0, description: "Coal belt freight congestion inherited from Mughalsarai" },
      { factor: "Track Maintenance Block", category: "MAINTENANCE", impact_min: 11.0, description: "Track packing and weld testing between Dhanbad & Asansol" },
      { factor: "Asansol Suburban Queuing", category: "CONGESTION", impact_min: 5.0, description: "Precedence conflict with peak suburban EMU rakes" }
    ]
  },
  "12414": {
    ...MOCK_TRAINS[4],
    upcoming_stations: [
      { station_id: "RE", station_code: "RE", station_name: "Rewari Jn", scheduled_arrival: "05:20", predicted_eta: "05:32", delay_minutes: 12.0, confidence_percent: 94, confidence_range: "05:29 – 05:35", distance_km: 52.0, has_active_disruption: false },
      { station_id: "AWR", station_code: "AWR", station_name: "Alwar Jn", scheduled_arrival: "06:30", predicted_eta: "06:49", delay_minutes: 19.0, confidence_percent: 90, confidence_range: "06:43 – 06:55", distance_km: 75.0, has_active_disruption: true },
      { station_id: "BKI", station_code: "BKI", station_name: "Bandikui Jn", scheduled_arrival: "07:45", predicted_eta: "08:05", delay_minutes: 20.0, confidence_percent: 87, confidence_range: "07:58 – 08:12", distance_km: 60.0, has_active_disruption: false },
      { station_id: "JP", station_code: "JP", station_name: "Jaipur Jn", scheduled_arrival: "09:30", predicted_eta: "09:56", delay_minutes: 26.0, confidence_percent: 83, confidence_range: "09:47 – 10:05", distance_km: 90.0, has_active_disruption: true },
      { station_id: "AII", station_code: "AII", station_name: "Ajmer Jn", scheduled_arrival: "12:10", predicted_eta: "12:38", delay_minutes: 28.0, confidence_percent: 79, confidence_range: "12:26 – 12:50", distance_km: 135.0, has_active_disruption: false }
    ],
    why_eta_changed: [
      { factor: "Current Existing Delay", category: "BASE_DELAY", impact_min: 12.0, description: "Delhi Cantt yard crossing hold" },
      { factor: "TSR 45 km/h on Rewari Curve", category: "TSR", impact_min: 7.0, description: "Track renewal caution order on NWR section" },
      { factor: "Jaipur Interlocking Congestion", category: "CONGESTION", impact_min: 6.0, description: "Platform occupancy conflict at Jaipur Junction" }
    ]
  },
  "12953": {
    ...MOCK_TRAINS[5],
    upcoming_stations: [
      { station_id: "MTJ", station_code: "MTJ", station_name: "Mathura Jn", scheduled_arrival: "18:53", predicted_eta: "18:55", delay_minutes: 2.0, confidence_percent: 97, confidence_range: "18:53 – 18:57", distance_km: 134.0, has_active_disruption: false },
      { station_id: "SWM", station_code: "SWM", station_name: "Sawai Madhopur", scheduled_arrival: "21:13", predicted_eta: "21:20", delay_minutes: 7.0, confidence_percent: 92, confidence_range: "21:15 – 21:25", distance_km: 216.0, has_active_disruption: true },
      { station_id: "KOTA", station_code: "KOTA", station_name: "Kota Junction", scheduled_arrival: "22:30", predicted_eta: "22:38", delay_minutes: 8.0, confidence_percent: 89, confidence_range: "22:32 – 22:44", distance_km: 108.0, has_active_disruption: false },
      { station_id: "RTM", station_code: "RTM", station_name: "Ratlam Junction", scheduled_arrival: "01:53", predicted_eta: "02:04", delay_minutes: 11.0, confidence_percent: 84, confidence_range: "01:55 – 02:13", distance_km: 266.0, has_active_disruption: false },
      { station_id: "MMCT", station_code: "MMCT", station_name: "Mumbai Central", scheduled_arrival: "10:05", predicted_eta: "10:19", delay_minutes: 14.0, confidence_percent: 79, confidence_range: "10:05 – 10:33", distance_km: 653.0, has_active_disruption: false }
    ],
    why_eta_changed: [
      { factor: "Nominal Headway Departure", category: "BASE_DELAY", impact_min: 2.0, description: "On-time departure from Hazrat Nizamuddin" },
      { factor: "Gangapur City Freight Queue", category: "CONGESTION", impact_min: 5.0, description: "High freight headway ahead in Western Railway block" }
    ]
  }
};

export const MOCK_SIMULATION_STATE: SimulationState = {
  train: MOCK_TRAINS[0],
  simulation: {
    sim_time: "18:45:00",
    speed_multiplier: 10,
    is_running: true,
    is_paused: false,
  },
  upcoming_stations: MOCK_TRAIN_DETAILS["12951"].upcoming_stations,
  why_eta_changed: MOCK_TRAIN_DETAILS["12951"].why_eta_changed,
  active_events: [
    {
      id: "EVT-1",
      type: "congestion",
      section_id: "SEC-KOTA-SWM",
      title: "Freight Queue Congestion",
      severity: "HIGH",
      impact_minutes: 8,
      weather_factor: 1.0,
      description: "Heavy freight train queue near Kota outer signal",
      active: true,
    }
  ],
  timestamp: new Date().toISOString(),
};

export const MOCK_NETWORK_SECTIONS: NetworkSection[] = [
  {
    section_id: "SEC-KOTA-SWM",
    section_name: "Kota → Sawai Madhopur",
    from_station: "Kota Jn (KOTA)",
    to_station: "Sawai Madhopur (SWM)",
    distance_km: 108.0,
    max_permissible_speed_kmh: 130,
    historical_avg_time_min: 58.0,
    track_type: "Double Electrified (Automatic Block)",
    status: "CONGESTED",
    status_color: "amber",
    has_congestion: true,
    has_speed_restriction: false,
    has_maintenance: false,
    expected_impact_min: 8.0,
    active_events: [],
    train_state: "CURRENT",
    progress_percent: 35.0,
    live_speed_kmh: 78.0,
  },
  {
    section_id: "SEC-SWM-GGC",
    section_name: "Sawai Madhopur → Gangapur City",
    from_station: "Sawai Madhopur (SWM)",
    to_station: "Gangapur City (GGC)",
    distance_km: 64.0,
    max_permissible_speed_kmh: 120,
    historical_avg_time_min: 48.0,
    track_type: "Double Electrified",
    status: "NORMAL",
    status_color: "emerald",
    has_congestion: false,
    has_speed_restriction: false,
    has_maintenance: false,
    expected_impact_min: 0.0,
    active_events: [],
    train_state: "AHEAD",
    progress_percent: 0,
    live_speed_kmh: 0,
  },
  {
    section_id: "SEC-GGC-BTE",
    section_name: "Gangapur City → Bharatpur",
    from_station: "Gangapur City (GGC)",
    to_station: "Bharatpur (BTE)",
    distance_km: 120.0,
    max_permissible_speed_kmh: 110,
    historical_avg_time_min: 98.0,
    track_type: "Double Electrified",
    status: "NORMAL",
    status_color: "emerald",
    has_congestion: false,
    has_speed_restriction: false,
    has_maintenance: false,
    expected_impact_min: 0.0,
    active_events: [],
    train_state: "AHEAD",
    progress_percent: 0,
    live_speed_kmh: 0,
  },
  {
    section_id: "SEC-BTE-MTJ",
    section_name: "Bharatpur → Mathura",
    from_station: "Bharatpur (BTE)",
    to_station: "Mathura Jn (MTJ)",
    distance_km: 35.0,
    max_permissible_speed_kmh: 100,
    historical_avg_time_min: 48.0,
    track_type: "Triple Electrified Junction Approach",
    status: "NORMAL",
    status_color: "emerald",
    has_congestion: false,
    has_speed_restriction: false,
    has_maintenance: false,
    expected_impact_min: 0.0,
    active_events: [],
    train_state: "AHEAD",
    progress_percent: 0,
    live_speed_kmh: 0,
  },
  {
    section_id: "SEC-MTJ-AGC",
    section_name: "Mathura → Agra Cantt",
    from_station: "Mathura Jn (MTJ)",
    to_station: "Agra Cantt (AGC)",
    distance_km: 54.0,
    max_permissible_speed_kmh: 120,
    historical_avg_time_min: 45.0,
    track_type: "Double Electrified",
    status: "NORMAL",
    status_color: "emerald",
    has_congestion: false,
    has_speed_restriction: false,
    has_maintenance: false,
    expected_impact_min: 0.0,
    active_events: [],
    train_state: "AHEAD",
    progress_percent: 0,
    live_speed_kmh: 0,
  }
];

export const MOCK_KPIS = {
  active_trains: 24,
  on_time: 14,
  delayed: 10,
  on_time_percentage: 58.3,
  average_delay_minutes: 14.8,
  severe_delays: 3,
  monitored_sections: 18,
  active_restrictions: 2,
};

export const MOCK_MODEL_ANALYTICS: ModelAnalytics = {
  model_summary: {
    model_type: "GradientBoostingRegressor (ML Ensemble)",
    train_samples: 4850,
    test_samples: 1210,
    mae_minutes: 2.34,
    rmse_minutes: 3.12,
    r2_score: 0.891,
    status: "ACTIVE_PRODUCTION",
    sample_residuals: [-0.2, -0.5, 0.4, -0.8, 0.9, -0.9, 0.3, -0.4],
  },
  feature_importances: [
    { feature: "Current Baseline Delay", importance: 0.38, percentage: 38, readable_name: "Current Baseline Delay" },
    { feature: "Section Congestion Level", importance: 0.22, percentage: 22, readable_name: "Section Congestion Level" },
    { feature: "Temporary Speed Restriction", importance: 0.16, percentage: 16, readable_name: "Speed Restriction (TSR)" },
    { feature: "Historical Section Time Variance", importance: 0.11, percentage: 11, readable_name: "Historical Variance" },
    { feature: "Gradient & Headway Density", importance: 0.08, percentage: 8, readable_name: "Gradient & Headway" },
    { feature: "Precipitation & Weather Factor", importance: 0.05, percentage: 5, readable_name: "Weather Factor" },
  ],
  features_used: [
    "current_delay_min",
    "distance_km",
    "speed_limit_kmh",
    "congestion_factor",
    "gradient_factor",
    "weather_factor"
  ],
  algorithm: "Supervised Sectional Traversal Regressor (Gradient Boosted Trees)",
  training_data_source: "12,000 synthetic historical run observations calibrated to IR WCR/NCR corridors"
};
