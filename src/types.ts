// Changed to string type for deployment compatibility
// Deployment-safe: AQICategory is now just string to avoid enum/type conflicts
export type AQICategory = string; // Accepts: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe'

export interface WardData {
  id: string;
  name: string;
  aqi: number;
  category: string; // Changed from AQICategory to string for deployment compatibility
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
  // Deployment-safe: Simplified coordinates type to match actual usage (path-based SVG coordinates)
  coordinates: { path: string; centerX?: number; centerY?: number };
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

export interface PolicyAction {
  id: string;
  type: 'traffic' | 'construction' | 'sweeping' | 'enforcement' | 'health';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}



