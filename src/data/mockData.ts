import { WardData, TimeSeriesData, WeatherData, PolicyAction } from '../types';

export const mockWards: WardData[] = [
  {
    id: 'W001',
    name: 'Ward 1 - Central Business District',
    aqi: 342,
    category: 'Severe',
    pollutants: { pm25: 285, pm10: 420, no2: 95, so2: 45, co: 8.2 },
    sources: { vehicular: 45, construction: 25, industrial: 20, wasteBurning: 10 },
    forecast: { hours24: 365, hours48: 380 },
    coordinates: { x: 10, y: 10, width: 180, height: 120 },
    alerts: ['High vehicular traffic', 'Construction activity detected'],
    priority: 1,
  },
  {
    id: 'W002',
    name: 'Ward 2 - Industrial Zone',
    aqi: 298,
    category: 'Very Poor',
    pollutants: { pm25: 245, pm10: 380, no2: 110, so2: 85, co: 7.5 },
    sources: { vehicular: 30, construction: 15, industrial: 45, wasteBurning: 10 },
    forecast: { hours24: 310, hours48: 325 },
    coordinates: { x: 200, y: 10, width: 180, height: 120 },
    alerts: ['Industrial emissions spike'],
    priority: 2,
  },
  {
    id: 'W003',
    name: 'Ward 3 - Residential North',
    aqi: 185,
    category: 'Moderate',
    pollutants: { pm25: 125, pm10: 195, no2: 55, so2: 25, co: 4.2 },
    sources: { vehicular: 50, construction: 20, industrial: 15, wasteBurning: 15 },
    forecast: { hours24: 195, hours48: 210 },
    coordinates: { x: 10, y: 140, width: 180, height: 120 },
    alerts: [],
    priority: 5,
  },
  {
    id: 'W004',
    name: 'Ward 4 - Commercial Hub',
    aqi: 265,
    category: 'Poor',
    pollutants: { pm25: 195, pm10: 310, no2: 75, so2: 35, co: 6.1 },
    sources: { vehicular: 55, construction: 30, industrial: 10, wasteBurning: 5 },
    forecast: { hours24: 280, hours48: 290 },
    coordinates: { x: 200, y: 140, width: 180, height: 120 },
    alerts: ['Traffic congestion expected'],
    priority: 3,
  },
  {
    id: 'W005',
    name: 'Ward 5 - Suburban East',
    aqi: 142,
    category: 'Moderate',
    pollutants: { pm25: 95, pm10: 155, no2: 45, so2: 20, co: 3.5 },
    sources: { vehicular: 40, construction: 25, industrial: 20, wasteBurning: 15 },
    forecast: { hours24: 155, hours48: 165 },
    coordinates: { x: 390, y: 10, width: 180, height: 120 },
    alerts: [],
    priority: 6,
  },
  {
    id: 'W006',
    name: 'Ward 6 - Green Belt',
    aqi: 95,
    category: 'Satisfactory',
    pollutants: { pm25: 65, pm10: 105, no2: 30, so2: 15, co: 2.1 },
    sources: { vehicular: 35, construction: 20, industrial: 25, wasteBurning: 20 },
    forecast: { hours24: 105, hours48: 115 },
    coordinates: { x: 390, y: 140, width: 180, height: 120 },
    alerts: [],
    priority: 8,
  },
  {
    id: 'W007',
    name: 'Ward 7 - Transit Corridor',
    aqi: 312,
    category: 'Severe',
    pollutants: { pm25: 265, pm10: 395, no2: 105, so2: 50, co: 8.8 },
    sources: { vehicular: 60, construction: 20, industrial: 15, wasteBurning: 5 },
    forecast: { hours24: 335, hours48: 350 },
    coordinates: { x: 10, y: 270, width: 180, height: 120 },
    alerts: ['Heavy traffic flow', 'Road dust accumulation'],
    priority: 2,
  },
  {
    id: 'W008',
    name: 'Ward 8 - Mixed Use',
    aqi: 225,
    category: 'Poor',
    pollutants: { pm25: 165, pm10: 265, no2: 65, so2: 30, co: 5.5 },
    sources: { vehicular: 45, construction: 30, industrial: 15, wasteBurning: 10 },
    forecast: { hours24: 240, hours48: 250 },
    coordinates: { x: 200, y: 270, width: 180, height: 120 },
    alerts: ['Construction activity'],
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

export function getAQIColor(category: AQICategory): string {
  const colors: Record<AQICategory, string> = {
    'Good': '#10b981',
    'Satisfactory': '#84cc16',
    'Moderate': '#fbbf24',
    'Poor': '#f97316',
    'Very Poor': '#ef4444',
    'Severe': '#991b1b',
  };
  return colors[category];
}

export function getAQIBgColor(category: AQICategory): string {
  const colors: Record<AQICategory, string> = {
    'Good': '#d1fae5',
    'Satisfactory': '#fef3c7',
    'Moderate': '#fde68a',
    'Poor': '#fed7aa',
    'Very Poor': '#fee2e2',
    'Severe': '#fecaca',
  };
  return colors[category];
}


