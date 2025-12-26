import React, { useState } from 'react';
import { WardMap } from './components/WardMap';
import { WardIntelligencePanel } from './components/WardIntelligencePanel';
import { PolicyRecommendations } from './components/PolicyRecommendations';
import { AnalyticsInsights } from './components/AnalyticsInsights';
import { AlertSystem } from './components/AlertSystem';
import { Navigation, ViewType } from './components/Navigation';
import { Reports } from './components/Reports';
import { AlertsPage } from './components/AlertsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { mockWards, mockTimeSeriesData, mockWeatherData, getPolicyActions } from './data/mockData';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [hoveredWardId, setHoveredWardId] = useState<string | null>(null);

  const selectedWard = selectedWardId
    ? mockWards.find(w => w.id === selectedWardId) || null
    : null;

  const policyActions = selectedWard ? getPolicyActions(selectedWard) : [];

  // Calculate alert count
  const alertCount = mockWards.reduce((sum, ward) => {
    return sum + ward.alerts.length + (ward.forecast.hours48 > ward.aqi + 20 ? 1 : 0);
  }, 0);

  const handleWardClick = (wardId: string) => {
    setSelectedWardId(wardId);
    // Switch to dashboard view when clicking on a ward from alerts
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Map and Analytics */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Map Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Interactive City Map - Ward Distribution
                  </h2>
                  <div className="h-[500px]">
                    <WardMap
                      wards={mockWards}
                      selectedWardId={selectedWardId}
                      onWardClick={setSelectedWardId}
                      onWardHover={setHoveredWardId}
                      hoveredWardId={hoveredWardId}
                    />
                  </div>
                </div>

                {/* Analytics Section */}
                <AnalyticsInsights
                  timeSeriesData={mockTimeSeriesData}
                  weatherData={mockWeatherData}
                  selectedWardName={selectedWard?.name || null}
                />
              </div>

              {/* Right Column - Intelligence Panel and Actions */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Ward Intelligence Panel */}
                <div className="h-[600px]">
                  <WardIntelligencePanel ward={selectedWard} />
                </div>

                {/* Policy Recommendations */}
                <PolicyRecommendations actions={policyActions} />
              </div>
            </div>

            {/* Alert System - Full Width */}
            <div className="mt-6">
              <AlertSystem wards={mockWards} onWardClick={handleWardClick} />
            </div>
          </>
        );
      case 'alerts':
        return <AlertsPage onWardClick={handleWardClick} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <Reports />;
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
                Indian Metropolitan City • Real-time Air Quality Intelligence
              </p>
            </div>
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

