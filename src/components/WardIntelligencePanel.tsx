import React from 'react';
import { WardData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getAQIColor, getAQIBgColor } from '../data/mockData';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface WardIntelligencePanelProps {
  ward: WardData | null;
}

/**
 * Ward Intelligence Panel Component
 * 
 * GOVERNANCE RELEVANCE:
 * Detailed ward-level intelligence enables targeted policy interventions. This panel provides:
 * - Comprehensive pollution source attribution for evidence-based interventions
 * - Pollutant breakdown enabling compliance monitoring against standards
 * - Forecast data supporting proactive policy measures
 * - Detailed metrics supporting resource allocation decisions
 * 
 * By presenting detailed technical data alongside actionable insights, officers can
 * make informed decisions on specific pollution sources to target (vehicular, construction,
 * industrial) and track intervention effectiveness through trend monitoring.
 */
export const WardIntelligencePanel: React.FC<WardIntelligencePanelProps> = ({ ward }) => {
  if (!ward) {
    return (
      <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg">
        <p className="text-gray-500 text-sm">Select a ward to view detailed intelligence</p>
      </div>
    );
  }

  const sourceData = [
    { name: 'Vehicular', value: ward.sources.vehicular, color: '#3b82f6' },
    { name: 'Construction', value: ward.sources.construction, color: '#f59e0b' },
    { name: 'Industrial', value: ward.sources.industrial, color: '#ef4444' },
    { name: 'Waste Burning', value: ward.sources.wasteBurning, color: '#8b5cf6' },
  ];

  const pollutantData = [
    { name: 'PM2.5', value: ward.pollutants.pm25, limit: 60 },
    { name: 'PM10', value: ward.pollutants.pm10, limit: 100 },
    { name: 'NO₂', value: ward.pollutants.no2, limit: 80 },
    { name: 'SO₂', value: ward.pollutants.so2, limit: 80 },
    { name: 'CO', value: ward.pollutants.co, limit: 4 },
  ];

  const forecastTrend = ward.forecast.hours48 > ward.aqi ? 'up' : 'down';

  return (
    <div className="h-full overflow-y-auto bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{ward.name}</h2>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-lg font-bold text-lg"
            style={{
              backgroundColor: getAQIBgColor(ward.category),
              color: getAQIColor(ward.category),
            }}
          >
            AQI: {ward.aqi}
          </div>
          <span
            className="px-3 py-1 rounded text-sm font-semibold"
            style={{
              backgroundColor: getAQIBgColor(ward.category),
              color: getAQIColor(ward.category),
            }}
          >
            {ward.category}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {ward.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-sm text-amber-900">Active Alerts</span>
          </div>
          <ul className="space-y-1">
            {ward.alerts.map((alert, idx) => (
              <li key={idx} className="text-xs text-amber-800">• {alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pollutant Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pollutant Levels</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={pollutantData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-gray-600">
          <p>Values in μg/m³ (except CO in mg/m³)</p>
        </div>
      </div>

      {/* Source Attribution */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pollution Source Attribution (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={70}
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

      {/* Forecast */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Short-term AQI Forecast</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">24 hours</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{ward.forecast.hours24}</span>
              {ward.forecast.hours24 > ward.aqi ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">48 hours</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{ward.forecast.hours48}</span>
              {ward.forecast.hours48 > ward.aqi ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-300">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Trend:</span>{' '}
              {forecastTrend === 'up' ? (
                <span className="text-red-600">Deteriorating air quality expected</span>
              ) : (
                <span className="text-green-600">Improving air quality expected</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};







