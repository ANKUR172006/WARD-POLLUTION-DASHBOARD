import React from 'react';
import { WardData } from '../types';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { getAQIColor } from '../data/mockData';

interface AlertSystemProps {
  wards: WardData[];
  onWardClick?: (wardId: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ wards, onWardClick }) => {
  const highRiskWards = wards
    .filter(w => w.aqi >= 300 || w.alerts.length > 0)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  const topPolluted = [...wards]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 5);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Alert & Early-Warning System</h3>

      {/* High-Risk Wards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">High-Risk Ward Alerts</h4>
        </div>
        {highRiskWards.length > 0 ? (
          <div className="space-y-2">
            {highRiskWards.map((ward) => (
              <div
                key={ward.id}
                onClick={() => onWardClick?.(ward.id)}
                className={`bg-red-50 border border-red-200 rounded-lg p-3 ${
                  onWardClick ? 'cursor-pointer hover:bg-red-100 transition-colors' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">{ward.name}</span>
                  <span
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{
                      backgroundColor: getAQIColor(ward.category) + '20',
                      color: getAQIColor(ward.category),
                    }}
                  >
                    AQI: {ward.aqi}
                  </span>
                </div>
                {ward.alerts.length > 0 && (
                  <ul className="text-xs text-red-800 mt-1 space-y-0.5">
                    {ward.alerts.map((alert, idx) => (
                      <li key={idx}>• {alert}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No high-risk alerts at this time</p>
        )}
      </div>

      {/* Priority Ranking */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h4 className="text-sm font-semibold text-gray-700">Priority Ranking - Most Polluted Wards</h4>
        </div>
        <div className="space-y-2">
          {topPolluted.map((ward, idx) => (
            <div
              key={ward.id}
              onClick={() => onWardClick?.(ward.id)}
              className={`flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 ${
                onWardClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ backgroundColor: getAQIColor(ward.category) }}
                >
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{ward.name}</p>
                  <p className="text-xs text-gray-600">{ward.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">AQI: {ward.aqi}</p>
                <p className="text-xs text-gray-600">Priority: {ward.priority}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Warnings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-700">Predictive Warnings</h4>
        </div>
        <div className="space-y-2">
          {wards
            .filter(w => w.forecast.hours48 > w.aqi + 20)
            .slice(0, 3)
            .map((ward) => (
              <div
                key={ward.id}
                onClick={() => onWardClick?.(ward.id)}
                className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${
                  onWardClick ? 'cursor-pointer hover:bg-amber-100 transition-colors' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">{ward.name}</span>
                  <span className="text-xs text-amber-800 font-medium">
                    Expected spike: +{ward.forecast.hours48 - ward.aqi} AQI
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  AQI expected to reach {ward.forecast.hours48} in next 48 hours
                </p>
              </div>
            ))}
        </div>
        {wards.filter(w => w.forecast.hours48 > w.aqi + 20).length === 0 && (
          <p className="text-xs text-gray-500">No significant spikes predicted in next 48 hours</p>
        )}
      </div>
    </div>
  );
};


