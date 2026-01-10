import express from 'express';
import { pool, getDbErrorStatus } from '../db/connection.js';

export const analyticsRouter = express.Router();

// Validate wardId format: alphanumeric, max 10 chars per schema
function isValidWardId(wardId: unknown): wardId is string {
  if (typeof wardId !== 'string' || wardId.trim().length === 0) {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,10}$/.test(wardId.trim());
}

// Parse and validate days parameter (1-365)
function parseDaysParam(daysParam: unknown, defaultDays: number = 7): number {
  if (daysParam === undefined || daysParam === null) {
    return defaultDays;
  }
  const parsed = parseInt(String(daysParam), 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 365) {
    return defaultDays;
  }
  return parsed;
}

// Get time series data for a ward or all wards
analyticsRouter.get('/timeseries', async (req, res, next) => {
  try {
    const { wardId, days: daysParam } = req.query;
    
    // Validate and parse days parameter - CRITICAL: prevent SQL injection
    // Previously: INTERVAL '${days} days' caused errors with non-numeric input
    const days = parseDaysParam(daysParam, 7);
    
    // Validate wardId if provided (for /api/analytics/timeseries?wardId=W001&days=7)
    if (wardId !== undefined && wardId !== null && !isValidWardId(wardId)) {
      console.warn('[GET /api/analytics/timeseries] Invalid wardId format:', wardId);
      return res.status(400).json([]); // Return empty array to maintain API response shape
    }
    
    // Validate pool is available
    if (!pool) {
      console.error('[GET /api/analytics/timeseries] Database pool not initialized');
      return res.json([]);
    }
    
    let query: string;
    let params: (string | number)[];
    
    // Use parameterized query for days - $2 is safe integer, prevents SQL injection
    // Using make_interval() for safe interval construction from user input
    if (wardId && isValidWardId(wardId)) {
      const sanitizedWardId = String(wardId).trim();
      query = `
        SELECT date, aqi, pm25, pm10
        FROM time_series_data
        WHERE ward_id = $1
        AND date >= CURRENT_DATE - make_interval(days => $2::integer)
        ORDER BY date ASC
      `;
      params = [sanitizedWardId, days];
    } else {
      query = `
        SELECT 
          date,
          AVG(aqi)::INTEGER as aqi,
          AVG(pm25)::INTEGER as pm25,
          AVG(pm10)::INTEGER as pm10
        FROM time_series_data
        WHERE date >= CURRENT_DATE - make_interval(days => $1::integer)
        GROUP BY date
        ORDER BY date ASC
      `;
      params = [days];
    }
    
    const result = await pool.query(query, params);
    
    // Safe access: result.rows may be null/undefined
    const rows = result?.rows ?? [];
    
    // Safely map rows - handle null/undefined row values
    const timeSeries = rows.map((row: any) => ({
      date: row?.date ?? null,
      aqi: row?.aqi != null ? Number(row.aqi) : 0,
      pm25: row?.pm25 != null ? Number(row.pm25) : 0,
      pm10: row?.pm10 != null ? Number(row.pm10) : 0,
    }));
    
    // Empty array is valid - no data for time range
    return res.json(timeSeries);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/analytics/timeseries] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json([]);
    }
  }
});

// Get pollution trends
analyticsRouter.get('/trends', async (req, res, next) => {
  try {
    const { wardId, period = '7d' } = req.query;
    
    // Check pool available
    if (!pool) {
      return res.status(503).json([]);
    }
    
    let interval = '7 days';
    if (period === '30d') interval = '30 days';
    if (period === '90d') interval = '90 days';
    
    let query: string;
    let params: (string | number)[];
    
    // Extract wardId as string (query params can be string | ParsedQs | array)
    const wardIdStr = typeof wardId === 'string' ? wardId : (Array.isArray(wardId) ? String(wardId[0]) : null);
    
    if (wardIdStr) {
      query = `
        SELECT 
          DATE_TRUNC('day', recorded_at) as date,
          AVG(aqi)::INTEGER as avg_aqi,
          MAX(aqi) as max_aqi,
          MIN(aqi) as min_aqi
        FROM aqi_data
        WHERE ward_id = $1
        AND recorded_at >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('day', recorded_at)
        ORDER BY date ASC
      `;
      params = [wardIdStr];
    } else {
      query = `
        SELECT 
          DATE_TRUNC('day', recorded_at) as date,
          AVG(aqi)::INTEGER as avg_aqi,
          MAX(aqi) as max_aqi,
          MIN(aqi) as min_aqi
        FROM aqi_data
        WHERE recorded_at >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('day', recorded_at)
        ORDER BY date ASC
      `;
      params = [];
    }
    
    const result = await pool.query(query, params);
    const rows = result?.rows ?? [];
    return res.json(rows);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/analytics/trends] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json([]);
    }
  }
});

// Get source attribution summary
analyticsRouter.get('/sources', async (req, res, next) => {
  try {
    const { wardId } = req.query;
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({
        vehicular: 0,
        construction: 0,
        industrial: 0,
        wasteBurning: 0,
      });
    }
    
    let query: string;
    let params: (string | number)[];
    
    // Extract wardId as string (query params can be string | ParsedQs | array)
    const wardIdStr = typeof wardId === 'string' ? wardId : (Array.isArray(wardId) ? String(wardId[0]) : null);
    
    if (wardIdStr) {
      query = `
        SELECT 
          AVG(vehicular)::INTEGER as vehicular,
          AVG(construction)::INTEGER as construction,
          AVG(industrial)::INTEGER as industrial,
          AVG(waste_burning)::INTEGER as waste_burning
        FROM pollution_sources
        WHERE ward_id = $1
        AND recorded_at >= NOW() - INTERVAL '7 days'
      `;
      params = [wardIdStr];
    } else {
      query = `
        SELECT 
          AVG(vehicular)::INTEGER as vehicular,
          AVG(construction)::INTEGER as construction,
          AVG(industrial)::INTEGER as industrial,
          AVG(waste_burning)::INTEGER as waste_burning
        FROM pollution_sources
        WHERE recorded_at >= NOW() - INTERVAL '7 days'
      `;
      params = [];
    }
    
    const result = await pool.query(query, params);
    const rows = result?.rows ?? [];
    
    if (rows.length === 0) {
      return res.json({
        vehicular: 0,
        construction: 0,
        industrial: 0,
        wasteBurning: 0,
      });
    }
    
    const row = rows[0];
    
    return res.json({
      vehicular: row?.vehicular ?? 0,
      construction: row?.construction ?? 0,
      industrial: row?.industrial ?? 0,
      wasteBurning: row?.waste_burning ?? 0,
    });
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/analytics/sources] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({
        vehicular: 0,
        construction: 0,
        industrial: 0,
        wasteBurning: 0,
      });
    }
  }
});
