import React, { useState, useEffect } from 'react';
import { useSimulationWebSocket } from './hooks/useSimulationWebSocket';
import { api } from './services/api';
import { RouteData } from './types/types';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LiveSimulationPage } from './pages/LiveSimulationPage';
import { DashboardPage } from './pages/DashboardPage';
import { NetworkConditionsPage } from './pages/NetworkConditionsPage';
import { ModelAnalyticsPage } from './pages/ModelAnalyticsPage';
import { DataFeedsPage } from './pages/DataFeedsPage';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTrainId, setSelectedTrainId] = useState<string>('12951');
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const { state, isConnected, error, refresh } = useSimulationWebSocket();

  // Load static route polyline & stations once
  useEffect(() => {
    async function loadRoute() {
      try {
        const data = await api.getTrainRoute('12951');
        setRouteData(data);
      } catch (e) {
        console.error('Failed to load corridor route:', e);
      }
    }
    loadRoute();
  }, []);

  // Handlers for simulation control
  const handleStart = async () => {
    try {
      await api.startSimulation();
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async () => {
    try {
      await api.pauseSimulation();
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResume = async () => {
    try {
      await api.resumeSimulation();
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation();
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetSpeed = async (multiplier: number) => {
    try {
      await api.setSpeed(multiplier);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for operational events
  const handleTriggerEvent = async (type: string, title?: string, impact?: number) => {
    try {
      await api.triggerEvent(type, 'SEC-KOTA-SWM', title, 'HIGH', impact);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.deleteEvent(id);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearEvents();
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWsConnected={isConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - displayed only in simulation tab */}
        {activeTab === 'simulation' && (
          <Header
            state={state}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
            onSetSpeed={handleSetSpeed}
          />
        )}

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'simulation' && (
            <LiveSimulationPage
              state={state}
              routeData={routeData}
              onTriggerEvent={handleTriggerEvent}
              onDeleteEvent={handleDeleteEvent}
              onClearAll={handleClearAll}
              onStartSimulation={handleStart}
              onResetSimulation={handleReset}
              initialTrainId={selectedTrainId}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              onSelectTrain={(id) => {
                setSelectedTrainId(id);
                setActiveTab('simulation');
              }}
            />
          )}

          {activeTab === 'network' && (
            <NetworkConditionsPage />
          )}

          {activeTab === 'analytics' && (
            <ModelAnalyticsPage />
          )}

          {activeTab === 'data-feeds' && (
            <DataFeedsPage />
          )}
        </main>
      </div>
    </div>
  );
}
