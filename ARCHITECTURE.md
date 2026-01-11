# System Architecture

## Overview

The Ward-Wise Pollution Action Dashboard is a full-stack application consisting of a React frontend and a Node.js/Express backend with PostgreSQL database. The system is designed to provide real-time air quality monitoring and actionable insights for policy intervention at the ward level.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite                         │  │
│  │  - Interactive Ward Map (SVG)                         │  │
│  │  - Ward Intelligence Panel                            │  │
│  │  - Analytics Dashboard                                │  │
│  │  - Alert Management                                   │  │
│  │  - Policy Recommendations                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                        ↕ HTTP/REST                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ API Calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                              │  │
│  │  - RESTful API Endpoints                              │  │
│  │  - Data Aggregation                                   │  │
│  │  - Business Logic                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                        ↕ SQL                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  - wards (master data)                                │  │
│  │  - aqi_data (time-series readings)                    │  │
│  │  - pollution_sources (attribution)                    │  │
│  │  - forecasts (24h/48h predictions)                    │  │
│  │  - alerts (active notifications)                      │  │
│  │  - time_series_data (daily aggregates)                │  │
│  │  - weather_data (meteorological data)                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Frontend Layer

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Recharts for data visualization
- React Hooks for state management

**Key Components:**
1. **App.tsx** - Main application container with routing and state management
2. **WardMap.tsx** - SVG-based interactive map showing all 8 wards
3. **WardIntelligencePanel.tsx** - Detailed ward-specific information
4. **AnalyticsInsights.tsx** - Time-series charts and trends
5. **AlertSystem.tsx** - Real-time alert notifications
6. **PolicyRecommendations.tsx** - AI-generated mitigation actions

**Data Flow:**
- Fetches data from backend API via `src/services/api.ts`
- Falls back to mock data if API unavailable
- Auto-refreshes every 5 minutes
- Updates time-series when ward selection changes

### Backend Layer

**Technology Stack:**
- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL client (pg)
- CORS enabled for frontend integration

**API Routes:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wards` | GET | Get all wards with latest AQI |
| `/api/wards/:id` | GET | Get single ward details |
| `/api/wards/:id/aqi` | POST | Update ward AQI data |
| `/api/analytics/timeseries` | GET | Get historical time-series data |
| `/api/analytics/trends` | GET | Get pollution trends |
| `/api/analytics/sources` | GET | Get pollution source attribution |
| `/api/alerts` | GET | Get all active alerts |
| `/api/alerts` | POST | Create new alert |
| `/api/alerts/:id/resolve` | PATCH | Resolve an alert |
| `/api/weather` | GET | Get current weather data |
| `/api/weather` | POST | Update weather data |

**Architecture Patterns:**
- RESTful API design
- Separation of concerns (routes, database, business logic)
- Error handling middleware
- Connection pooling for database

### Database Layer

**Database:** PostgreSQL 14+

**Schema Design:**

```
wards (Master Table)
├── id (PK)
├── name
├── coordinates_path (SVG path)
├── center_x, center_y
└── timestamps

aqi_data (Time-Series)
├── id (PK)
├── ward_id (FK)
├── aqi, category
├── pm25, pm10, no2, so2, co
└── recorded_at

pollution_sources
├── id (PK)
├── ward_id (FK)
├── vehicular, construction, industrial, waste_burning
└── recorded_at

forecasts
├── id (PK)
├── ward_id (FK)
├── hours_24, hours_48
└── forecast_date

alerts
├── id (PK)
├── ward_id (FK)
├── message, priority, type
├── is_active
└── timestamps

time_series_data
├── id (PK)
├── ward_id (FK)
├── date
├── aqi, pm25, pm10
└── recorded_at

