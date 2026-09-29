import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState } from '../types/types';
import { api } from '../services/api';

export function useSimulationWebSocket() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const fetchFallbackState = useCallback(async () => {
    try {
      const data = await api.getSimulationState();
      setState(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Error fetching telemetry');
    }
  }, []);

  const connect = useCallback(() => {
    try {
      // Determine WS URL
      const isSecure = window.location.protocol === 'https:';
      const protocol = isSecure ? 'wss:' : 'ws:';
      const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws/simulation`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.train) {
            setState(payload);
          }
        } catch (e) {
          // ignore ping/pong or non-json text
        }
      };

      ws.onerror = (err) => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 2 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 2000);
        }

        // Start fallback polling if not already started
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = window.setInterval(fetchFallbackState, 1500);
        }
      };
    } catch (e: any) {
      setIsConnected(false);
      setError('WebSocket connection error, using REST fallback');
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = window.setInterval(fetchFallbackState, 1500);
      }
    }
  }, [fetchFallbackState]);

  useEffect(() => {
    // Initial fetch for instant display
    fetchFallbackState();
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [connect, fetchFallbackState]);

  return {
    state,
    isConnected,
    error,
    refresh: fetchFallbackState
  };
}
