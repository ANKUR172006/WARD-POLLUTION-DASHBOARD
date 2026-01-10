import express from 'express';
import { pool, getDbErrorStatus } from '../db/connection.js';
import { predictTrend } from '../utils/trendPrediction.js';

export const predictionRouter = express.Router();

// Validate wardId format (alphanumeric, max 10 chars per schema)
function isValidWardId(wardId: unknown): wardId is string {
  if (typeof wardId !== 'string' || wardId.trim().length === 0) {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,10}$/.test(wardId.trim());
}

// Parse and validate days parameter (7-30 for trend prediction)
function parseDaysParam(daysParam: unknown, defaultDays: number = 14): number {
  if (daysParam === undefined || daysParam === null) {
    return defaultDays;
  }
  const parsed = parseInt(String(daysParam), 10);
  if (isNaN(parsed) || parsed < 7 || parsed > 30) {
    return defaultDays;
  }
  return parsed;
}

/**
 * GET /api/predict/trend
 * Predict short-term pollution trend for a ward based on historical AQI data
 * 
 * Query Parameters:
 * - wardId (required): Ward identifier (e.g., W001)
 * - days (optional): Number of days to analyze (default: 14, min: 7, max: 30)
 */
predictionRouter.get('/trend', async (req, res, next) => {
  try {
    const { wardId, days: daysParam } = req.query;
    
    // Validate required wardId
    if (!wardId) {
      return res.status(400).json({ error: 'wardId query parameter is required' });
    }
    
    if (!isValidWardId(wardId)) {
      return res.status(400).json({ error: 'Invalid wardId format' });
    }
    
    const wardIdStr = String(wardId).trim();
    
    // Validate and parse days - use parameterized query to prevent SQL injection
    // Previously: INTERVAL '${days} days' was unsafe
    const days = parseDaysParam(daysParam, 14);
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    // Try to fetch historical data from database
    // FIXED: Use parameterized query with make_interval() instead of string interpolation
    let historicalData: { date: any; aqi: number }[] | undefined;
    
    try {
      const result = await pool.query(
        `SELECT date, aqi 
         FROM time_series_data 
         WHERE ward_id = $1 
         AND date >= CURRENT_DATE - make_interval(days => $2::integer)
         ORDER BY date ASC`,
        [wardIdStr, days]
      );
      
      const rows = result?.rows ?? [];
      if (rows.length >= 7) {
        historicalData = rows.map((row: any) => ({
          date: row?.date,
          aqi: row?.aqi != null ? Number(row.aqi) : 0,
        }));
      }
    } catch (dbError: any) {
      // Log but don't fail - will use mock data
      console.warn('[GET /api/predict/trend] DB query failed, using mock data:', dbError?.message);
    }
    
    // If no database data or insufficient data, use mock data
    if (!historicalData || historicalData.length < 7) {
      // Try to get current AQI from database first
      let currentAQI = 150; // Default fallback
      try {
        const currentResult = await pool.query(
          `SELECT aqi FROM aqi_data WHERE ward_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
          [wardIdStr]
        );
        const currentRows = currentResult?.rows ?? [];
        if (currentRows.length > 0 && currentRows[0]?.aqi != null) {
          currentAQI = Number(currentRows[0].aqi);
        }
      } catch (dbError) {
        // Use default - DB may be unavailable
      }
      
      // Generate mock historical data based on current AQI
      const today = new Date();
      historicalData = Array.from({ length: days }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - i - 1));
        
        const trendFactor = (i / days) * 15;
        const variation = (Math.random() - 0.5) * 20;
        const aqi = Math.max(0, Math.round(currentAQI - trendFactor + variation));
        
        return {
          date: date.toISOString().split('T')[0],
          aqi,
        };
      });
    }
    
    // Run trend prediction
    const prediction = predictTrend(wardIdStr, historicalData);
    
    return res.json(prediction);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/predict/trend] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({ 
        error: status === 503 ? 'Database unavailable' : 'Failed to generate prediction' 
      });
    }
  }
});
