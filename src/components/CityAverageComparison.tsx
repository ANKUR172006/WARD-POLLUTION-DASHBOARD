import React from 'react';
import { WardData } from '../types';
import { getAQIColor } from '../data/mockData';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CityAverageComparisonProps {
  wards: WardData[];
  selectedWardId: string | null;
}

/**
 * City Average vs Ward Comparison Component
 * 
 * GOVERNANCE RELEVANCE:
 * This component enables evidence-based policy decisions by comparing individual ward
 * performance against city-wide averages. Officers can identify wards requiring
 * targeted interventions, allocate resources efficiently, and track improvement
 * progress against baseline metrics.
 */
export const CityAverageComparison: React.FC<CityAverageComparisonProps> = ({
  wards,
  selectedWardId,
}) => {
  // Calculate city-wide average AQI
  const cityAverageAQI = Math.round(wards.reduce((sum, w) => sum + w.aqi, 0) / wards.length);
  
  // Calculate average for each pollutant
  const cityAvgPollutants = {
    pm25: Math.round(wards.reduce((sum, w) => sum + w.pollutants.pm25, 0) / wards.length),
    pm10: Math.round(wards.reduce((sum, w) => sum + w.pollutants.pm10, 0) / wards.length),
    no2: Math.round(wards.reduce((sum, w) => sum + w.pollutants.no2, 0) / wards.length),
    so2: Math.round(wards.reduce((sum, w) => sum + w.pollutants.so2, 0) / wards.length),
  };

  const selectedWard = selectedWardId
    ? wards.find(w => w.id === selectedWardId)
    : null;

  // Compare each ward against city average
  const wardComparisons = wards.map(ward => {
    const diff = ward.aqi - cityAverageAQI;
    const diffPercent = ((diff / cityAverageAQI) * 100).toFixed(1);
    return {
      name: ward.name.split(' - ')[0],
      wardAQI: ward.aqi,
      cityAvg: cityAverageAQI,
      difference: diff,
      diffPercent: parseFloat(diffPercent),
      status: diff > 50 ? 'above' : diff < -50 ? 'below' : 'normal',
      ward,
    };
  }).sort((a, b) => b.difference - a.difference); // Sort by difference (worst first)

  // Chart data for selected ward comparison
  const comparisonData = selectedWard ? [
    {
      parameter: 'AQI',
      ward: selectedWard.aqi,
      cityAvg: cityAverageAQI,
    },
    {
      parameter: 'PM2.5',
      ward: selectedWard.pollutants.pm25,
      cityAvg: cityAvgPollutants.pm25,
    },
    {
      parameter: 'PM10',
      ward: selectedWard.pollutants.pm10,
      cityAvg: cityAvgPollutants.pm10,
    },
    {
      parameter: 'NO₂',
      ward: selectedWard.pollutants.no2,
      cityAvg: cityAvgPollutants.no2,
    },
  ] : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          City Average vs Ward Comparison
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <p className="text-xs text-blue-600 mb-1">City Average AQI</p>
          <p className="text-2xl font-bold text-blue-900">{cityAverageAQI}</p>
        </div>
      </div>

      {/* Selected Ward Detailed Comparison */}
      {selectedWard && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {selectedWard.name} vs City Average
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="parameter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="ward" name={`${selectedWard.name.split(' - ')[0]} Value`} fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cityAvg" name="City Average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Difference</p>
              <p className={`text-xl font-bold ${selectedWard.aqi > cityAverageAQI ? 'text-red-600' : 'text-green-600'}`}>
                {selectedWard.aqi > cityAverageAQI ? '+' : ''}{selectedWard.aqi - cityAverageAQI}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((selectedWard.aqi - cityAverageAQI) / cityAverageAQI * 100).toFixed(1)}% vs city average
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className={`text-xl font-bold ${
                selectedWard.aqi > cityAverageAQI + 50 ? 'text-red-600' :
                selectedWard.aqi < cityAverageAQI - 50 ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {selectedWard.aqi > cityAverageAQI + 50 ? 'Above Average' :
                 selectedWard.aqi < cityAverageAQI - 50 ? 'Below Average' :
                 'Near Average'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Wards Comparison Table */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          All Wards vs City Average
        </h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {wardComparisons.map((comparison) => (
            <div
              key={comparison.ward.id}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-40 text-sm font-medium text-gray-700">
                {comparison.name}
              </div>
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-4 rounded"
                      style={{
                        width: `${(comparison.wardAQI / 400) * 100}%`,
                        backgroundColor: getAQIColor(comparison.ward.category),
                        minWidth: '20px',
                      }}
                    />
                    <span className="text-sm font-bold text-gray-900 w-12">
                      {comparison.wardAQI}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    City Avg: {cityAverageAQI}
                  </div>
                </div>
                <div className="w-24 text-right">
                  {comparison.difference > 0 ? (
                    <div className="flex items-center justify-end gap-1 text-red-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-bold">+{comparison.difference}</span>
                    </div>
                  ) : comparison.difference < 0 ? (
                    <div className="flex items-center justify-end gap-1 text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-bold">{comparison.difference}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Equal</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {comparison.diffPercent > 0 ? '+' : ''}{comparison.diffPercent}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Policy Insight</p>
            <p className="text-sm text-blue-800">
              {wardComparisons.filter(w => w.status === 'above').length} ward(s) are significantly above city average and 
              require immediate intervention. Priority resource allocation should target these high-variance wards 
              to improve overall city air quality metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

