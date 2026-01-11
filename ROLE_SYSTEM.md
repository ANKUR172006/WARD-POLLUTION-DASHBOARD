# Role-Based UI System

## Overview

The Ward Pollution Dashboard now supports two user roles with different interfaces:

1. **Citizen** - Simplified, health-focused view for general public
2. **Officer** - Analytical, detailed view for government/municipal officers

## Implementation Details

### Architecture

- **RoleContext** (`src/contexts/RoleContext.tsx`) - Manages current user role (frontend-only, no authentication)
- **RoleToggle** (`src/components/RoleToggle.tsx`) - UI component for switching between roles
- **CitizenDashboard** (`src/components/CitizenDashboard.tsx`) - Simplified citizen view
- **OfficerDashboard** (`src/components/OfficerDashboard.tsx`) - Full analytical officer view

### Key Features

#### Citizen View
- ✅ Simplified air quality map
- ✅ Health advisories and recommendations
- ✅ Simplified pollution levels (Good/Moderate/Poor)
- ✅ High-risk ward alerts
- ✅ Basic ward information
- ❌ No advanced analytics
- ❌ No comparison charts
- ❌ No detailed trend analysis

**Navigation Menu:**
- Dashboard
- Alerts

#### Officer View
- ✅ Full interactive ward map
- ✅ Detailed analytics and trends
- ✅ Ward comparison charts
- ✅ Policy recommendations
- ✅ Advanced intelligence panel
- ✅ High-risk ward prioritization
- ✅ Executive summary statistics
- ✅ Recommended actions panel

**Navigation Menu:**
- Dashboard
- Alerts
- Analytics
- Reports

### Role Switching

Users can switch roles at any time using the toggle button in the header. The role is stored in React state (no persistence across page reloads - intentional for hackathon prototype).

### Code Structure

```
src/
├── contexts/
│   └── RoleContext.tsx          # Role state management
├── components/
│   ├── RoleToggle.tsx           # Role switcher UI
│   ├── CitizenDashboard.tsx     # Citizen view
│   ├── OfficerDashboard.tsx     # Officer view
│   └── Navigation.tsx           # Role-aware navigation
└── App.tsx                      # Main app with role-based rendering
```

### How It Works

1. **Role Selection**: User clicks Citizen/Officer toggle in header
2. **State Update**: `RoleContext` updates the current role
3. **UI Re-render**: App conditionally renders `CitizenDashboard` or `OfficerDashboard`
4. **Navigation Update**: Navigation menu shows/hides items based on role
5. **Content Filtering**: Different components show/hide based on role permissions

### Example Usage

```tsx
// In any component
import { useRole } from '../contexts/RoleContext';

function MyComponent() {
  const { role, setRole } = useRole();
  
  if (role === 'citizen') {
    // Show citizen-specific content
  } else {
    // Show officer-specific content
  }
}
```

### Design Decisions

1. **No Authentication**: Frontend-only role switching for hackathon demo
2. **No Persistence**: Role resets on page reload (intentional)
3. **Progressive Enhancement**: All features work; just different visibility
4. **Clear Separation**: Separate dashboard components for maintainability

### Future Enhancements (Post-Hackathon)

- Add authentication and backend role management
- Persist role preference in localStorage
- Add role-based API permissions
- Add more granular permission levels
- Add role-specific data filtering

## Presentation Notes

For your hackathon presentation:

1. **Start as Citizen**: Show simplified, user-friendly interface
2. **Switch to Officer**: Demonstrate analytical capabilities
3. **Highlight Differences**: Point out what citizens see vs officers
4. **Emphasize**: No login required - just a toggle (for demo purposes)









