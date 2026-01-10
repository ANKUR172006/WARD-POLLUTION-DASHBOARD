# Ward-Wise Pollution Action Dashboard

A high-impact GovTech web dashboard for Indian metropolitan cities to transform raw air-quality data into ward-level actionable intelligence for policy intervention and public awareness.

## Features

### ✅ Core Features (All Implemented)

- **✅ Ward-Level Pollution Visualization**: Interactive map with color-coded wards showing real-time AQI data
- **✅ Interactive AQI Map**: Clickable ward map with hover tooltips, ward names, and visual AQI representation
- **✅ Citizen vs Officer Role Toggle**: Frontend-only role switcher (no authentication required for prototype)
- **✅ Separate Dashboards**:
  - **Citizen Dashboard**: Simplified, health-focused view with health advisories
  - **Officer Dashboard**: Full analytical view with detailed metrics and comparisons
- **✅ High-Risk Ward Identification**: Automatic identification of wards with AQI ≥ 200/300 (threshold-based)
- **✅ Ward Comparison View**: Side-by-side comparison charts and tables for all wards
- **✅ Time Filter**: Day/Week/Month filter for historical trend analysis (Analytics page)
- **✅ Ward-Specific Recommendations**: Rule-based policy recommendations generated per ward
- **✅ City Average vs Ward Comparison**: Dedicated component comparing individual wards against city-wide averages
- **✅ Citizen Health Advisory Panel**: Context-aware health recommendations based on AQI category
- **✅ Alert Banner for Poor Air Quality**: Prominent alerts for high-risk wards and poor air quality conditions
- **✅ Officer Analytics Panel**: Comprehensive analytics with source attribution, trends, and forecasts
- **✅ Priority Ranking of Wards**: Ranked list of wards by severity and priority score
- **✅ Mock Export/Download Report**: CSV export and PDF download (prototype) functionality
- **✅ Governance-Relevant Comments**: Inline comments explaining governance relevance throughout codebase

### Prototype Notes

Some features are implemented as prototypes with mock/static data:
- **Report Export**: CSV export works; PDF shows mock alert (requires jsPDF library for production)
- **Time Series Data**: Uses mock data that can be replaced with API integration
- **Role System**: Frontend-only toggle (no authentication/backend required for hackathon demo)

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Google Maps API** for interactive mapping

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database
- **RESTful API** architecture

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ (for backend)
- Google Maps API Key (get from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)) - Optional

### Installation

#### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file (optional - for Google Maps)
cp .env.example .env
# Edit .env and add: VITE_API_URL=http://localhost:3001/api
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Create PostgreSQL database
createdb ward_pollution_db
# Or using psql: CREATE DATABASE ward_pollution_db;

# Run database migration
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Start backend server (in development mode)
npm run dev
```

The backend will run on `http://localhost:3001`

#### 3. Start Frontend

In a new terminal (from project root):

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

**Note**: The frontend will automatically use the backend API if available. If the backend is not running, it will fallback to mock data.

### Build for Production

```bash
npm run build
```

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)
6. Add the key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

**Note**: For development, you can use the API key directly in `index.html`, but for production, use environment variables.

## Design Philosophy

- **Government-grade UI**: Minimalist, data-centric, professional
- **White background** with muted color palette
- **Clear typography** with strong visual hierarchy
- **Policy-ready**: Suitable for official government review

## Project Structure

```
├── backend/              # Backend API server
│   ├── src/
│   │   ├── db/          # Database schema, migrations, and seeding
│   │   ├── routes/      # API route handlers
│   │   └── server.ts    # Express server setup
│   └── package.json
│
├── src/                 # Frontend React application
│   ├── components/      # React components
│   │   ├── WardMap.tsx
│   │   ├── WardIntelligencePanel.tsx
│   │   ├── PolicyRecommendations.tsx
│   │   ├── AnalyticsInsights.tsx
│   │   ├── AlertSystem.tsx
│   │   └── ...
│   ├── services/        # API service layer
│   │   └── api.ts       # API client
│   ├── data/           # Mock data (fallback)
│   │   └── mockData.ts
│   ├── types.ts        # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
│
└── README.md
```

## Backend API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation, database schema, and backend-specific setup instructions.

### Available API Endpoints

- `GET /api/wards` - Get all wards with latest AQI data
- `GET /api/wards/:id` - Get single ward details
- `GET /api/analytics/timeseries` - Get time series data
- `GET /api/analytics/trends` - Get pollution trends
- `GET /api/alerts` - Get all active alerts
- `GET /api/weather` - Get weather data

## Database

The application uses PostgreSQL to store:
- Ward master data (8 wards for Delhi)
- Historical AQI readings
- Pollution source attribution
- Forecasts (24h and 48h)
- Alerts and notifications
- Time series data
- Weather data

### Wards in System

1. **W001** - New Delhi - Lutyens Zone
2. **W002** - Central Delhi - Old Delhi
3. **W003** - North Delhi
4. **W004** - East Delhi
5. **W005** - South Delhi
6. **W006** - West Delhi
7. **W007** - North East Delhi
8. **W008** - South West Delhi

## Feature Implementation Checklist

All required features for the hackathon have been implemented:

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| Ward-level pollution visualization | ✅ | `WardMap.tsx` | Interactive SVG map with color coding |
| Interactive AQI map | ✅ | `WardMap.tsx` | Click/hover interactions, ward labels |
| Citizen vs Officer role toggle | ✅ | `RoleToggle.tsx`, `RoleContext.tsx` | Frontend-only, no auth |
| Separate dashboards | ✅ | `CitizenDashboard.tsx`, `OfficerDashboard.tsx` | Distinct UI for each role |
| High-risk ward identification | ✅ | `CitizenDashboard.tsx`, `AlertSystem.tsx` | AQI threshold ≥ 200 |
| Ward comparison view | ✅ | `Reports.tsx`, `OfficerDashboard.tsx` | Charts and comparison tables |
| Time filter (day/week/month) | ✅ | `AnalyticsPage.tsx` | Dropdown filter for time periods |
| Ward-specific recommendations | ✅ | `PolicyRecommendations.tsx`, `mockData.ts` | Rule-based action generation |
| City average vs ward comparison | ✅ | `CityAverageComparison.tsx` | Dedicated comparison component |
| Citizen health advisory panel | ✅ | `CitizenDashboard.tsx` | Context-aware health messages |
| Alert banner for poor air quality | ✅ | `CitizenDashboard.tsx`, `AlertSystem.tsx` | Prominent alerts |
| Officer analytics panel | ✅ | `AnalyticsPage.tsx`, `OfficerDashboard.tsx` | Comprehensive analytics |
| Priority ranking of wards | ✅ | `PriorityRanking.tsx`, `AlertSystem.tsx` | Ranked by AQI and priority |
| Mock export/download report | ✅ | `Reports.tsx` | CSV export works, PDF is mock |
| Governance relevance comments | ✅ | All components | Inline comments explaining purpose |

## Governance & Policy Impact

This dashboard supports evidence-based environmental governance through:

1. **Transparency**: Public access to real-time pollution data promotes accountability
2. **Targeted Interventions**: Priority ranking enables efficient resource allocation
3. **Citizen Engagement**: Accessible interface empowers public participation
4. **Data-Driven Policy**: Analytics support evidence-based decision making
5. **Proactive Governance**: Early warning systems enable preemptive action

## License

This project is designed for government use and policy decision-making.
