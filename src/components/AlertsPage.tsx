import React, { useState } from 'react';
import { AlertTriangle, Filter, Search, X, MapPin } from 'lucide-react';
import { WardData } from '../types';
import { mockWards } from '../data/mockData';
import { getAQIColor } from '../data/mockData';

interface AlertsPageProps {
  onWardClick?: (wardId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onWardClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'severe' | 'very-poor' | 'poor'>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<'all' | 'high-risk' | 'predictive' | 'spike'>('all');

  // Get all alerts with ward information
  const getAllAlerts = () => {
    const alerts: Array<{
      id: string;
      ward: WardData;
      type: 'high-risk' | 'predictive' | 'spike';
      message: string;
      severity: 'severe' | 'very-poor' | 'poor' | 'moderate';
      timestamp: string;
    }> = [];

    mockWards.forEach(ward => {
      // High-risk alerts
      if (ward.aqi >= 300 || ward.alerts.length > 0) {
        ward.alerts.forEach((alert, idx) => {
          alerts.push({
            id: `${ward.id}-alert-${idx}`,
            ward,
            type: 'high-risk',
            message: alert,
            severity: ward.aqi >= 400 ? 'severe' : ward.aqi >= 300 ? 'very-poor' : 'poor',
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          });
        });
      }

      // Predictive warnings
      if (ward.forecast.hours48 > ward.aqi + 20) {
        alerts.push({
          id: `${ward.id}-predictive`,
          ward,
          type: 'predictive',
          message: `AQI expected to spike to ${ward.forecast.hours48} in next 48 hours`,
          severity: ward.forecast.hours48 >= 300 ? 'very-poor' : 'poor',
          timestamp: new Date().toISOString(),
        });
      }

      // Spike detection
      if (ward.aqi > 250 && ward.forecast.hours24 > ward.aqi + 30) {
        alerts.push({
          id: `${ward.id}-spike`,
          ward,
          type: 'spike',
          message: `Rapid AQI increase detected: +${ward.forecast.hours24 - ward.aqi} points expected`,
          severity: ward.aqi >= 300 ? 'severe' : 'very-poor',
          timestamp: new Date().toISOString(),
        });
      }
    });

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const allAlerts = getAllAlerts();

  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = alert.ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || 
                           (severityFilter === 'severe' && alert.severity === 'severe') ||
                           (severityFilter === 'very-poor' && alert.severity === 'very-poor') ||
                           (severityFilter === 'poor' && (alert.severity === 'poor' || alert.severity === 'moderate'));
    
    const matchesType = alertTypeFilter === 'all' || alert.type === alertTypeFilter;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 border-red-300 text-red-900';
      case 'very-poor': return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'poor': return 'bg-amber-100 border-amber-300 text-amber-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getTypeIcon = (type: string) => {
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'high-risk': return 'High Risk';
      case 'predictive': return 'Predictive';
      case 'spike': return 'Spike Detection';
      default: return type;
    }
  };

  const alertCounts = {
    all: allAlerts.length,
    highRisk: allAlerts.filter(a => a.type === 'high-risk').length,
    predictive: allAlerts.filter(a => a.type === 'predictive').length,
    spike: allAlerts.filter(a => a.type === 'spike').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Alert Management Center
            </h2>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage all pollution alerts across wards</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-red-600">{allAlerts.length}</p>
            <p className="text-xs text-gray-600">Total Active Alerts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts or wards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="severe">Severe</option>
            <option value="very-poor">Very Poor</option>
            <option value="poor">Poor & Moderate</option>
          </select>
          <select
            value={alertTypeFilter}
            onChange={(e) => setAlertTypeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="high-risk">High Risk ({alertCounts.highRisk})</option>
            <option value="predictive">Predictive ({alertCounts.predictive})</option>
            <option value="spike">Spike Detection ({alertCounts.spike})</option>
          </select>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-900">{alertCounts.all}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-red-600 mb-1">High Risk</p>
          <p className="text-2xl font-bold text-red-600">{alertCounts.highRisk}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-600 mb-1">Predictive</p>
          <p className="text-2xl font-bold text-amber-600">{alertCounts.predictive}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-orange-600 mb-1">Spike Detection</p>
          <p className="text-2xl font-bold text-orange-600">{alertCounts.spike}</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Active Alerts ({filteredAlerts.length})
        </h3>
        {filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onWardClick?.(alert.ward.id)}
                className={`border rounded-lg p-4 transition-all ${
                  getSeverityColor(alert.severity)
                } ${onWardClick ? 'cursor-pointer hover:shadow-md' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{getTypeLabel(alert.type)}</span>
                        <span className="px-2 py-0.5 bg-white bg-opacity-50 rounded text-xs font-medium">
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs opacity-80">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">{alert.ward.name}</span>
                        </div>
                        <span>AQI: <strong>{alert.ward.aqi}</strong></span>
                        <span>
                          {new Date(alert.timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="px-3 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: getAQIColor(alert.ward.category) + '40',
                        color: getAQIColor(alert.ward.category),
                      }}
                    >
                      {alert.ward.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No alerts match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};









