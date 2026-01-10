const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface WardData {
  id: string;
  name: string;
  aqi: number;
  category: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
  };
  sources: {
    vehicular: number;
    construction: number;
    industrial: number;
    wasteBurning: number;
  };
  forecast: {
    hours24: number;
    hours48: number;
  };
  coordinates: {
    path: string;
    centerX: number;
    centerY: number;
  };
  alerts: string[];
  priority: number;
}

export interface TimeSeriesData {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
}

export interface WeatherData {
  windSpeed: number;
  temperature: number;
  humidity: number;
}

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


