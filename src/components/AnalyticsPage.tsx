import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Wind, Thermometer, Droplets } from 'lucide-react';
import { mockWards, mockTimeSeriesData, mockWeatherData } from '../data/mockData';
import { getAQIColor } from '../data/mockData';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

/**
 * Analytics Page - Advanced Analytics for Officers
 * 
 * GOVERNANCE RELEVANCE:
 * Provides data-driven insights for evidence-based policy making. Time-series analysis
 * helps identify pollution trends, seasonal patterns, and intervention effectiveness.
 * Source attribution enables targeted policy interventions (traffic, construction, etc.)
 */
export const AnalyticsPage: React.FC = () => {
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  const wardOptions = [{ id: 'all', name: 'All Wards' }, ...mockWards];

  // Filter time series data based on selected time filter
  const getFilteredTimeSeriesData = () => {
    const allData = mockTimeSeriesData;
    switch (timeFilter) {
      case 'day':
        // Last 24 hours (assuming hourly data, for demo use last 7 data points)
        return allData.slice(-7);
      case 'week':
        // Last 7 days
        return allData;
      case 'month':
        // Generate monthly data (for prototype, show 30 days)
        return Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            aqi: 150 + Math.random() * 100,
            pm25: 100 + Math.random() * 80,
            pm10: 150 + Math.random() * 100,
          };
        });
      default:
        return allData;
    }
  };

  const filteredTimeSeriesData = getFilteredTimeSeriesData();

  const selectedWardData = selectedWard === 'all' 
    ? mockWards 
    : mockWards.filter(w => w.id === selectedWard);

  // Source distribution data
  const sourceDistribution = selectedWardData.reduce((acc, ward) => {
    acc.vehicular += ward.sources.vehicular;
    acc.construction += ward.sources.construction;
    acc.industrial += ward.sources.industrial;
    acc.wasteBurning += ward.sources.wasteBurning;
    return acc;
  }, { vehicular: 0, construction: 0, industrial: 0, wasteBurning: 0 });

  const sourceData = [
    { name: 'Vehicular', value: sourceDistribution.vehicular / selectedWardData.length, color: '#3b82f6' },
    { name: 'Construction', value: sourceDistribution.construction / selectedWardData.length, color: '#f59e0b' },
    { name: 'Industrial', value: sourceDistribution.industrial / selectedWardData.length, color: '#ef4444' },
    { name: 'Waste Burning', value: sourceDistribution.wasteBurning / selectedWardData.length, color: '#8b5cf6' },
  ];

  // Pollutant comparison
  const pollutantComparison = selectedWardData.map(ward => ({
    name: ward.name.split(' - ')[0],
    pm25: ward.pollutants.pm25,
    pm10: ward.pollutants.pm10,
    no2: ward.pollutants.no2,
    so2: ward.pollutants.so2,
  }));

  // AQI distribution
  const aqiDistribution = [
    { name: 'Good', count: selectedWardData.filter(w => w.category === 'Good').length },
    { name: 'Satisfactory', count: selectedWardData.filter(w => w.category === 'Satisfactory').length },
    { name: 'Moderate', count: selectedWardData.filter(w => w.category === 'Moderate').length },
    { name: 'Poor', count: selectedWardData.filter(w => w.category === 'Poor').length },
    { name: 'Very Poor', count: selectedWardData.filter(w => w.category === 'Very Poor').length },
    { name: 'Severe', count: selectedWardData.filter(w => w.category === 'Severe').length },
  ];

  // Forecast accuracy (mock)
  const forecastData = selectedWardData.map(ward => ({
    name: ward.name.split(' - ')[0],
    current: ward.aqi,
    forecast24: ward.forecast.hours24,
    forecast48: ward.forecast.hours48,
  }));

  // Weather correlation
  const weatherImpact = [
    { parameter: 'Wind Speed', value: mockWeatherData.windSpeed, impact: 'Favorable', color: '#10b981' },
    { parameter: 'Temperature', value: mockWeatherData.temperature, impact: 'Moderate', color: '#f59e0b' },
    { parameter: 'Humidity', value: mockWeatherData.humidity, impact: 'High', color: '#3b82f6' },
  ];

  const avgAQI = Math.round(selectedWardData.reduce((sum, w) => sum + w.aqi, 0) / selectedWardData.length);
  const maxAQI = Math.max(...selectedWardData.map(w => w.aqi));
  const minAQI = Math.min(...selectedWardData.map(w => w.aqi));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Advanced Analytics & Insights
            </h2>
            <p className="text-sm text-gray-600 mt-1">Deep dive into pollution patterns and trends</p>
          </div>
          <div className="flex gap-2">
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as 'day' | 'week' | 'month')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select time period for analysis"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            {/* Ward Filter */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {wardOptions.map(ward => (
                <option key={ward.id} value={ward.id}>{ward.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-600 mb-1">Average AQI</p>
            <p className="text-2xl font-bold text-blue-900">{avgAQI}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs text-red-600 mb-1">Maximum AQI</p>
            <p className="text-2xl font-bold text-red-900">{maxAQI}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-600 mb-1">Minimum AQI</p>
            <p className="text-2xl font-bold text-green-900">{minAQI}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Wards Analyzed</p>
            <p className="text-2xl font-bold text-gray-900">{selectedWardData.length}</p>
          </div>
        </div>
      </div>

      {/* Time Series Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {timeFilter === 'day' ? '24-Hour' : timeFilter === 'week' ? '7-Day' : '30-Day'} Trend Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredTimeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={2} name="AQI" />
            <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2} name="PM2.5" />
            <Line type="monotone" dataKey="pm10" stroke="#f59e0b" strokeWidth={2} name="PM10" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pollution Source Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* AQI Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">AQI Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aqiDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pollutant Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pollutant Comparison Across Wards</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={pollutantComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="pm25" fill="#ef4444" name="PM2.5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pm10" fill="#f59e0b" name="PM10" radius={[4, 4, 0, 0]} />
            <Bar dataKey="no2" fill="#8b5cf6" name="NO₂" radius={[4, 4, 0, 0]} />
            <Bar dataKey="so2" fill="#10b981" name="SO₂" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Forecast vs Current AQI</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current AQI" />
            <Line type="monotone" dataKey="forecast24" stroke="#f59e0b" strokeWidth={2} name="24h Forecast" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="forecast48" stroke="#ef4444" strokeWidth={2} name="48h Forecast" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weather Impact */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Weather Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weatherImpact.map((item, idx) => {
            const Icon = idx === 0 ? Wind : idx === 1 ? Thermometer : Droplets;
            return (
              <div key={item.parameter} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-sm text-gray-700">{item.parameter}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {item.value}
                  {idx === 0 ? ' km/h' : idx === 1 ? '°C' : '%'}
                </p>
                <p className="text-xs text-gray-600">
                  Impact: <span className="font-medium">{item.impact}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};






