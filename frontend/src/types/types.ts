export interface Train {
  id: string;
  train_number: string;
  name: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  current_delay_min: number;
  status: string;
  current_station: string;
  next_station: string;
  next_station_code: string;
  distance_to_next_km: number;
  progress_percent: number;
  current_section_id: string;
  current_section_name: string;
  zone?: string;
  type?: string;
}

export interface UpcomingStation {
  station_id: string;
  station_code: string;
  station_name: string;
  scheduled_arrival: string;
  predicted_eta: string;
  predicted_eta_full: string;
  delay_minutes: number;
  confidence_percent: number;
  confidence_range: string;
  distance_km: number;
  has_active_disruption: boolean;
}

export interface WhyEtaChangedItem {
  factor: string;
  category: string;
  impact_min: number;
  description: string;
}

export interface OperationalEvent {
  id: string;
  type: string; // congestion, speed_restriction, maintenance_block, unscheduled_halt, heavy_rain
  section_id: string;
  title: string;
  severity: string;
  impact_minutes: number;
  weather_factor: number;
  description: string;
  active: boolean;
}

export interface SimulationState {
  train: Train;
  simulation: {
    sim_time: string;
    speed_multiplier: number;
    is_running: boolean;
    is_paused: boolean;
  };
  upcoming_stations: UpcomingStation[];
  why_eta_changed: WhyEtaChangedItem[];
  active_events: OperationalEvent[];
  timestamp: string;
}

export interface NetworkSection {
  section_id: string;
  section_name: string;
  from_station: string;
  to_station: string;
  distance_km: number;
  max_permissible_speed_kmh: number;
  historical_avg_time_min: number;
  track_type: string;
  status: string;
  status_color: string;
  has_congestion: boolean;
  has_speed_restriction: boolean;
  has_maintenance: boolean;
  expected_impact_min: number;
  active_events: OperationalEvent[];
}

export interface ModelAnalytics {
  model_summary: {
    model_type: string;
    train_samples: number;
    test_samples: number;
    mae_minutes: number;
    rmse_minutes: number;
    r2_score: number;
    status: string;
    sample_residuals: number[];
  };
  feature_importances: {
    feature: string;
    importance: number;
    percentage: number;
    readable_name: string;
  }[];
  features_used: string[];
  algorithm: string;
  training_data_source: string;
}

export interface StationData {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  distance_from_origin_km: number;
  scheduled_arrival: string;
  scheduled_departure: string;
  platform: number;
  zone: string;
}

export interface RouteData {
  train_id: string;
  corridor_name: string;
  stations: StationData[];
  sections: {
    id: string;
    name: string;
    from_station: string;
    to_station: string;
    distance_km: number;
    polyline: [number, number][];
  }[];
}
