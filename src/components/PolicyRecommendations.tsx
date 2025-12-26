import React from 'react';
import { PolicyAction } from '../types';
import { Car, Building2, Wind, Shield, Heart } from 'lucide-react';

interface PolicyRecommendationsProps {
  actions: PolicyAction[];
}

const iconMap = {
  traffic: Car,
  construction: Building2,
  sweeping: Wind,
  enforcement: Shield,
  health: Heart,
};

const priorityColors = {
  high: 'bg-red-50 border-red-300 text-red-900',
  medium: 'bg-amber-50 border-amber-300 text-amber-900',
  low: 'bg-blue-50 border-blue-300 text-blue-900',
};

export const PolicyRecommendations: React.FC<PolicyRecommendationsProps> = ({ actions }) => {
  if (actions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Action & Policy Recommendations
        </h3>
        <p className="text-sm text-gray-500">No immediate actions required</p>
      </div>
    );
  }

  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Action & Policy Recommendations
      </h3>

      <div className="space-y-3">
        {sortedActions.map((action) => {
          const Icon = iconMap[action.type] ?? Shield;

          return (
            <div
              key={action.id}
              className={`border rounded-lg p-4 ${priorityColors[action.priority]}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{action.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        action.priority === 'high'
                          ? 'bg-red-200 text-red-800'
                          : action.priority === 'medium'
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {action.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs mb-2 opacity-90">{action.description}</p>

                  <p className="text-xs font-medium opacity-80">
                    <span className="font-semibold">Expected Impact:</span>{' '}
                    {action.estimatedImpact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

