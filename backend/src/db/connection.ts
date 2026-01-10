/**
 * PostgreSQL Connection Layer
 * 
 * Robust database connection handling with:
 * - Environment variable validation
 * - Safe failure when DB is unavailable
 * - Clear startup and error logging
 * - Database availability checking for route handlers
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// STEP 1: Load environment variables - MUST happen before Pool creation
// =============================================================================

// Load .env from backend directory (where this file's package.json lives)
const envPath = path.resolve(__dirname, '../../.env');
const envResult = dotenv.config({ path: envPath });

// Log clear message if .env is missing
if (envResult.error) {
  console.warn('⚠️  [DB] backend/.env file not found or unreadable');
  console.warn('   Using default database configuration. Create backend/.env with:');
  console.warn('   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
  console.warn('   See backend/.env.example for template.');
} else {
  console.log('✅ [DB] Loaded environment from backend/.env');
}

// =============================================================================
// STEP 2: Validate and extract database configuration
// =============================================================================

function getDbConfig() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const database = process.env.DB_NAME || 'ward_pollution_db';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';

  // Warn if using defaults (might indicate missing .env)
  const usingDefaults = !process.env.DB_HOST && !process.env.DB_USER;
  if (usingDefaults) {
    console.warn('⚠️  [DB] Using default PostgreSQL credentials.');
    console.warn('   If connecting fails, create backend/.env with your DB credentials.');
  }

  return {
    host,
    port: isNaN(port) ? 5432 : port,
    database,
    user,
    password,
  };
}

const dbConfig = getDbConfig();

// =============================================================================
// STEP 3: Create connection pool (lazy - doesn't connect until first query)
// =============================================================================

const { Pool } = pg;

export const pool = new Pool({
  ...dbConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: true,
});

// =============================================================================
// STEP 4: Pool event handlers for logging
// =============================================================================

pool.on('connect', () => {
  // Only log first connection to avoid noise (pool creates multiple connections)
  // Detailed connection logging happens in testConnection()
});

pool.on('error', (err: Error & { code?: string }) => {
  console.error('❌ [DB] Pool error (connection lost/broken):', err.message);
  console.error('   Code:', err.code || 'UNKNOWN');
  // Note: Pool will try to reconnect on next query
});

// =============================================================================
// STEP 5: Database availability check - used by route handlers
// =============================================================================

// Cache DB availability to avoid hammering with health checks
let lastDbCheck: { available: boolean; timestamp: number } | null = null;
const DB_CHECK_CACHE_MS = 5000; // Re-check every 5 seconds if previously failed

/**
 * Check if database is available and responsive.
 * Returns cached result if recently checked.
 * Use this BEFORE pool.query() in routes to return 503 early if DB is down.
 * 
 * Note: This is optional - routes should ALSO catch query errors and return 503.
 * This provides fast-fail for known-unavailable DB.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (lastDbCheck && (now - lastDbCheck.timestamp) < DB_CHECK_CACHE_MS) {
    return lastDbCheck.available;
  }

  try {
    const result = await pool.query('SELECT 1 as health_check');
    const available = result?.rows?.[0]?.health_check === 1;
    lastDbCheck = { available, timestamp: now };
    return available;
  } catch (error: any) {
    lastDbCheck = { available: false, timestamp: now };
    // Don't log here - let the route handler log with context
    return false;
  }
}

/**
 * Classify database errors for appropriate HTTP response.
 * Use in catch blocks: const status = getDbErrorStatus(error);
 * 
 * Returns: 503 for DB unavailable, 404 for not found, 400 for bad request, 500 for unexpected
 */
export function getDbErrorStatus(error: any): 400 | 404 | 503 | 500 {
  if (!error) return 500;
  
  const code = error?.code || '';
  const message = String(error?.message || '').toUpperCase();

  // Connection/authentication failures → 503 Service Unavailable
  if (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === '28P01' || // invalid_password
    code === '3D000' || // database does not exist
    code === '57P03'    // cannot_connect_now
  ) {
    return 503;
  }

  // Schema/table issues → 503 (DB exists but not properly initialized)
  if (code === '42P01') { // undefined_table
    return 503;
  }

  // Not found (e.g., ward doesn't exist in WHERE clause) → 404
  // Note: PostgreSQL doesn't have a specific "row not found" code - 
  // routes should check result.rows.length for 404

  // Constraint violations (bad data) → 400
  if (code === '23503' || code === '23505' || code === '23502') { // FK, unique, not null
    return 400;
  }

  // Everything else → 500
  return 500;
}

/**
 * Test database connection - call at server startup.
 * Does NOT throw - returns boolean. Server should log and continue.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    const row = result?.rows?.[0];
    if (row) {
      console.log('✅ [DB] Connection successful');
      console.log(`   Database: ${row.db || 'unknown'}`);
      console.log(`   Server time: ${row.now || 'unknown'}`);
      return true;
    }
    return false;
  } catch (error: any) {
    const code = error?.code || 'UNKNOWN';
    const message = error?.message || 'Unknown error';
    
    console.error('❌ [DB] Connection FAILED');
    console.error(`   Error: ${message}`);
    console.error(`   Code: ${code}`);
    
    // Helpful hints based on error type
    if (code === 'ECONNREFUSED') {
      console.error('   → PostgreSQL may not be running. Start it with: pg_ctl start');
      console.error('   → Or check DB_HOST/DB_PORT in backend/.env');
    } else if (code === '28P01') {
      console.error('   → Invalid DB_USER or DB_PASSWORD. Check backend/.env');
    } else if (code === '3D000') {
      console.error(`   → Database "${dbConfig.database}" does not exist. Create it first.`);
    } else if (code === 'ENOTFOUND') {
      console.error('   → DB_HOST not found. Check backend/.env');
    }
    
    console.error('   → API will return 503 on database routes until connection is restored.');
    return false;
  }
}

/**
 * Safe query helper - optionally use for consistent error handling.
 * Most routes use pool.query directly with try/catch - this is an alternative.
 */
export async function safeQuery<T = any>(
  text: string,
  params?: any[]
): Promise<{ success: true; rows: T[] } | { success: false; error: any; status: 400 | 503 | 500 }> {
  try {
    const result = await pool.query(text, params);
    return { success: true, rows: (result?.rows ?? []) as T[] };
  } catch (error) {
    return {
      success: false,
      error,
      status: getDbErrorStatus(error),
    };
  }
}
