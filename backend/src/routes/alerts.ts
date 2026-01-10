import express from 'express';
import { pool, getDbErrorStatus } from '../db/connection.js';

export const alertsRouter = express.Router();

// Validate wardId format (alphanumeric, max 10 chars per schema)
function isValidWardId(wardId: unknown): wardId is string {
  if (typeof wardId !== 'string' || wardId.trim().length === 0) {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,10}$/.test(wardId.trim());
}

// Get all active alerts
alertsRouter.get('/', async (req, res, next) => {
  try {
    const { wardId, priority } = req.query;
    
    // Validate wardId if provided
    if (wardId !== undefined && wardId !== null && !isValidWardId(wardId)) {
      return res.status(400).json({ error: 'Invalid wardId format', alerts: [] });
    }
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable', alerts: [] });
    }
    
    let query = `
      SELECT 
        a.id,
        a.ward_id,
        w.name as ward_name,
        a.message,
        a.priority,
        a.type,
        a.is_active,
        a.created_at,
        a.resolved_at,
        (SELECT aqi FROM aqi_data WHERE ward_id = a.ward_id ORDER BY recorded_at DESC LIMIT 1) as current_aqi
      FROM alerts a
      JOIN wards w ON a.ward_id = w.id
      WHERE a.is_active = true
    `;
    
    const params: (string | number)[] = [];
    let paramCount = 1;
    
    // Safe wardId - extract string from query param
    const wardIdStr = typeof wardId === 'string' ? wardId : (Array.isArray(wardId) ? String(wardId[0]) : null);
    if (wardIdStr && isValidWardId(wardIdStr)) {
      query += ` AND a.ward_id = $${paramCount}`;
      params.push(wardIdStr);
      paramCount++;
    }
    
    if (priority !== undefined && priority !== null) {
      const priorityNum = parseInt(String(priority), 10);
      if (!isNaN(priorityNum)) {
        query += ` AND a.priority = $${paramCount}`;
        params.push(priorityNum);
        paramCount++;
      }
    }
    
    query += ` ORDER BY a.priority ASC, a.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    // Safe access: never assume rows exists
    const rows = result?.rows ?? [];
    
    return res.json(rows);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[GET /api/alerts] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      // Return empty array to maintain API shape
      return res.status(status).json([]);
    }
  }
});

// Create new alert
alertsRouter.post('/', async (req, res, next) => {
  try {
    const { wardId, message, priority = 5, type } = req.body;
    
    // Validate required fields
    if (!wardId || !message) {
      return res.status(400).json({ error: 'wardId and message are required' });
    }
    
    if (!isValidWardId(wardId)) {
      return res.status(400).json({ error: 'Invalid wardId format' });
    }
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    const result = await pool.query(
      `INSERT INTO alerts (ward_id, message, priority, type, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [wardId, message, priority, type || null]
    );
    
    const rows = result?.rows ?? [];
    if (rows.length === 0) {
      return res.status(500).json({ error: 'Failed to create alert' });
    }
    
    return res.status(201).json(rows[0]);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[POST /api/alerts] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({ error: status === 503 ? 'Database unavailable' : 'Failed to create alert' });
    }
  }
});

// Resolve alert
alertsRouter.patch('/:id/resolve', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format for alert id
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid alert ID' });
    }
    
    // Check pool available
    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    const result = await pool.query(
      `UPDATE alerts 
       SET is_active = false, resolved_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    const rows = result?.rows ?? [];
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    return res.json(rows[0]);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    console.error('[PATCH /api/alerts/:id/resolve] Error:', { message: error?.message, code: errorCode });
    
    if (!res.headersSent) {
      const status = getDbErrorStatus(error);
      return res.status(status).json({ error: status === 503 ? 'Database unavailable' : 'Failed to resolve alert' });
    }
  }
});
