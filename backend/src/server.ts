/**
 * Backend API Server
 * 
 * Express server that:
 * - Does NOT crash on database unavailability
 * - Provides health endpoint with DB status
 * - Loads frontend even when DB is down
 * - Logs clear startup messages
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { wardsRouter } from './routes/wards.js';
import { analyticsRouter } from './routes/analytics.js';
import { alertsRouter } from './routes/alerts.js';
import { weatherRouter } from './routes/weather.js';
import { predictionRouter } from './routes/prediction.js';
import { testConnection, isDatabaseAvailable } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env early - connection.ts also loads it but this ensures it's loaded
// when server.ts is the entry point (e.g., ts-node, or if import order changes)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// =============================================================================
// Middleware
// =============================================================================

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// Health Check - includes DB status for monitoring
// =============================================================================

app.get('/health', async (req, res) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } else {
      // Server is up but DB is down - return 503 so load balancers know
      return res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        message: 'Database unavailable. API routes requiring DB will return 503.',
      });
    }
  } catch (error: any) {
    // Health check itself failed - should not happen but handle safely
    console.error('[GET /health] Error:', error?.message);
    return res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'unknown',
      error: 'Health check failed',
    });
  }
});

// =============================================================================
// API Routes
// =============================================================================

app.use('/api/wards', wardsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/predict', predictionRouter);

// =============================================================================
// Error Handling Middleware
// Catches errors passed via next(error) from route handlers
// =============================================================================

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log with context
  console.error('[Error Handler]', {
    path: req.path,
    method: req.method,
    message: err?.message || 'Unknown error',
    code: err?.code,
  });
  
  // Prevent server crash - always try to send response
  try {
    // Don't send response if already sent (e.g., by route's catch block)
    if (res.headersSent) {
      return;
    }
    
    const status = err?.status || err?.statusCode || 500;
    res.status(status).json({
      error: err?.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && err?.stack && { stack: err.stack }),
    });
  } catch (responseError: any) {
    console.error('[Error Handler] Failed to send error response:', responseError?.message);
  }
});

// =============================================================================
// 404 Handler
// =============================================================================

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// =============================================================================
// Server Startup - does NOT crash if DB is unavailable
// =============================================================================

app.listen(PORT, async () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 Backend API Server Started');
  console.log('========================================');
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS Origin: ${CORS_ORIGIN}`);
  console.log('');
  
  // Test database connection - NEVER throw, log result
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database: UNAVAILABLE');
      console.warn('   API will run but database routes will return HTTP 503.');
      console.warn('   Fix: Ensure PostgreSQL is running and backend/.env is configured.');
      console.warn('   See: backend/.env.example for required variables.');
    }
  } catch (startupError: any) {
    // testConnection should not throw, but be defensive
    console.error('❌ Startup DB check error:', startupError?.message);
    console.warn('   Server will continue. Database routes may return 503.');
  }
  
  console.log('========================================');
  console.log('');
});
