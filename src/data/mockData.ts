import { WardData, TimeSeriesData, WeatherData, PolicyAction } from '../types';

export const mockWards: WardData[] = [
  {
    id: 'W001',
    name: 'New Delhi - Lutyens Zone',
    aqi: 342,
    category: 'Severe',
    pollutants: { pm25: 285, pm10: 420, no2: 95, so2: 45, co: 8.2 },
    sources: { vehicular: 45, construction: 25, industrial: 20, wasteBurning: 10 },
    forecast: { hours24: 365, hours48: 380 },
    coordinates: { 
      path: "M 200 70 L 320 65 L 350 95 L 360 130 L 355 170 L 340 200 L 310 215 L 280 210 L 250 195 L 220 170 L 200 140 L 200 70 Z",
      centerX: 280, 
      centerY: 140 
    },
    alerts: ['High vehicular traffic', 'Construction activity detected'],
    priority: 1,
  },
  {
    id: 'W002',
    name: 'Central Delhi - Old Delhi',
    aqi: 298,
    category: 'Very Poor',
    pollutants: { pm25: 245, pm10: 380, no2: 110, so2: 85, co: 7.5 },
    sources: { vehicular: 30, construction: 15, industrial: 45, wasteBurning: 10 },
    forecast: { hours24: 310, hours48: 325 },
    coordinates: { 
      path: "M 130 110 L 200 105 L 220 140 L 230 180 L 225 220 L 210 250 L 185 265 L 155 260 L 130 240 L 115 200 L 120 150 L 130 110 Z",
      centerX: 175, 
      centerY: 185 
    },
    alerts: ['Industrial emissions spike', 'Dense traffic in Chandni Chowk'],
    priority: 2,
  },
  {
    id: 'W003',
    name: 'North Delhi',
    aqi: 185,
    category: 'Moderate',
    pollutants: { pm25: 125, pm10: 195, no2: 55, so2: 25, co: 4.2 },
    sources: { vehicular: 50, construction: 20, industrial: 15, wasteBurning: 15 },
    forecast: { hours24: 195, hours48: 210 },
    coordinates: { 
      path: "M 90 60 L 200 55 L 220 85 L 230 120 L 225 160 L 210 190 L 180 205 L 150 200 L 120 180 L 100 150 L 90 110 L 90 60 Z",
      centerX: 160, 
      centerY: 130 
    },
    alerts: [],
    priority: 5,
  },
  {
    id: 'W004',
    name: 'East Delhi',
    aqi: 265,
    category: 'Poor',
    pollutants: { pm25: 195, pm10: 310, no2: 75, so2: 35, co: 6.1 },
    sources: { vehicular: 55, construction: 30, industrial: 10, wasteBurning: 5 },
    forecast: { hours24: 280, hours48: 290 },
    coordinates: { 
      path: "M 180 210 L 260 205 L 280 240 L 290 280 L 285 320 L 270 350 L 240 365 L 210 360 L 180 340 L 165 300 L 170 250 L 180 210 Z",
      centerX: 235, 
      centerY: 285 
    },
    alerts: ['Traffic congestion expected', 'High population density'],
    priority: 3,
  },
  {
    id: 'W005',
    name: 'South Delhi',
    aqi: 142,
    category: 'Moderate',
    pollutants: { pm25: 95, pm10: 155, no2: 45, so2: 20, co: 3.5 },
    sources: { vehicular: 40, construction: 25, industrial: 20, wasteBurning: 15 },
    forecast: { hours24: 155, hours48: 165 },
    coordinates: { 
      path: "M 360 210 L 460 205 L 490 240 L 500 290 L 495 340 L 480 370 L 450 385 L 410 380 L 370 360 L 350 320 L 355 260 L 360 210 Z",
      centerX: 425, 
      centerY: 295 
    },
    alerts: [],
    priority: 6,
  },
  {
    id: 'W006',
    name: 'West Delhi',
    aqi: 95,
    category: 'Satisfactory',
    pollutants: { pm25: 65, pm10: 105, no2: 30, so2: 15, co: 2.1 },
    sources: { vehicular: 35, construction: 20, industrial: 25, wasteBurning: 20 },
    forecast: { hours24: 105, hours48: 115 },
    coordinates: { 
      path: "M 320 110 L 420 105 L 440 140 L 450 180 L 445 220 L 430 250 L 400 265 L 370 260 L 340 240 L 320 200 L 315 150 L 320 110 Z",
      centerX: 380, 
      centerY: 185 
    },
    alerts: [],
    priority: 8,
  },
  {
    id: 'W007',
    name: 'North East Delhi',
    aqi: 312,
    category: 'Severe',
    pollutants: { pm25: 265, pm10: 395, no2: 105, so2: 50, co: 8.8 },
    sources: { vehicular: 60, construction: 20, industrial: 15, wasteBurning: 5 },
    forecast: { hours24: 335, hours48: 350 },
    coordinates: { 
      path: "M 260 260 L 340 255 L 360 290 L 370 330 L 365 370 L 350 390 L 320 395 L 290 390 L 260 370 L 245 330 L 250 280 L 260 260 Z",
      centerX: 315, 
      centerY: 325 
    },
    alerts: ['Heavy traffic flow', 'Road dust accumulation', 'Industrial area'],
    priority: 2,
  },
  {
    id: 'W008',
    name: 'South West Delhi',
    aqi: 225,
    category: 'Poor',
    pollutants: { pm25: 165, pm10: 265, no2: 65, so2: 30, co: 5.5 },
    sources: { vehicular: 45, construction: 30, industrial: 15, wasteBurning: 10 },
    forecast: { hours24: 240, hours48: 250 },
    coordinates: { 
      path: "M 460 160 L 540 155 L 560 190 L 570 240 L 565 290 L 550 320 L 520 335 L 490 330 L 460 310 L 445 270 L 450 210 L 460 160 Z",
      centerX: 510, 
      centerY: 245 
    },
    alerts: ['Construction activity', 'Metro expansion work'],
    priority: 4,
  },
];

