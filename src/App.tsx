import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigation, ViewType } from './components/Navigation';
import { RoleToggle } from './components/RoleToggle';
import { useRole } from './contexts/RoleContext';
import { api, WardData, TimeSeriesData, WeatherData } from './services/api';
import { getPolicyActions } from './data/mockData';
import { mockWards, mockTimeSeriesData, mockWeatherData } from './data/mockData';

// Lazy load heavy components for faster initial load
const Reports = React.lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const AlertsPage = React.lazy(() => import('./components/AlertsPage').then(m => ({ default: m.AlertsPage })));
const AnalyticsPage = React.lazy(() => import('./components/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const CitizenDashboard = React.lazy(() => import('./components/CitizenDashboard').then(m => ({ default: m.CitizenDashboard })));
const OfficerDashboard = React.lazy(() => import('./components/OfficerDashboard').then(m => ({ default: m.OfficerDashboard })));

function App() {
  const { role } = useRole(); // Get current user role (citizen or officer)
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);
  // Initialize with mock data for instant display, then fetch real data
  const [wards, setWards] = useState<WardData[]>(mockWards as WardData[]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>(mockTimeSeriesData);
  const [weatherData, setWeatherData] = useState<WeatherData>(mockWeatherData);
  const [loading, setLoading] = useState(false); // Start as false since we have mock data
  const [error, setError] = useState<string | null>(null);

  // Memoize selected ward to prevent unnecessary recalculations
  const selectedWard = useMemo(() => {
    if (!selectedWardId || !wards.length) return null;
    return wards.find(w => w.id === selectedWardId) || null;
  }, [selectedWardId, wards]);

  // Memoize policy actions
  const policyActions = useMemo(() => {
    if (!selectedWard) return [];
    try {
      return getPolicyActions(selectedWard as any);
    } catch (err) {
      console.error('Error generating policy actions:', err);
      return [];
    }
  }, [selectedWard]);

  // Memoize alert count
  const alertCount = useMemo(() => {
    if (!wards.length) return 0;
    try {
      return wards.reduce((sum, ward) => {
        const alerts = Array.isArray(ward.alerts) ? ward.alerts.length : 0;
        const forecast = ward.forecast || { hours48: 0 };
        const predictive = (forecast.hours48 > (ward.aqi || 0) + 20) ? 1 : 0;
        return sum + alerts + predictive;
      }, 0);
    } catch (err) {
      console.error('Error calculating alert count:', err);
      return 0;
    }
  }, [wards]);

  // Optimized fetch with timeout and better error handling
  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10s timeout

    const fetchData = async () => {
      try {
        // Only show loading on first fetch
        if (wards.length === 0 || wards === mockWards) {
          setLoading(true);
        }
        setError(null);
        
        // Use Promise.allSettled to handle partial failures gracefully
        const [wardsResult, timeSeriesResult, weatherResult] = await Promise.allSettled([
          api.getWards().catch(() => mockWards as WardData[]),
          api.getTimeSeries(selectedWardId || undefined, 7).catch(() => mockTimeSeriesData),
          api.getWeather(selectedWardId || undefined).catch(() => mockWeatherData),
        ]);
        
        if (cancelled) return;

        // Safely extract results with fallbacks
        const wardsData = wardsResult.status === 'fulfilled' ? wardsResult.value : mockWards as WardData[];
        const timeSeries = timeSeriesResult.status === 'fulfilled' ? timeSeriesResult.value : mockTimeSeriesData;
        const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : mockWeatherData;

        // Validate data before setting state
        if (Array.isArray(wardsData) && wardsData.length > 0) {
          setWards(wardsData);
        } else {
          setWards(mockWards as WardData[]);
        }

        if (Array.isArray(timeSeries)) {
          setTimeSeriesData(timeSeries);
        } else {
          setTimeSeriesData(mockTimeSeriesData);
        }

        if (weather && typeof weather === 'object') {
          setWeatherData(weather);
        } else {
          setWeatherData(mockWeatherData);
        }

        if (wardsResult.status === 'rejected' || timeSeriesResult.status === 'rejected') {
          setError('Using mock data. Backend unavailable.');
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('Error fetching data:', err);
        setError('Failed to load data. Using mock data.');
        // Fallback to mock data
        setWards(mockWards as WardData[]);
        setTimeSeriesData(mockTimeSeriesData);
        setWeatherData(mockWeatherData);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [selectedWardId]);

  // Debounced time series update when ward selection changes
  useEffect(() => {
    if (!selectedWardId) {
      setTimeSeriesData(mockTimeSeriesData);
      return;
    }

    const timeoutId = setTimeout(() => {
      api.getTimeSeries(selectedWardId, 7)
        .then(data => {
          if (Array.isArray(data)) {
            setTimeSeriesData(data);
          } else {
            setTimeSeriesData(mockTimeSeriesData);
          }
        })
        .catch(() => setTimeSeriesData(mockTimeSeriesData));
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [selectedWardId]);

  // Memoized callback to prevent unnecessary re-renders
  const handleWardClick = useCallback((wardId: string) => {
    if (!wardId) return;
    setSelectedWardId(wardId);
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
  }, [currentView]);

  /**
   * Render content based on current view and user role
   * Citizen and Officer see different dashboards and have different menu options
   */
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        // Show different dashboard based on role
        if (role === 'citizen') {
          return (
            <React.Suspense fallback={<div className="text-center py-12 text-gray-500">Loading dashboard...</div>}>
              <CitizenDashboard
                wards={wards}
                selectedWardId={selectedWardId}
                onWardClick={handleWardClick}
                onWardHover={setHoveredWardId}
                hoveredWardId={hoveredWardId}
                loading={loading}
                error={error}
              />
            </React.Suspense>
          );
        } else {
          // Officer dashboard
          return (
            <React.Suspense fallback={<div className="text-center py-12 text-gray-500">Loading dashboard...</div>}>
              <OfficerDashboard
                wards={wards}
                selectedWardId={selectedWardId}
                onWardClick={handleWardClick}
                onWardHover={setHoveredWardId}
                hoveredWardId={hoveredWardId}
                timeSeriesData={timeSeriesData}
                weatherData={weatherData}
                policyActions={policyActions}
                loading={loading}
                error={error}
              />
            </React.Suspense>
          );
        }
      case 'alerts':
        return (
          <React.Suspense fallback={<div className="text-center py-12 text-gray-500">Loading alerts...</div>}>
            <AlertsPage onWardClick={handleWardClick} />
          </React.Suspense>
        );
      case 'analytics':
        // Analytics page only visible to officers
        if (role === 'officer') {
          return (
            <React.Suspense fallback={<div className="text-center py-12 text-gray-500">Loading analytics...</div>}>
              <AnalyticsPage />
            </React.Suspense>
          );
        }
        return <div className="text-center py-12 text-gray-500">This page is only available to officers.</div>;
      case 'reports':
        // Reports page only visible to officers
        if (role === 'officer') {
          return (
            <React.Suspense fallback={<div className="text-center py-12 text-gray-500">Loading reports...</div>}>
              <Reports />
            </React.Suspense>
          );
        }
        return <div className="text-center py-12 text-gray-500">This page is only available to officers.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ward-Wise Pollution Action Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                NCT Delhi • Real-time Air Quality Intelligence
                {role === 'officer' && <span className="ml-2 text-blue-600">• Officer View</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Role Toggle - Frontend-only, no authentication */}
              <RoleToggle />
              <div className="text-right">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date().toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        alertCount={alertCount}
      />

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Municipal Corporation • Environmental Monitoring Authority • Data for Policy Decision Making
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

