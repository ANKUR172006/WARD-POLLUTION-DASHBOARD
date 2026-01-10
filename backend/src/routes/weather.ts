import express from 'express';
import { pool, getDbErrorStatus } from '../db/connection.js';

export const weatherRouter = express.Router();

// Validate wardId format: alphanumeric, typically W followed by digits (e.g., W001)
function isValidWardId(wardId: unknown): wardId is string {
  if (typeof wardId !== 'string' || wardId.trim().length === 0) {
    return false;
  }
  // Allow ward IDs like W001, W1, ward_1, etc. - max 10 chars per schema
  return /^[a-zA-Z0-9_-]{1,10}$/.test(wardId.trim());
}

// Get current weather data
weatherRouter.get('/', async (req, res, next) => {
  try {
    const { wardId } = req.query;
    
    // Validate wardId if provided (for /api/weather?wardId=W001)
    if (wardId !== undefined && wardId !== null && !isValidWardId(wardId)) {
      console.warn('[GET /api/weather] Invalid wardId format:', wardId);
      return res.status(400).json({ 
        error: 'Invalid wardId format. Expected alphanumeric string (e.g., W001)',
        windSpeed: 8.5,
        temperature: 28,
        humidity: 65,
      });
    }
    
    // Validate pool is available
    if (!pool) {
      console.error('[GET /api/weather] Database pool not initialized');
      return res.json({ windSpeed: 8.5, temperature: 28, humidity: 65 });
    }
    
    let query: string;
    let params: (string | number)[];
    
    if (wardId && isValidWardId(wardId)) {
      const sanitizedWardId = String(wardId).trim();
      query = `
        SELECT wind_speed, temperature, humidity, recorded_at
        FROM weather_data
        WHERE ward_id = $1
        ORDER BY recorded_at DESC
        LIMIT 1
      `;
      params = [sanitizedWardId];
    } else {
      query = `
        SELECT 
          AVG(wind_speed) as wind_speed,
          AVG(temperature) as temperature,
          AVG(humidity) as humidity,
          MAX(recorded_at) as recorded_at
        FROM weather_data
        WHERE recorded_at >= NOW() - INTERVAL '1 hour'
      `;
      params = [];
    }
    
    const result = await pool.query(query, params);
    
    // Safe access: handle null/undefined rows
    const rows = result?.rows ?? [];
    
    if (rows.length === 0) {
      // No data found - return defaults (valid empty state, not an error)
      return res.json({
        windSpeed: 8.5,
        temperature: 28,
        humidity: 65,
      });
    }
    
    const row = rows[0];
    const windSpeed = row?.wind_speed != null ? parseFloat(String(row.wind_speed)) : NaN;
    const temperature = row?.temperature != null ? parseFloat(String(row.temperature)) : NaN;
    const humidity = row?.humidity != null ? parseFloat(String(row.humidity)) : NaN;
    
    return res.json({
      windSpeed: !isNaN(windSpeed) ? windSpeed : 8.5,
      temperature: !isNaN(temperature) ? temperature : 28,
      humidity: !isNaN(humidity) ? humidity : 65,
    });
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/weather] Error:', { message: error?.message, code: errorCode });
    
    // Don't crash - return default weather data, use appropriate status
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      // Include default weather values so frontend can still display something
      return res.status(status).json({ 
        error: status === 503 ? 'Database unavailable' : 'Failed to fetch weather data',
        windSpeed: 8.5,
        temperature: 28,
        humidity: 65,
      });
    }
  }
});

// Update weather data
weatherRouter.post('/', async (req, res, next) => {
  try {
    const { wardId, windSpeed, temperature, humidity } = req.body;
    
    // Validate required fields
    if (!wardId || windSpeed === undefined || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: wardId, windSpeed, temperature, humidity' });
    }
    
    // Validate wardId format
    if (!isValidWardId(wardId)) {
      return res.status(400).json({ error: 'Invalid wardId format' });
    }
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    await pool.query(
      `INSERT INTO weather_data (ward_id, wind_speed, temperature, humidity)
       VALUES ($1, $2, $3, $4)`,
      [wardId, windSpeed, temperature, humidity]
    );
    
    return res.json({ success: true, message: 'Weather data updated' });
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[POST /api/weather] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({ error: status === 503 ? 'Database unavailable' : 'Failed to update weather data' });
    }
  }
});
