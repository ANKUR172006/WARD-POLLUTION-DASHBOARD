# Ward-Wise Pollution Dashboard - Backend API

Backend API server for the Ward-Wise Pollution Action Dashboard, built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- RESTful API endpoints for wards, AQI data, analytics, alerts, and weather
- PostgreSQL database with optimized schema and indexes
- Real-time data aggregation and querying
- Type-safe TypeScript implementation
- CORS enabled for frontend integration

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ installed and running
- Database credentials

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ward_pollution_db
DB_USER=postgres
DB_PASSWORD=your_password

CORS_ORIGIN=http://localhost:5173
```

### 3. Create Database

Create the PostgreSQL database:

```sql
CREATE DATABASE ward_pollution_db;
```

Or using psql command line:
```bash
createdb ward_pollution_db
```

### 4. Run Database Migration

This will create all tables and indexes:

```bash
npm run db:migrate
```

### 5. Seed Database

Populate the database with initial ward data:

```bash
npm run db:seed
```

This will insert all 8 wards with their initial AQI data, pollution sources, forecasts, alerts, and time series data.

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot-reload enabled.

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Wards
- `GET /api/wards` - Get all wards with latest AQI data
- `GET /api/wards/:id` - Get single ward by ID
- `POST /api/wards/:id/aqi` - Update ward AQI data

### Analytics
- `GET /api/analytics/timeseries?wardId=W001&days=7` - Get time series data
- `GET /api/analytics/trends?wardId=W001&period=7d` - Get pollution trends
- `GET /api/analytics/sources?wardId=W001` - Get pollution source attribution

### Alerts
- `GET /api/alerts` - Get all active alerts (optional: `?wardId=W001&priority=1`)
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id/resolve` - Resolve an alert

### Weather
- `GET /api/weather?wardId=W001` - Get current weather data
- `POST /api/weather` - Update weather data

## Database Schema

### Tables

- **wards** - Ward master data with coordinates
- **aqi_data** - Historical AQI readings
- **pollution_sources** - Pollution source attribution
- **forecasts** - AQI forecasts (24h and 48h)
- **alerts** - Active and resolved alerts
- **time_series_data** - Daily aggregated AQI data
- **weather_data** - Weather measurements

### Wards in Database

1. W001 - New Delhi - Lutyens Zone
2. W002 - Central Delhi - Old Delhi
3. W003 - North Delhi
4. W004 - East Delhi
5. W005 - South Delhi
6. W006 - West Delhi
7. W007 - North East Delhi
8. W008 - South West Delhi

## Database Commands

```bash
# Run migration
npm run db:migrate

# Seed database
npm run db:seed

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## Development

The backend uses:
- **Express.js** for the web framework
- **TypeScript** for type safety
- **pg** (node-postgres) for PostgreSQL client
- **tsx** for TypeScript execution in development

## Integration with Frontend

The frontend should set the API URL in `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

The backend automatically enables CORS for the configured origin.

## Notes

- All timestamps are stored in UTC
- AQI data is inserted as new records (time-series), not updates
- Alerts can be marked as resolved but remain in the database for audit
- Time series data is aggregated daily per ward