export const mockTimeSeriesData: TimeSeriesData[] = [
  { date: '2024-01-01', aqi: 185, pm25: 125, pm10: 195 },
  { date: '2024-01-02', aqi: 198, pm25: 135, pm10: 210 },
  { date: '2024-01-03', aqi: 215, pm25: 145, pm10: 225 },
  { date: '2024-01-04', aqi: 205, pm25: 140, pm10: 220 },
  { date: '2024-01-05', aqi: 225, pm25: 155, pm10: 240 },
  { date: '2024-01-06', aqi: 240, pm25: 165, pm10: 255 },
  { date: '2024-01-07', aqi: 265, pm25: 180, pm10: 280 },
];

export const mockWeatherData: WeatherData = {
  windSpeed: 8.5,
  temperature: 28,
  humidity: 65,
};

export function getPolicyActions(ward: WardData): PolicyAction[] {
  const actions: PolicyAction[] = [];

  if (ward.aqi >= 300) {
    actions.push({
      id: 'A001',
      type: 'traffic',
      title: 'Implement Odd-Even Vehicle Restriction',
      description: 'Restrict vehicle movement based on registration numbers during peak hours (8 AM - 8 PM)',
      priority: 'high',
      estimatedImpact: 'Expected 15-20% reduction in vehicular emissions',
    });
  }

  if (ward.sources.construction > 20) {
    actions.push({
      id: 'A002',
      type: 'construction',
      title: 'Suspend Construction Activities',
      description: 'Temporarily halt all non-essential construction work until AQI improves below 200',
      priority: 'high',
      estimatedImpact: 'Immediate 20-25% reduction in PM10 and PM2.5',
    });
  }

  if (ward.sources.vehicular > 50) {
    actions.push({
      id: 'A003',
      type: 'sweeping',
      title: 'Intensify Mechanical Road Sweeping',
      description: 'Deploy additional mechanical sweepers on major arterial roads twice daily',
      priority: 'medium',
      estimatedImpact: 'Reduction in road dust resuspension by 30%',
    });
  }

  if (ward.aqi >= 250) {
    actions.push({
      id: 'A004',
      type: 'enforcement',
      title: 'Strengthen Pollution Control Enforcement',
      description: 'Increase monitoring and penalize violations of construction dust norms and vehicle emissions',
      priority: 'high',
      estimatedImpact: 'Improved compliance and 10-15% emission reduction',
    });
  }

  actions.push({
    id: 'A005',
    type: 'health',
    title: 'Issue Health Advisory',
    description: `Alert citizens about ${ward.category} air quality. Advise vulnerable groups to avoid outdoor activities`,
    priority: ward.aqi >= 300 ? 'high' : 'medium',
    estimatedImpact: 'Public awareness and health protection',
  });

  return actions;
}

// Deployment-safe: Changed to string type to avoid AQICategory import issues
export function getAQIColor(category: string): string {
  const colors: Record<string, string> = {
    'Good': '#10b981',
    'Satisfactory': '#84cc16',
    'Moderate': '#fbbf24',
    'Poor': '#f97316',
    'Very Poor': '#ef4444',
    'Severe': '#991b1b',
  };
  return colors[category] || '#6b7280'; // Default gray if category not found
}

// Deployment-safe: Changed to string type to avoid AQICategory import issues
export function getAQIBgColor(category: string): string {
  const colors: Record<string, string> = {
    'Good': '#d1fae5',
    'Satisfactory': '#fef3c7',
    'Moderate': '#fde68a',
    'Poor': '#fed7aa',
    'Very Poor': '#fee2e2',
    'Severe': '#fecaca',
  };
  return colors[category] || '#f3f4f6'; // Default gray if category not found
}
