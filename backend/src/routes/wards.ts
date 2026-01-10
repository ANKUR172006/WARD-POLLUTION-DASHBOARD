import express from 'express';
import { pool, getDbErrorStatus } from '../db/connection.js';

export const wardsRouter = express.Router();

// Validate ward ID from params/query (alphanumeric, max 10 chars per schema)
function isValidWardId(wardId: unknown): wardId is string {
  if (typeof wardId !== 'string' || wardId.trim().length === 0) {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,10}$/.test(wardId.trim());
}

// Get all wards with latest AQI data
wardsRouter.get('/', async (req, res, next) => {
  try {
    // Validate pool is available
    if (!pool) {
      console.error('[GET /api/wards] Database pool not initialized');
      return res.status(503).json([]); // Return empty array to maintain API response shape (WardData[])
    }

    const query = `
      SELECT 
        w.id,
        w.name,
        w.coordinates_path,
        w.center_x,
        w.center_y,
        a.aqi,
        a.category,
        a.pm25,
        a.pm10,
        a.no2,
        a.so2,
        a.co,
        a.recorded_at,
        ps.vehicular,
        ps.construction,
        ps.industrial,
        ps.waste_burning,
        f.hours_24 as forecast_hours24,
        f.hours_48 as forecast_hours48,
        COALESCE(
          (SELECT array_agg(message) 
           FROM alerts 
           WHERE ward_id = w.id AND is_active = true),
          ARRAY[]::text[]
        ) as alerts,
        w.id as priority
      FROM wards w
      LEFT JOIN LATERAL (
        SELECT * FROM aqi_data 
        WHERE ward_id = w.id 
        ORDER BY recorded_at DESC 
        LIMIT 1
      ) a ON true
      LEFT JOIN LATERAL (
        SELECT * FROM pollution_sources 
        WHERE ward_id = w.id 
        ORDER BY recorded_at DESC 
        LIMIT 1
      ) ps ON true
      LEFT JOIN LATERAL (
        SELECT * FROM forecasts 
        WHERE ward_id = w.id 
        ORDER BY forecast_date DESC 
        LIMIT 1
      ) f ON true
      ORDER BY w.id
    `;
    
    const result = await pool.query(query);
    
    // Safe access: result.rows may be undefined in edge cases
    const rows = result?.rows ?? [];
    
    const wards = rows
      .filter((row: any) => row && (row.id != null && row.id !== ''))
      .map((row: any) => {
        // Safe priority parsing: handle ward IDs with or without 'W' prefix
        let priority = 10;
        if (row.priority != null && row.priority !== '') {
          const numPart = String(row.priority).replace(/^W/i, '');
          const parsed = parseInt(numPart, 10);
          priority = !isNaN(parsed) ? parsed : 10;
        }
        
        return {
        id: row.id || '',
        name: row.name || 'Unknown Ward',
        aqi: Number(row.aqi) || 0,
        category: row.category || 'Moderate',
        pollutants: {
          pm25: Number(row.pm25) || 0,
          pm10: Number(row.pm10) || 0,
          no2: Number(row.no2) || 0,
          so2: Number(row.so2) || 0,
          co: Number(row.co) || 0,
        },
        sources: {
          vehicular: Number(row.vehicular) || 0,
          construction: Number(row.construction) || 0,
          industrial: Number(row.industrial) || 0,
          wasteBurning: Number(row.waste_burning) || 0,
        },
        forecast: {
          hours24: Number(row.forecast_hours24) || 0,
          hours48: Number(row.forecast_hours48) || 0,
        },
        coordinates: {
          path: row.coordinates_path || '',
          centerX: Number(row.center_x) || 0,
          centerY: Number(row.center_y) || 0,
        },
        alerts: Array.isArray(row.alerts) ? row.alerts : [],
          priority,
        };
      });
    
    // Return empty array if no wards - valid response, not an error
    return res.json(wards);
  } catch (error: any) {
    // Safe logging: extract meaningful error info
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/wards] Error:', { message: error?.message, code: errorCode });
    
    // Use centralized DB error classification
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      // Return [] to maintain API shape (WardData[]) for wards list
      return res.status(status).json([]);
    }
  }
});

