import React from 'react';
import { WardMap } from './WardMap';
import { WardIntelligencePanel } from './WardIntelligencePanel';
import { PolicyRecommendations } from './PolicyRecommendations';
import { AnalyticsInsights } from './AnalyticsInsights';
import { AlertSystem } from './AlertSystem';
import { WardData } from '../types';
import { getAQIColor } from '../data/mockData';
import { AlertTriangle, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { TimeSeriesData, WeatherData } from '../services/api';
import { CityAverageComparison } from './CityAverageComparison';
import { PriorityRanking } from './PriorityRanking';

interface OfficerDashboardProps {
  wards: WardData[];
  selectedWardId: string | null;
  onWardClick: (wardId: string) => void;
  onWardHover: (wardId: string | null) => void;
  hoveredWardId: string | null;
  timeSeriesData: TimeSeriesData[];
  weatherData: WeatherData;
  policyActions: any[];
  loading: boolean;
  error: string | null;
}

/**
 * Officer Dashboard - Analytical view for government/municipal officers
 * 
 * GOVERNANCE RELEVANCE:
 * This dashboard provides comprehensive analytical tools for evidence-based decision making.
 * Officers can monitor city-wide pollution trends, identify high-risk areas requiring
 * immediate intervention, compare ward performance against city averages, and access
 * data-driven policy recommendations. The executive summary provides quick overview for
 * rapid decision-making during emergency situations. Ward comparison enables equitable
 * resource allocation and targeted interventions based on severity and priority rankings.
 */
export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  wards,
  selectedWardId,
  onWardClick,
  onWardHover,
  hoveredWardId,
  timeSeriesData,
  weatherData,
  policyActions,
  loading,
  error,
}) => {
  // Safety checks
  if (!wards || !Array.isArray(wards) || wards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Unable to load ward data. Please try again.</p>
      </div>
    );
  }

  const selectedWard = selectedWardId && wards.length > 0
    ? wards.find(w => w && w.id === selectedWardId) || null
    : null;

  // Get high-risk wards (sorted by priority) with safety checks
  const highRiskWards = [...wards]
    .filter(w => w && typeof w.aqi === 'number' && w.aqi >= 200)
    .sort((a, b) => {
      // Sort by AQI (descending) then by priority (ascending)
      const aqiDiff = (b?.aqi || 0) - (a?.aqi || 0);
      if (aqiDiff !== 0) return aqiDiff;
      return (a?.priority || 0) - (b?.priority || 0);
    });

  // Calculate statistics with safety checks
  const validWards = wards.filter(w => w && typeof w.aqi === 'number');
  const avgAQI = validWards.length > 0
    ? Math.round(validWards.reduce((sum, w) => sum + (w.aqi || 0), 0) / validWards.length)
    : 0;
  const worstWard = validWards.length > 0
    ? validWards.reduce((worst, w) => ((w?.aqi || 0) > (worst?.aqi || 0) ? w : worst), validWards[0])
    : wards[0] || null;
  const bestWard = validWards.length > 0
    ? validWards.reduce((best, w) => ((w?.aqi || 0) < (best?.aqi || 0) ? w : best), validWards[0])
    : wards[0] || null;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Average AQI</p>
          <p className="text-2xl font-bold text-gray-900">{avgAQI}</p>
          <p className="text-xs text-gray-500 mt-1">Across all wards</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-red-600 mb-1">High-Risk Wards</p>
          <p className="text-2xl font-bold text-red-700">{highRiskWards.length}</p>
          <p className="text-xs text-red-600 mt-1">AQI ≥ 200</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-orange-600 mb-1">Worst Ward</p>
          <p className="text-lg font-bold text-orange-700">{worstWard.name}</p>
          <p className="text-xs text-orange-600 mt-1">AQI: {worstWard.aqi}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Best Ward</p>
          <p className="text-lg font-bold text-green-700">{bestWard.name}</p>
          <p className="text-xs text-green-600 mt-1">AQI: {bestWard.aqi}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Map and Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Map Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Interactive Ward Map - Analytical View
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <BarChart3 className="w-4 h-4" />
                <span>Click ward for detailed analysis</span>
              </div>
            </div>
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

          {/* Analytics Section */}
          <AnalyticsInsights
            timeSeriesData={timeSeriesData}
            weatherData={weatherData}
            selectedWardName={selectedWard?.name || null}
          />

          {/* City Average Comparison */}
          <CityAverageComparison
            wards={wards}
            selectedWardId={selectedWardId}
          />

          {/* Ward Comparison Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ward-Wise AQI Comparison
            </h3>
            <div className="space-y-3">
              {wards
                .sort((a, b) => b.aqi - a.aqi)
                .map((ward) => (
                  <div key={ward.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">{ward.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 rounded"
                          style={{
                            width: `${(ward.aqi / 400) * 100}%`,
                            backgroundColor: getAQIColor(ward.category),
                            minWidth: '20px',
                          }}
                        />
                        <span className="text-sm font-bold text-gray-900 w-16 text-right">
                          {ward.aqi}
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: getAQIColor(ward.category) + '20',
                            color: getAQIColor(ward.category),
                          }}
                        >
                          {ward.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column - Intelligence Panel and Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Ward Intelligence Panel */}
          {selectedWard && (
            <div className="h-[600px]">
              <WardIntelligencePanel ward={selectedWard} />
            </div>
          )}

          {/* Policy Recommendations */}
          {selectedWard && policyActions.length > 0 && (
            <PolicyRecommendations actions={policyActions} />
          )}

          {/* Recommended Actions Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Actions
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="font-semibold text-gray-900 mb-1">High Priority:</p>
                <p className="text-gray-700">
                  Focus on {highRiskWards.length > 0 ? highRiskWards[0].name : 'critical wards'} with immediate intervention measures
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="font-semibold text-gray-900 mb-1">Traffic Management:</p>
                <p className="text-gray-700">
                  Implement odd-even scheme in wards with AQI above 250
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-100">
                <p className="font-semibold text-gray-900 mb-1">Construction Control:</p>
                <p className="text-gray-700">
                  Suspend non-essential construction in high-risk areas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Ranking - Full Width */}
      <div className="mt-6">
        <PriorityRanking wards={wards} onWardClick={onWardClick} />
      </div>

      {/* Alert System - Full Width */}
      <div className="mt-6">
        <AlertSystem wards={wards} onWardClick={onWardClick} />
      </div>
    </div>
  );
};


