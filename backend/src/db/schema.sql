-- Ward-Wise Pollution Action Dashboard Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wards table
CREATE TABLE IF NOT EXISTS wards (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    coordinates_path TEXT,
    center_x FLOAT,
    center_y FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AQI data table (current readings)
CREATE TABLE IF NOT EXISTS aqi_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id VARCHAR(10) REFERENCES wards(id) ON DELETE CASCADE,
    aqi INTEGER NOT NULL,
    category VARCHAR(20) NOT NULL,
    pm25 FLOAT NOT NULL,
    pm10 FLOAT NOT NULL,
    no2 FLOAT NOT NULL,
    so2 FLOAT NOT NULL,
    co FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_aqi_ward ON aqi_data(ward_id);
CREATE INDEX IF NOT EXISTS idx_aqi_recorded_at ON aqi_data(recorded_at);

-- Pollution sources table
CREATE TABLE IF NOT EXISTS pollution_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id VARCHAR(10) REFERENCES wards(id) ON DELETE CASCADE,
    vehicular INTEGER DEFAULT 0,
    construction INTEGER DEFAULT 0,
    industrial INTEGER DEFAULT 0,
    waste_burning INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_ward ON pollution_sources(ward_id);

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id VARCHAR(10) REFERENCES wards(id) ON DELETE CASCADE,
    hours_24 INTEGER NOT NULL,
    hours_48 INTEGER NOT NULL,
    forecast_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forecast_ward ON forecasts(ward_id);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id VARCHAR(10) REFERENCES wards(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    priority INTEGER DEFAULT 5,
    type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_ward ON alerts(ward_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);

-- Time series data (historical AQI)
CREATE TABLE IF NOT EXISTS time_series_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id VARCHAR(10) REFERENCES wards(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    aqi INTEGER NOT NULL,
    pm25 FLOAT NOT NULL,
    pm10 FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ward_id, date)
);

CREATE INDEX IF NOT EXISTS idx_timeseries_ward ON time_series_data(ward_id);
CREATE INDEX IF NOT EXISTS idx_timeseries_date ON time_series_data(date);

-- Weather data table
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_id VARCHAR(10) REFERENCES wards(id) ON DELETE CASCADE,
    wind_speed FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weather_ward ON weather_data(ward_id);
CREATE INDEX IF NOT EXISTS idx_weather_recorded_at ON weather_data(recorded_at);

-- Create composite indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aqi_ward_recorded ON aqi_data(ward_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeseries_ward_date ON time_series_data(ward_id, date DESC);
