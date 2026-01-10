import React from 'react';
import { WardData } from '../types';
import { getAQIColor } from '../data/mockData';
import { Award, TrendingUp, AlertCircle } from 'lucide-react';

interface PriorityRankingProps {
  wards: WardData[];
  onWardClick?: (wardId: string) => void;
}

/**
 * Priority Ranking Component
 * 
 * GOVERNANCE RELEVANCE:
 * Priority ranking enables evidence-based resource allocation and targeted interventions.
 * By ranking wards based on AQI severity and priority scores, government officials can:
 * - Direct emergency response teams to most critical areas first
 * - Allocate pollution control resources efficiently
 * - Track improvement progress over time
 * - Make data-driven decisions on where to implement policy interventions
 * 
 * This ranking considers both current AQI levels and priority scores to ensure
 * urgent areas receive attention first, supporting equitable environmental governance.
 */
export const PriorityRanking: React.FC<PriorityRankingProps> = ({
  wards,
  onWardClick,
}) => {
  // Rank wards by priority and AQI (lower priority number = higher priority)
  // Sort by AQI first (descending), then by priority (ascending)
  const rankedWards = [...wards]
    .sort((a, b) => {
      // Primary sort: by AQI (descending) - worst AQI first
      if (b.aqi !== a.aqi) {
        return b.aqi - a.aqi;
      }
      // Secondary sort: by priority (ascending) - lower priority number = higher priority
      return a.priority - b.priority;
    })
    .map((ward, index) => ({
      ...ward,
      rank: index + 1,
    }));

  // Get top 5 most critical wards
  const topCritical = rankedWards.slice(0, 5);

  // Categorize wards by urgency
  const criticalWards = rankedWards.filter(w => w.aqi >= 300);
  const highPriorityWards = rankedWards.filter(w => w.aqi >= 200 && w.aqi < 300);
  const moderateWards = rankedWards.filter(w => w.aqi >= 100 && w.aqi < 200);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Ward Priority Ranking
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Critical ({criticalWards.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High ({highPriorityWards.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderate ({moderateWards.length})</span>
          </div>
        </div>
      </div>

      {/* Top 5 Critical Wards */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          Top 5 Priority Wards Requiring Immediate Action
        </h4>
        <div className="space-y-3">
          {topCritical.map((ward) => {
            const isCritical = ward.aqi >= 300;
            const isHigh = ward.aqi >= 200 && ward.aqi < 300;
            
            return (
              <div
                key={ward.id}
                onClick={() => onWardClick?.(ward.id)}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                  ${isCritical 
                    ? 'bg-red-50 border-red-300' 
                    : isHigh 
                    ? 'bg-orange-50 border-orange-300' 
                    : 'bg-yellow-50 border-yellow-300'
                  }
                  ${onWardClick ? 'cursor-pointer hover:shadow-md' : ''}
                `}
              >
                {/* Rank Badge */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ 
                    backgroundColor: isCritical ? '#dc2626' : isHigh ? '#f97316' : '#eab308'
                  }}
                >
                  {ward.rank}
                </div>

                {/* Ward Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{ward.name}</span>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: getAQIColor(ward.category) + '20',
                        color: getAQIColor(ward.category),
                      }}
                    >
                      {ward.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>AQI: <strong className="text-gray-900">{ward.aqi}</strong></span>
                    <span>Priority Score: <strong className="text-gray-900">{ward.priority}</strong></span>
                    {ward.alerts.length > 0 && (
                      <span className="text-red-600">⚠️ {ward.alerts.length} alert(s)</span>
                    )}
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="text-right flex-shrink-0">
                  {ward.forecast.hours48 > ward.aqi + 20 ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Worsening</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Stable</div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    48h: {ward.forecast.hours48}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Ranking Table */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Complete Priority Ranking</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ward</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">AQI</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">48h Forecast</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {rankedWards.map((ward) => (
                <tr
                  key={ward.id}
                  onClick={() => onWardClick?.(ward.id)}
                  className={`
                    border-b border-gray-100 hover:bg-gray-50 transition-colors
                    ${ward.aqi >= 300 ? 'bg-red-50/50' : ward.aqi >= 200 ? 'bg-orange-50/50' : ''}
                    ${onWardClick ? 'cursor-pointer' : ''}
                  `}
                >
                  <td className="py-3 px-4">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ 
                        backgroundColor: ward.rank <= 3 
                          ? '#dc2626' 
                          : ward.rank <= 5 
                          ? '#f97316' 
                          : '#6b7280'
                      }}
                    >
                      {ward.rank}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{ward.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: getAQIColor(ward.category) + '20',
                        color: getAQIColor(ward.category),
                      }}
                    >
                      {ward.aqi}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{ward.category}</td>
                  <td className="py-3 px-4 text-gray-700">{ward.priority}</td>
                  <td className="py-3 px-4 text-gray-700">{ward.forecast.hours48}</td>
                  <td className="py-3 px-4">
                    {ward.alerts.length > 0 ? (
                      <span className="text-red-600 font-medium">{ward.alerts.length}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Resource Allocation Insight</p>
            <p className="text-sm text-blue-800">
              {criticalWards.length} ward(s) require immediate intervention (AQI ≥ 300). 
              Prioritize deployment of emergency measures, enhanced monitoring, and rapid response teams 
              to these top-ranked areas. The priority ranking helps ensure equitable distribution of 
              resources based on severity and urgency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};