// Get single ward by ID
wardsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ward ID
    if (!isValidWardId(id)) {
      return res.status(400).json({ error: 'Invalid ward ID format' });
    }
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    const query = `
      SELECT 
        w.id,
        w.name,
        w.coordinates_path,
        w.center_x,
        w.center_y,
        a.aqi,
        a.category,
        a.pm25,
        a.pm10,
        a.no2,
        a.so2,
        a.co,
        a.recorded_at,
        ps.vehicular,
        ps.construction,
        ps.industrial,
        ps.waste_burning,
        f.hours_24 as forecast_hours24,
        f.hours_48 as forecast_hours48,
        COALESCE(
          (SELECT array_agg(message) 
           FROM alerts 
           WHERE ward_id = w.id AND is_active = true),
          ARRAY[]::text[]
        ) as alerts
      FROM wards w
      LEFT JOIN LATERAL (
        SELECT * FROM aqi_data 
        WHERE ward_id = w.id 
        ORDER BY recorded_at DESC 
        LIMIT 1
      ) a ON true
      LEFT JOIN LATERAL (
        SELECT * FROM pollution_sources 
        WHERE ward_id = w.id 
        ORDER BY recorded_at DESC 
        LIMIT 1
      ) ps ON true
      LEFT JOIN LATERAL (
        SELECT * FROM forecasts 
        WHERE ward_id = w.id 
        ORDER BY forecast_date DESC 
        LIMIT 1
      ) f ON true
      WHERE w.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    // Safe access: handle null/undefined rows
    const rows = result?.rows ?? [];
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ward not found' });
    }
    
    const row = rows[0];
    
    // Safe priority parsing: row.id may be null, avoid .replace on null
    let priority = 10;
    if (row?.id != null && row.id !== '') {
      const numPart = String(row.id).replace(/^W/i, '');
      const parsed = parseInt(numPart, 10);
      priority = !isNaN(parsed) ? parsed : 10;
    }
    
    const ward = {
      id: row?.id || '',
      name: row?.name || 'Unknown Ward',
      aqi: Number(row?.aqi) || 0,
      category: row?.category || 'Moderate',
      pollutants: {
        pm25: Number(row?.pm25) || 0,
        pm10: Number(row?.pm10) || 0,
        no2: Number(row?.no2) || 0,
        so2: Number(row?.so2) || 0,
        co: Number(row?.co) || 0,
      },
      sources: {
        vehicular: Number(row?.vehicular) || 0,
        construction: Number(row?.construction) || 0,
        industrial: Number(row?.industrial) || 0,
        wasteBurning: Number(row?.waste_burning) || 0,
      },
      forecast: {
        hours24: Number(row?.forecast_hours24) || 0,
        hours48: Number(row?.forecast_hours48) || 0,
      },
      coordinates: {
        path: row?.coordinates_path || '',
        centerX: Number(row?.center_x) || 0,
        centerY: Number(row?.center_y) || 0,
      },
      alerts: Array.isArray(row?.alerts) ? row.alerts : [],
      priority,
    };
    
    return res.json(ward);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/wards/:id] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({ error: status === 503 ? 'Database unavailable' : 'Failed to fetch ward' });
    }
  }
});

// Update ward AQI data
wardsRouter.post('/:id/aqi', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { aqi, category, pm25, pm10, no2, so2, co } = req.body;
    
    // Validate ward ID
    if (!isValidWardId(id)) {
      return res.status(400).json({ error: 'Invalid ward ID format' });
    }
    
    // Validate required fields
    if (!aqi || !category || pm25 === undefined || pm10 === undefined) {
      return res.status(400).json({ error: 'Missing required fields: aqi, category, pm25, pm10' });
    }
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    await pool.query(
      `INSERT INTO aqi_data (ward_id, aqi, category, pm25, pm10, no2, so2, co)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, aqi, category, pm25, pm10, no2 || 0, so2 || 0, co || 0]
    );
    
    return res.json({ success: true, message: 'AQI data updated' });
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[POST /api/wards/:id/aqi] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({ error: status === 503 ? 'Database unavailable' : 'Failed to update AQI data' });
    }
  }
});
