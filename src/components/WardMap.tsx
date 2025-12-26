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

export const WardMap: React.FC<WardMapProps> = ({
  wards,
  selectedWardId,
  onWardClick,
  onWardHover,
  hoveredWardId,
}) => {
  return (
    <div className="relative w-full h-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />

        {/* City boundary */}
        <rect
          x="5"
          y="5"
          width="590"
          height="390"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Ward boundaries */}
        {wards.map((ward) => {
          const isSelected = selectedWardId === ward.id;
          const isHovered = hoveredWardId === ward.id;
          const color = getAQIColor(ward.category);
          
          return (
            <g key={ward.id}>
              <rect
                x={ward.coordinates.x}
                y={ward.coordinates.y}
                width={ward.coordinates.width}
                height={ward.coordinates.height}
                fill={color}
                fillOpacity={isSelected ? 0.8 : isHovered ? 0.6 : 0.4}
                stroke={isSelected ? '#1e293b' : isHovered ? '#475569' : '#64748b'}
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onWardClick(ward.id)}
                onMouseEnter={() => onWardHover(ward.id)}
                onMouseLeave={() => onWardHover(null)}
              />
              <text
                x={ward.coordinates.x + ward.coordinates.width / 2}
                y={ward.coordinates.y + 15}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#1e293b"
                pointerEvents="none"
              >
                {ward.name.split(' - ')[0]}
              </text>
              <text
                x={ward.coordinates.x + ward.coordinates.width / 2}
                y={ward.coordinates.y + 30}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#111827"
                pointerEvents="none"
              >
                AQI: {ward.aqi}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(450, 320)">
          <text x="0" y="0" fontSize="12" fontWeight="600" fill="#1e293b">
            AQI Categories
          </text>
          {[
            { label: 'Good', color: '#10b981' },
            { label: 'Satisfactory', color: '#84cc16' },
            { label: 'Moderate', color: '#fbbf24' },
            { label: 'Poor', color: '#f97316' },
            { label: 'Very Poor', color: '#ef4444' },
            { label: 'Severe', color: '#991b1b' },
          ].map((item, idx) => (
            <g key={item.label} transform={`translate(0, ${idx * 20 + 20})`}>
              <rect width="16" height="16" fill={item.color} />
              <text x="22" y="12" fontSize="10" fill="#475569">
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredWardId && (() => {
        const ward = wards.find(w => w.id === hoveredWardId);
        if (!ward) return null;
        
        // Convert SVG coordinates to percentage (SVG viewBox is 600x400)
        const xPercent = (ward.coordinates.x / 600) * 100;
        const yPercent = (ward.coordinates.y / 400) * 100;
        
        return (
          <div
            className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 pointer-events-none"
            style={{
              left: `${xPercent}%`,
              top: `${Math.max(2, yPercent - 12)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold text-sm text-gray-900">{ward.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              AQI: <span className="font-bold">{ward.aqi}</span> ({ward.category})
            </div>
          </div>
        );
      })()}
    </div>
  );
};