weather_data
├── id (PK)
├── ward_id (FK)
├── wind_speed, temperature, humidity
└── recorded_at
```

**Indexes:**
- Primary keys on all tables
- Foreign key indexes on `ward_id`
- Composite indexes on (ward_id, recorded_at) for efficient queries
- Unique constraint on (ward_id, date) for time_series_data

**Wards in System:**
1. **W001** - New Delhi - Lutyens Zone
2. **W002** - Central Delhi - Old Delhi
3. **W003** - North Delhi
4. **W004** - East Delhi
5. **W005** - South Delhi
6. **W006** - West Delhi
7. **W007** - North East Delhi
8. **W008** - South West Delhi

## Data Flow

### Reading Data Flow

1. **User Interaction** → Frontend component triggers data fetch
2. **API Request** → `api.ts` service makes HTTP request to backend
3. **Backend Route** → Express route handler receives request
4. **Database Query** → PostgreSQL query executed with optimized joins
5. **Data Transformation** → Backend formats data for frontend consumption
6. **Response** → JSON response sent to frontend
7. **State Update** → React component updates state with new data
8. **UI Render** → Component re-renders with updated data

### Writing Data Flow

1. **User Action** → User updates AQI data or creates alert
2. **API Request** → Frontend sends POST/PATCH request
3. **Validation** → Backend validates request payload
4. **Database Insert** → New record inserted into database
5. **Response** → Success/error response sent to frontend
6. **UI Feedback** → Frontend shows success/error message

## Performance Optimizations

1. **Database:**
   - Indexed queries for fast lookups
   - Connection pooling (max 20 connections)
   - Efficient JOIN queries using LATERAL joins
   - Time-series data aggregated daily

2. **Backend:**
   - CORS caching
   - Error handling to prevent crashes
   - Connection pooling to reduce overhead

3. **Frontend:**
   - Auto-refresh every 5 minutes (configurable)
   - Fallback to mock data if API unavailable
   - Efficient React re-renders with proper state management
   - Lazy loading of components

## Security Considerations

1. **Environment Variables:**
   - Database credentials stored in `.env` (not committed)
   - API keys separated from code

2. **CORS:**
   - Configured to allow only specific origins
   - Credentials support enabled

3. **Database:**
   - Parameterized queries (SQL injection prevention)
   - Foreign key constraints for data integrity

4. **Error Handling:**
   - Sensitive error details hidden in production
   - Stack traces only in development mode

## Scalability

### Current Limitations
- Single PostgreSQL instance
- No caching layer
- Synchronous API calls
- No rate limiting

### Future Enhancements
1. **Horizontal Scaling:**
   - Load balancer for multiple backend instances
   - Read replicas for database
   - CDN for static assets

2. **Caching:**
   - Redis for frequently accessed data
   - In-memory caching for ward data
   - HTTP caching headers

3. **Real-time Updates:**
   - WebSocket support for live data
   - Server-Sent Events (SSE) for alerts
   - Push notifications

4. **Data Pipeline:**
   - Message queue (RabbitMQ/Kafka) for data ingestion
   - Scheduled jobs for data aggregation
   - ETL pipeline for historical analysis

## Deployment Architecture

### Development
```
Frontend (localhost:5173) → Backend (localhost:3001) → PostgreSQL (localhost:5432)
```

### Production (Recommended)
```
┌─────────────────┐
│  Nginx/CDN      │  → Static files (Frontend)
└─────────────────┘
        │
        ├──→ ┌─────────────────┐
             │  Node.js API     │  → PostgreSQL Primary
             │  (PM2/Cluster)   │
             └─────────────────┘
                      │
                      └──→ ┌─────────────────┐
                           │  PostgreSQL     │
                           │  (Primary +     │
                           │   Read Replica) │
                           └─────────────────┘
```

## Monitoring & Logging

**Current:**
- Console logging for errors and startup
- Database connection status on startup

**Recommended Additions:**
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Database query performance monitoring
- API request/response logging
- Health check endpoints for monitoring

## Backup & Recovery

**Database Backups:**
- Regular PostgreSQL dumps (daily recommended)
- Point-in-time recovery (PITR) enabled
- Backup storage on separate server/cloud

**Data Retention:**
- AQI data: Indefinite (for historical analysis)
- Alerts: Keep resolved alerts for audit trail
- Time-series: Aggregated daily, raw data archived monthly

## Development Workflow

1. **Local Development:**
   - Frontend: `npm run dev` (hot reload)
   - Backend: `npm run dev` (tsx watch mode)
   - Database: Local PostgreSQL instance

2. **Database Migrations:**
   - `npm run db:migrate` - Apply schema changes
   - `npm run db:seed` - Populate with test data
   - `npm run db:reset` - Reset database (WARNING: deletes all data)

3. **Testing:**
   - Unit tests (recommended)
   - Integration tests for API endpoints
   - E2E tests for critical user flows

## Technology Decisions

**Why PostgreSQL?**
- Robust relational database with JSON support
- Excellent for time-series data
- Strong ACID compliance
- Mature ecosystem

**Why Express.js?**
- Lightweight and fast
- Large middleware ecosystem
- Easy to understand and maintain
- Good TypeScript support

**Why React + TypeScript?**
- Component-based architecture
- Type safety reduces bugs
- Large ecosystem and community
- Excellent developer experience

**Why Vite?**
- Fast development server
- Optimized production builds
- Native ESM support
- Great DX









