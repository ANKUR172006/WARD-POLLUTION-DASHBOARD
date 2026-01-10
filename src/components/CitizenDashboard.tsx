import React from 'react';
import { WardMap } from './WardMap';
import { WardData } from '../types';
import { getAQIColor } from '../data/mockData';
import { AlertCircle, Heart } from 'lucide-react';

interface CitizenDashboardProps {
  wards: WardData[];
  selectedWardId: string | null;
  onWardClick: (wardId: string) => void;
  onWardHover: (wardId: string | null) => void;
  hoveredWardId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Citizen Dashboard - Simplified view focused on health and awareness
 * 
 * GOVERNANCE RELEVANCE:
 * Citizen engagement is crucial for effective environmental governance. This simplified
 * interface empowers citizens with accessible air quality information, enabling:
 * - Informed personal health decisions (when to exercise outdoors, use masks, etc.)
 * - Public awareness and pressure for policy accountability
 * - Community participation in pollution reduction efforts
 * - Transparent communication of government monitoring efforts
 * 
 * By making complex pollution data understandable, citizens become active stakeholders
 * in environmental protection, supporting democratic governance and policy effectiveness.
 */
export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  wards,
  selectedWardId,
  onWardClick,
  onWardHover,
  hoveredWardId,
  loading,
  error,
}) => {
  // Safety checks
  if (!wards || !Array.isArray(wards)) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Unable to load ward data. Please try again.</p>
      </div>
    );
  }

  const selectedWard = selectedWardId && wards.length > 0
    ? wards.find(w => w && w.id === selectedWardId) || null
    : null;

  // Get health advisory based on AQI category with safety check
  const getHealthAdvisory = (category: string | undefined) => {
    if (!category) {
      return {
        message: 'Check air quality before going outdoors.',
        color: 'text-gray-700 bg-gray-50 border-gray-200',
        icon: 'ℹ️',
      };
    }
    switch (category) {
      case 'Good':
      case 'Satisfactory':
        return {
          message: 'Air quality is acceptable. Enjoy outdoor activities!',
          color: 'text-green-700 bg-green-50 border-green-200',
          icon: '✅',
        };
      case 'Moderate':
        return {
          message: 'Sensitive individuals should consider reducing prolonged outdoor exertion.',
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
          icon: '⚠️',
        };
      case 'Poor':
        return {
          message: 'Everyone should reduce outdoor activities. Sensitive groups should avoid outdoor activities.',
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          icon: '🚫',
        };
      case 'Very Poor':
      case 'Severe':
        return {
          message: 'Health alert: Everyone should avoid outdoor activities. Sensitive groups should remain indoors.',
          color: 'text-red-700 bg-red-50 border-red-200',
          icon: '🔴',
        };
      default:
        return {
          message: 'Check air quality before going outdoors.',
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          icon: 'ℹ️',
        };
    }
  };

  // Get simplified pollution level
  const getSimplifiedLevel = (aqi: number) => {
    if (aqi <= 100) return 'Good';
    if (aqi <= 200) return 'Moderate';
    return 'Poor';
  };

  // Find high-risk wards (AQI > 200) with safety checks
  const highRiskWards = wards.filter(w => w && typeof w.aqi === 'number' && w.aqi > 200);

  return (
    <div className="space-y-6">
      {/* Health Advisory Banner */}
      {selectedWard && selectedWard.category && (
        <div className={`border-2 rounded-lg p-6 ${getHealthAdvisory(selectedWard.category).color}`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">{getHealthAdvisory(selectedWard.category).icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Health Advisory for {selectedWard.name}
              </h3>
              <p className="text-base mb-3">{getHealthAdvisory(selectedWard.category).message}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">Current AQI: {selectedWard.aqi}</span>
                <span className="font-semibold">
                  Level: {getSimplifiedLevel(selectedWard.aqi)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ward Map */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Air Quality Map - Delhi Wards
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Click on any ward to see air quality information and health recommendations
        </p>
        <div className="h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading map data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-amber-600">{error}</p>
            </div>
          ) : (
            <WardMap
              wards={wards}
              selectedWardId={selectedWardId}
              onWardClick={onWardClick}
              onWardHover={onWardHover}
              hoveredWardId={hoveredWardId}
            />
          )}
        </div>
      </div>

      {/* Selected Ward Information */}
      {selectedWard ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {selectedWard.name} - Air Quality Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Air Quality Index</p>
              <p className="text-3xl font-bold" style={{ color: getAQIColor(selectedWard.category) }}>
                {selectedWard.aqi}
              </p>
              <p className="text-sm text-gray-600 mt-1">{selectedWard.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Simplified Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {getSimplifiedLevel(selectedWard.aqi)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedWard.aqi <= 100
                  ? 'Safe for outdoor activities'
                  : selectedWard.aqi <= 200
                  ? 'Limit outdoor activities'
                  : 'Avoid outdoor activities'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">48-Hour Forecast</p>
              <p className="text-2xl font-bold text-gray-900">{selectedWard.forecast.hours48}</p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedWard.forecast.hours48 > selectedWard.aqi + 20
                  ? '⚠️ Expected to worsen'
                  : '→ Expected to remain similar'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-700">
            Select a ward on the map to view air quality information and health recommendations
          </p>
        </div>
      )}

      {/* High-Risk Wards Alert */}
      {highRiskWards.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">⚠️ High-Risk Wards Alert</h3>
              <p className="text-red-800 mb-3">
                {highRiskWards.length} ward(s) currently have poor air quality (AQI above 200):
              </p>
              <div className="flex flex-wrap gap-2">
                {highRiskWards.map((ward) => (
                  <button
                    key={ward.id}
                    onClick={() => onWardClick(ward.id)}
                    className="px-3 py-1 bg-white border border-red-300 rounded text-sm font-medium text-red-900 hover:bg-red-100 transition-colors"
                  >
                    {ward.name} (AQI: {ward.aqi})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

