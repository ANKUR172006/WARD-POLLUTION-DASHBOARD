import React from 'react';
import { User, Shield } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

/**
 * Role Toggle Component
 * Allows switching between Citizen and Officer views (frontend-only, no authentication)
 */
export const RoleToggle: React.FC = () => {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setRole('citizen')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${role === 'citizen'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
        title="Switch to Citizen View"
      >
        <User className="w-4 h-4" />
        <span>Citizen</span>
      </button>
      <button
        onClick={() => setRole('officer')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${role === 'officer'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
        title="Switch to Officer View"
      >
        <Shield className="w-4 h-4" />
        <span>Officer</span>
      </button>
    </div>
  );
};





