import { 
  SimulationState, 
  RouteData, 
  Train, 
  NetworkSection, 
  ModelAnalytics, 
  OperationalEvent 
} from '../types/types';
import {
  MOCK_TRAINS,
  MOCK_TRAIN_DETAILS,
  MOCK_SIMULATION_STATE,
  MOCK_NETWORK_SECTIONS,
  MOCK_KPIS,
  MOCK_MODEL_ANALYTICS
} from './mockData';

const API_BASE = '/api';

export const api = {
  // Simulation Controls
  async getSimulationState(): Promise<SimulationState> {
    try {
      const res = await fetch(`${API_BASE}/simulation/state`);
      if (!res.ok) throw new Error('Failed to fetch simulation state');
      return await res.json();
    } catch {
      return MOCK_SIMULATION_STATE;
    }
  },

  async startSimulation(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: "Simulation started", state: MOCK_SIMULATION_STATE };
    }
  },

  async pauseSimulation(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: "Simulation paused" };
    }
  },

  async resumeSimulation(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/simulation/resume`, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: "Simulation resumed" };
    }
  },

  async resetSimulation(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: "Simulation reset" };
    }
  },

  async setSpeed(multiplier: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/simulation/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiplier }),
      });
      return await res.json();
    } catch {
      return { message: `Speed set to ${multiplier}x`, speed_multiplier: multiplier };
    }
  },

  // Trains & Routes
  async getTrains(search?: string): Promise<Train[]> {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API_BASE}/trains${q}`);
      if (!res.ok) throw new Error('Failed to fetch trains');
      return await res.json();
    } catch {
      if (search) {
        const s = search.toLowerCase();
        return MOCK_TRAINS.filter(t => t.train_number.includes(s) || t.name.toLowerCase().includes(s));
      }
      return MOCK_TRAINS;
    }
  },

  async getTrainEta(trainId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/trains/${trainId}/eta`);
      if (!res.ok) throw new Error(`Failed to fetch ETA for train ${trainId}`);
      return await res.json();
    } catch {
      return MOCK_TRAIN_DETAILS[trainId] || MOCK_TRAIN_DETAILS['12951'];
    }
  },

  async getTrainRoute(trainId: string = '12951'): Promise<RouteData> {
    try {
      const res = await fetch(`${API_BASE}/trains/${trainId}/route`);
      if (!res.ok) throw new Error('Failed to fetch train route');
      return await res.json();
    } catch {
      return {
        train_id: trainId,
        corridor_name: "Delhi – Kota – Agra Junction Demonstration Corridor",
        stations: [
          { id: "NDLS", code: "NDLS", name: "New Delhi", lat: 28.6431, lon: 77.2197, distance_from_origin_km: 0.0, scheduled_arrival: "16:55", scheduled_departure: "16:55", platform: 1, zone: "NR" },
          { id: "KOTA", code: "KOTA", name: "Kota Junction", lat: 25.2138, lon: 75.8648, distance_from_origin_km: 465.0, scheduled_arrival: "18:30", scheduled_departure: "18:35", platform: 2, zone: "WCR" },
          { id: "SWM", code: "SWM", name: "Sawai Madhopur", lat: 25.9928, lon: 76.3683, distance_from_origin_km: 573.0, scheduled_arrival: "19:30", scheduled_departure: "19:32", platform: 1, zone: "WCR" },
          { id: "GGC", code: "GGC", name: "Gangapur City", lat: 26.4716, lon: 76.7188, distance_from_origin_km: 637.0, scheduled_arrival: "20:20", scheduled_departure: "20:22", platform: 3, zone: "WCR" },
          { id: "BTE", code: "BTE", name: "Bharatpur", lat: 27.2152, lon: 77.4930, distance_from_origin_km: 757.0, scheduled_arrival: "22:00", scheduled_departure: "22:02", platform: 2, zone: "WCR" },
          { id: "MTJ", code: "MTJ", name: "Mathura", lat: 27.4924, lon: 77.6737, distance_from_origin_km: 792.0, scheduled_arrival: "22:50", scheduled_departure: "22:55", platform: 1, zone: "NCR" },
          { id: "AGC", code: "AGC", name: "Agra Cantt", lat: 27.1593, lon: 77.9942, distance_from_origin_km: 846.0, scheduled_arrival: "23:40", scheduled_departure: "23:40", platform: 4, zone: "NCR" }
        ],
        sections: [
          { id: "SEC-KOTA-SWM", name: "Kota → Sawai Madhopur", from_station: "KOTA", to_station: "SWM", distance_km: 108.0, polyline: [[25.2138, 75.8648], [25.9928, 76.3683]] },
          { id: "SEC-SWM-GGC", name: "Sawai Madhopur → Gangapur City", from_station: "SWM", to_station: "GGC", distance_km: 64.0, polyline: [[25.9928, 76.3683], [26.4716, 76.7188]] },
          { id: "SEC-GGC-BTE", name: "Gangapur City → Bharatpur", from_station: "GGC", to_station: "BTE", distance_km: 120.0, polyline: [[26.4716, 76.7188], [27.2152, 77.4930]] },
          { id: "SEC-BTE-MTJ", name: "Bharatpur → Mathura", from_station: "BTE", to_station: "MTJ", distance_km: 35.0, polyline: [[27.2152, 77.4930], [27.4924, 77.6737]] },
          { id: "SEC-MTJ-AGC", name: "Mathura → Agra Cantt", from_station: "MTJ", to_station: "AGC", distance_km: 54.0, polyline: [[27.4924, 77.6737], [27.1593, 77.9942]] }
        ]
      };
    }
  },

  // Operational Events
  async getEvents(): Promise<OperationalEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error('Failed to fetch events');
      return await res.json();
    } catch {
      return MOCK_SIMULATION_STATE.active_events;
    }
  },

  async triggerEvent(
    type: string, 
    sectionId: string = 'SEC-KOTA-SWM',
    title?: string,
    severity: string = 'HIGH',
    impactMinutes?: number,
    description?: string
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          section_id: sectionId,
          title,
          severity,
          impact_minutes: impactMinutes,
          description
        }),
      });
      return await res.json();
    } catch {
      return { message: "Event triggered (offline mode)" };
    }
  },

  async deleteEvent(eventId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return { message: "Event removed" };
    }
  },

  async toggleEvent(eventId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/events/toggle/${eventId}`, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: "Event toggled" };
    }
  },

  async clearEvents(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/events/clear`, { method: 'POST' });
      return await res.json();
    } catch {
      return { message: "Events cleared" };
    }
  },

  // Network & Analytics
  async getNetworkConditions(trainId?: string): Promise<NetworkSection[]> {
    try {
      const q = trainId ? `?train_id=${encodeURIComponent(trainId)}` : '';
      const res = await fetch(`${API_BASE}/network/conditions${q}`);
      if (!res.ok) throw new Error('Failed to fetch network conditions');
      return await res.json();
    } catch {
      return MOCK_NETWORK_SECTIONS;
    }
  },

  async getModelAnalytics(): Promise<ModelAnalytics> {
    try {
      const res = await fetch(`${API_BASE}/analytics/model`);
      if (!res.ok) throw new Error('Failed to fetch model analytics');
      return await res.json();
    } catch {
      return MOCK_MODEL_ANALYTICS;
    }
  },

  async getKPIs(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/kpis`);
      if (!res.ok) throw new Error('Failed to fetch KPIs');
      return await res.json();
    } catch {
      return MOCK_KPIS;
    }
  },

  async getDataSources(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/data-sources`);
      if (!res.ok) throw new Error('Failed to fetch data sources');
      return await res.json();
    } catch {
      return [
        { name: "RTIS ISRO NavIC", status: "ONLINE", rate: "Every 1s", latency: "14ms", reliability: "99.9%" },
        { name: "FOIS Track Occupancy", status: "ONLINE", rate: "Continuous", latency: "28ms", reliability: "99.8%" },
        { name: "NTES Central Feed", status: "ONLINE", rate: "Real-time", latency: "42ms", reliability: "99.5%" },
        { name: "COA Dispatch Interlock", status: "ONLINE", rate: "Signal Event", latency: "18ms", reliability: "99.9%" },
        { name: "AWS Weather Sensor Mesh", status: "ONLINE", rate: "Every 60s", latency: "85ms", reliability: "99.2%" },
        { name: "IoT Axle Counters", status: "ONLINE", rate: "Immediate", latency: "8ms", reliability: "100%" }
      ];
    }
  }
};
