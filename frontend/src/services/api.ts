import { 
  SimulationState, 
  RouteData, 
  Train, 
  NetworkSection, 
  ModelAnalytics, 
  OperationalEvent 
} from '../types/types';

const API_BASE = '/api';

export const api = {
  // Simulation Controls
  async getSimulationState(): Promise<SimulationState> {
    const res = await fetch(`${API_BASE}/simulation/state`);
    if (!res.ok) throw new Error('Failed to fetch simulation state');
    return res.json();
  },

  async startSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    return res.json();
  },

  async pauseSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
    return res.json();
  },

  async resumeSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/resume`, { method: 'POST' });
    return res.json();
  },

  async resetSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    return res.json();
  },

  async setSpeed(multiplier: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier }),
    });
    return res.json();
  },

  // Trains & Routes
  async getTrains(search?: string): Promise<Train[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/trains${q}`);
    if (!res.ok) throw new Error('Failed to fetch trains');
    return res.json();
  },

  async getTrainEta(trainId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/trains/${trainId}/eta`);
    if (!res.ok) throw new Error(`Failed to fetch ETA for train ${trainId}`);
    return res.json();
  },

  async getTrainRoute(trainId: string = '12951'): Promise<RouteData> {
    const res = await fetch(`${API_BASE}/trains/${trainId}/route`);
    if (!res.ok) throw new Error('Failed to fetch train route');
    return res.json();
  },

  // Operational Events
  async getEvents(): Promise<OperationalEvent[]> {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async triggerEvent(
    type: string, 
    sectionId: string = 'SEC-KOTA-SWM',
    title?: string,
    severity: string = 'HIGH',
    impactMinutes?: number,
    description?: string
  ): Promise<any> {
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
    return res.json();
  },

  async deleteEvent(eventId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
    return res.json();
  },

  async toggleEvent(eventId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/events/toggle/${eventId}`, { method: 'POST' });
    return res.json();
  },

  async clearEvents(): Promise<any> {
    const res = await fetch(`${API_BASE}/events/clear`, { method: 'POST' });
    return res.json();
  },

  // Network & Analytics
  async getNetworkConditions(trainId?: string): Promise<NetworkSection[]> {
    const q = trainId ? `?train_id=${encodeURIComponent(trainId)}` : '';
    const res = await fetch(`${API_BASE}/network/conditions${q}`);
    if (!res.ok) throw new Error('Failed to fetch network conditions');
    return res.json();
  },

  async getModelAnalytics(): Promise<ModelAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/model`);
    if (!res.ok) throw new Error('Failed to fetch model analytics');
    return res.json();
  },

  async getKPIs(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/kpis`);
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  },

  async getDataSources(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/data-sources`);
    if (!res.ok) throw new Error('Failed to fetch data sources');
    return res.json();
  }
};
