import React from 'react';
import { LayoutDashboard, FileText, Bell, BarChart3, Home, Info } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

export type ViewType = 'dashboard' | 'reports' | 'alerts' | 'analytics';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  alertCount: number;
}

/**
 * Navigation Component - Shows different menu items based on user role
 * Citizen: Simplified menu (Dashboard, Alerts, Info)
 * Officer: Full menu (Dashboard, Alerts, Analytics, Reports)
 */
export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, alertCount }) => {
  const { role } = useRole();

  // Different navigation items for different roles
  const citizenNavItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: Home },
    { id: 'alerts' as ViewType, label: 'Alerts', icon: Bell, badge: alertCount },
  ];

  const officerNavItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: Home },
    { id: 'alerts' as ViewType, label: 'Alerts', icon: Bell, badge: alertCount },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
    { id: 'reports' as ViewType, label: 'Reports', icon: FileText },
  ];

  const navItems = role === 'citizen' ? citizenNavItems : officerNavItems;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

