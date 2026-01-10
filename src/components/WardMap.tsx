import React from 'react';
import { WardData } from '../types';
import { getAQIColor } from '../data/mockData';

interface WardMapProps {
  wards: WardData[];
  selectedWardId: string | null;
  onWardClick: (wardId: string) => void;
  onWardHover: (wardId: string | null) => void;
  hoveredWardId: string | null;
}

/**
 * Interactive Ward Map Component
 * 
 * GOVERNANCE RELEVANCE:
 * Geographic visualization of pollution data is essential for spatial understanding
 * of environmental challenges. This map enables:
 * - Visual identification of pollution hotspots requiring intervention
 * - Spatial correlation analysis (e.g., industrial areas, traffic corridors)
 * - Citizen engagement through intuitive geographic interface
 * - Evidence-based policy targeting specific geographic areas
 * 
 * Color-coded wards provide immediate visual feedback on air quality severity,
 * supporting both citizen awareness and officer decision-making for targeted
 * pollution control measures in specific geographic regions.
 */
export const WardMap: React.FC<WardMapProps> = ({
  wards,
  selectedWardId,
  onWardClick,
  onWardHover,
  hoveredWardId,
}) => {
  // Safety checks
  if (!wards || !Array.isArray(wards) || wards.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-500 text-sm">No ward data available</p>
      </div>
    );
  }
  const [tooltipWard, setTooltipWard] = React.useState<WardData | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleWardClick = (ward: WardData) => {
    onWardClick(ward.id);
  };

  const handleWardMouseOver = (ward: WardData, event: React.MouseEvent<SVGPathElement>) => {
    onWardHover(ward.id);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
      });
      setTooltipWard(ward);
    }
  };

  const handleWardMouseOut = () => {
    onWardHover(null);
    setTooltipWard(null);
    setTooltipPosition(null);
  };

  // Calculate viewBox to fit all wards
  const viewBox = "0 0 700 450";

  return (
    <div ref={containerRef} className="relative w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render ward paths */}
        {wards.filter(ward => ward && ward.coordinates).map((ward) => {
          if (!ward || !ward.id) return null;
          
          const isSelected = selectedWardId === ward.id;
          const isHovered = hoveredWardId === ward.id;
          const color = getAQIColor(ward.category || 'Moderate');
          
          // Get SVG path from coordinates
          const path = 'path' in ward.coordinates ? ward.coordinates.path : '';
          const centerX = 'centerX' in ward.coordinates ? ward.coordinates.centerX : null;
          const centerY = 'centerY' in ward.coordinates ? ward.coordinates.centerY : null;
          
          if (!path) return null;

          return (
            <g key={ward.id}>
              <path
                d={path}
                fill={color}
                fillOpacity={isSelected ? 0.7 : isHovered ? 0.6 : 0.4}
                stroke={isSelected ? '#1e293b' : isHovered ? '#475569' : '#64748b'}
                strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                strokeOpacity={0.8}
                cursor="pointer"
                onClick={() => handleWardClick(ward)}
                onMouseOver={(e) => handleWardMouseOver(ward, e)}
                onMouseOut={handleWardMouseOut}
                className="transition-all duration-200"
              />
              {/* Ward name label */}
              {centerX !== null && centerY !== null && ward.name && (
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: '11px',
                    fontWeight: isSelected ? '700' : '600',
                    fill: isSelected ? '#1e293b' : '#374151',
                    textShadow: '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {ward.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltipWard && tooltipPosition && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 whitespace-nowrap">
            <h3 className="font-bold text-sm text-gray-900 mb-1">{tooltipWard.name}</h3>
            <p className="text-xs text-gray-600">
              AQI: <span className="font-bold">{tooltipWard.aqi}</span> ({tooltipWard.category})
            </p>
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10">
        <h3 className="text-sm font-bold text-gray-900 mb-3">AQI Categories</h3>
        <div className="space-y-2">
          {[
            { label: 'Good', color: '#10b981' },
            { label: 'Satisfactory', color: '#84cc16' },
            { label: 'Moderate', color: '#fbbf24' },
            { label: 'Poor', color: '#f97316' },
            { label: 'Very Poor', color: '#ef4444' },
            { label: 'Severe', color: '#991b1b' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
