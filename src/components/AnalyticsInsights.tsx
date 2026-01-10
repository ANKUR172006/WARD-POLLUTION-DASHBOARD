import React from 'react';
import { TimeSeriesData, WeatherData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wind, Thermometer, Droplets } from 'lucide-react';

interface AnalyticsInsightsProps {
  timeSeriesData: TimeSeriesData[];
  weatherData: WeatherData;
  selectedWardName: string | null;
}

/**
 * Analytics Insights Component
 * 
 * GOVERNANCE RELEVANCE:
 * Time-series analysis and weather correlation enable evidence-based policy evaluation.
 * This component supports:
 * - Trend identification to assess intervention effectiveness over time
 * - Weather impact correlation for understanding external factors
 * - Pattern recognition for seasonal pollution management
 * - Data-driven evaluation of policy interventions
 * 
 * By tracking pollution trends and correlating with weather patterns, officers can
 * evaluate whether policy interventions are effective, adjust strategies based on
 * weather forecasts, and demonstrate accountability through measurable outcomes.
 */
export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({
  timeSeriesData,
  weatherData,
  selectedWardName,
}) => {
  const spikeDetected = timeSeriesData.length > 0 && 
    timeSeriesData[timeSeriesData.length - 1].aqi > timeSeriesData[0].aqi + 50;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Analytics & Insights</h3>

      {/* Time Series Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {selectedWardName ? `${selectedWardName} - ` : ''}Daily AQI Trends (7 Days)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#3b82f6"
              strokeWidth={2}
              name="AQI"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="pm25"
              stroke="#ef4444"
              strokeWidth={2}
              name="PM2.5"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="pm10"
              stroke="#f59e0b"
              strokeWidth={2}
              name="PM10"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spike Detection */}
      {spikeDetected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-semibold text-sm text-red-900">Pollution Spike Detected</span>
          </div>
          <p className="text-xs text-red-800">
            AQI has increased significantly over the past week. Immediate intervention recommended.
          </p>
        </div>
      )}

      {/* Weather Impact */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Weather Impact Correlation</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Wind Speed</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{weatherData.windSpeed} km/h</p>
            <p className="text-xs text-gray-600 mt-1">
              {weatherData.windSpeed > 10 ? 'Favorable for dispersion' : 'Low dispersion expected'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Temperature</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{weatherData.temperature}°C</p>
            <p className="text-xs text-gray-600 mt-1">
              {weatherData.temperature > 30 ? 'High temp may increase O₃' : 'Normal conditions'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Humidity</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{weatherData.humidity}%</p>
            <p className="text-xs text-gray-600 mt-1">
              {weatherData.humidity > 70 ? 'High humidity traps pollutants' : 'Normal conditions'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};







