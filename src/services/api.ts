// Deployment-safe: Make API URL optional - app works with or without backend
// Vercel build: Will use default if VITE_API_URL is not set
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:3001/api';

// Deployment-safe: Import types from types.ts to ensure single source of truth
// Removed duplicate WardData definition to prevent type conflicts
import type { WardData, TimeSeriesData, WeatherData } from '../types';

// Re-export types for convenience (allows existing imports to work)
export type { WardData, TimeSeriesData, WeatherData };

// Fetch with timeout and better error handling
async function fetchAPI<T>(endpoint: string, timeout: number = 8000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export const api = {
  // Get all wards
  getWards: async (): Promise<WardData[]> => {
    return fetchAPI<WardData[]>('/wards');
  },

  // Get single ward
  getWard: async (id: string): Promise<WardData> => {
    return fetchAPI<WardData>(`/wards/${id}`);
  },

  // Get time series data
  getTimeSeries: async (wardId?: string, days: number = 7): Promise<TimeSeriesData[]> => {
    const params = new URLSearchParams();
    if (wardId) params.append('wardId', wardId);
    params.append('days', days.toString());
    return fetchAPI<TimeSeriesData[]>(`/analytics/timeseries?${params.toString()}`);
  },

  // Get weather data
  getWeather: async (wardId?: string): Promise<WeatherData> => {
    const params = new URLSearchParams();
    if (wardId) params.append('wardId', wardId);
    return fetchAPI<WeatherData>(`/weather?${params.toString()}`);
  },

  // Get alerts
  getAlerts: async (wardId?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (wardId) params.append('wardId', wardId);
    return fetchAPI<any[]>(`/alerts?${params.toString()}`);
  },
};


