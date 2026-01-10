import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// Get policy recommendations for a ward
router.get('/ward/:wardId', async (req, res) => {
  try {
    const { wardId } = req.params;

    // Get active policy actions for the ward
    const result = await pool.query(`
      SELECT 
        id,
        ward_id as "wardId",
        type,
        title,
        description,
        priority,
        estimated_impact as "estimatedImpact"
      FROM policy_actions
      WHERE ward_id = $1 AND is_active = true
      ORDER BY 
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        created_at DESC
    `, [wardId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching policy actions:', error);
    res.status(500).json({ error: 'Failed to fetch policy actions' });
  }
});

// Generate and save policy recommendations for a ward based on current AQI
router.post('/ward/:wardId/generate', async (req, res) => {
  try {
    const { wardId } = req.params;

    // Get latest ward data
    const wardResult = await pool.query(`
      SELECT 
        w.id,
        (
          SELECT aqi FROM aqi_measurements 
          WHERE ward_id = w.id 
          ORDER BY measured_at DESC 
          LIMIT 1
        ) as aqi,
        (
          SELECT category::text FROM aqi_measurements 
          WHERE ward_id = w.id 
          ORDER BY measured_at DESC 
          LIMIT 1
        ) as category,
        (
          SELECT json_build_object(
            'vehicular', vehicular,
            'construction', construction,
            'industrial', industrial,
            'wasteBurning', waste_burning
          ) FROM pollution_sources 
          WHERE ward_id = w.id 
          ORDER BY measured_at DESC 
          LIMIT 1
        ) as sources
      FROM wards w
      WHERE w.id = $1
    `, [wardId]);

    if (wardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ward not found' });
    }

    const ward = wardResult.rows[0];
    const aqi = ward.aqi || 0;
    const category = ward.category || 'Moderate';
    const sources = ward.sources || {};

    // Generate policy actions based on conditions
    const actions = [];

    // Deactivate old actions
    await pool.query(`
      UPDATE policy_actions 
      SET is_active = false 
      WHERE ward_id = $1
    `, [wardId]);

    if (aqi >= 300) {
      actions.push({
        type: 'traffic',
        title: 'Implement Odd-Even Vehicle Restriction',
        description: 'Restrict vehicle movement based on registration numbers during peak hours (8 AM - 8 PM)',
        priority: 'high',
        estimatedImpact: 'Expected 15-20% reduction in vehicular emissions',
      });
    }

    if (sources.construction > 20) {
      actions.push({
        type: 'construction',
        title: 'Suspend Construction Activities',
        description: 'Temporarily halt all non-essential construction work until AQI improves below 200',
        priority: 'high',
        estimatedImpact: 'Immediate 20-25% reduction in PM10 and PM2.5',
      });
    }

    if (sources.vehicular > 50) {
      actions.push({
        type: 'sweeping',
        title: 'Intensify Mechanical Road Sweeping',
        description: 'Deploy additional mechanical sweepers on major arterial roads twice daily',
        priority: 'medium',
        estimatedImpact: 'Reduction in road dust resuspension by 30%',
      });
    }

    if (aqi >= 250) {
      actions.push({
        type: 'enforcement',
        title: 'Strengthen Pollution Control Enforcement',
        description: 'Increase monitoring and penalize violations of construction dust norms and vehicle emissions',
        priority: 'high',
        estimatedImpact: 'Improved compliance and 10-15% emission reduction',
      });
    }

    actions.push({
      type: 'health',
      title: 'Issue Health Advisory',
      description: `Alert citizens about ${category} air quality. Advise vulnerable groups to avoid outdoor activities`,
      priority: aqi >= 300 ? 'high' : 'medium',
      estimatedImpact: 'Public awareness and health protection',
    });

    // Insert new actions
    const insertedActions = [];
    for (const action of actions) {
      const insertResult = await pool.query(`
        INSERT INTO policy_actions (ward_id, type, title, description, priority, estimated_impact)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        wardId,
        action.type,
        action.title,
        action.description,
        action.priority,
        action.estimatedImpact,
      ]);
      insertedActions.push(insertResult.rows[0]);
    }

    res.json(insertedActions);
  } catch (error) {
    console.error('Error generating policy actions:', error);
    res.status(500).json({ error: 'Failed to generate policy actions' });
  }
});

export default router;

