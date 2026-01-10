import { pool } from './connection.js';

const wards = [
  {
    id: 'W001',
    name: 'New Delhi - Lutyens Zone',
    coordinates_path: 'M 200 70 L 320 65 L 350 95 L 360 130 L 355 170 L 340 200 L 310 215 L 280 210 L 250 195 L 220 170 L 200 140 L 200 70 Z',
    center_x: 280,
    center_y: 140,
    aqi: 342,
    category: 'Severe',
    pollutants: { pm25: 285, pm10: 420, no2: 95, so2: 45, co: 8.2 },
    sources: { vehicular: 45, construction: 25, industrial: 20, waste_burning: 10 },
    forecast: { hours24: 365, hours48: 380 },
    alerts: ['High vehicular traffic', 'Construction activity detected'],
    priority: 1,
  },
  {
    id: 'W002',
    name: 'Central Delhi - Old Delhi',
    coordinates_path: 'M 130 110 L 200 105 L 220 140 L 230 180 L 225 220 L 210 250 L 185 265 L 155 260 L 130 240 L 115 200 L 120 150 L 130 110 Z',
    center_x: 175,
    center_y: 185,
    aqi: 298,
    category: 'Very Poor',
    pollutants: { pm25: 245, pm10: 380, no2: 110, so2: 85, co: 7.5 },
    sources: { vehicular: 30, construction: 15, industrial: 45, waste_burning: 10 },
    forecast: { hours24: 310, hours48: 325 },
    alerts: ['Industrial emissions spike', 'Dense traffic in Chandni Chowk'],
    priority: 2,
  },
  {
    id: 'W003',
    name: 'North Delhi',
    coordinates_path: 'M 90 60 L 200 55 L 220 85 L 230 120 L 225 160 L 210 190 L 180 205 L 150 200 L 120 180 L 100 150 L 90 110 L 90 60 Z',
    center_x: 160,
    center_y: 130,
    aqi: 185,
    category: 'Moderate',
    pollutants: { pm25: 125, pm10: 195, no2: 55, so2: 25, co: 4.2 },
    sources: { vehicular: 50, construction: 20, industrial: 15, waste_burning: 15 },
    forecast: { hours24: 195, hours48: 210 },
    alerts: [],
    priority: 5,
  },
  {
    id: 'W004',
    name: 'East Delhi',
    coordinates_path: 'M 180 210 L 260 205 L 280 240 L 290 280 L 285 320 L 270 350 L 240 365 L 210 360 L 180 340 L 165 300 L 170 250 L 180 210 Z',
    center_x: 235,
    center_y: 285,
    aqi: 265,
    category: 'Poor',
    pollutants: { pm25: 195, pm10: 310, no2: 75, so2: 35, co: 6.1 },
    sources: { vehicular: 55, construction: 30, industrial: 10, waste_burning: 5 },
    forecast: { hours24: 280, hours48: 290 },
    alerts: ['Traffic congestion expected', 'High population density'],
    priority: 3,
  },
  {
    id: 'W005',
    name: 'South Delhi',
    coordinates_path: 'M 360 210 L 460 205 L 490 240 L 500 290 L 495 340 L 480 370 L 450 385 L 410 380 L 370 360 L 350 320 L 355 260 L 360 210 Z',
    center_x: 425,
    center_y: 295,
    aqi: 142,
    category: 'Moderate',
    pollutants: { pm25: 95, pm10: 155, no2: 45, so2: 20, co: 3.5 },
    sources: { vehicular: 40, construction: 25, industrial: 20, waste_burning: 15 },
    forecast: { hours24: 155, hours48: 165 },
    alerts: [],
    priority: 6,
  },
  {
    id: 'W006',
    name: 'West Delhi',
    coordinates_path: 'M 320 110 L 420 105 L 440 140 L 450 180 L 445 220 L 430 250 L 400 265 L 370 260 L 340 240 L 320 200 L 315 150 L 320 110 Z',
    center_x: 380,
    center_y: 185,
    aqi: 95,
    category: 'Satisfactory',
    pollutants: { pm25: 65, pm10: 105, no2: 30, so2: 15, co: 2.1 },
    sources: { vehicular: 35, construction: 20, industrial: 25, waste_burning: 20 },
    forecast: { hours24: 105, hours48: 115 },
    alerts: [],
    priority: 8,
  },
  {
    id: 'W007',
    name: 'North East Delhi',
    coordinates_path: 'M 260 260 L 340 255 L 360 290 L 370 330 L 365 370 L 350 390 L 320 395 L 290 390 L 260 370 L 245 330 L 250 280 L 260 260 Z',
    center_x: 315,
    center_y: 325,
    aqi: 312,
    category: 'Severe',
    pollutants: { pm25: 265, pm10: 395, no2: 105, so2: 50, co: 8.8 },
    sources: { vehicular: 60, construction: 20, industrial: 15, waste_burning: 5 },
    forecast: { hours24: 335, hours48: 350 },
    alerts: ['Heavy traffic flow', 'Road dust accumulation', 'Industrial area'],
    priority: 2,
  },
  {
    id: 'W008',
    name: 'South West Delhi',
    coordinates_path: 'M 460 160 L 540 155 L 560 190 L 570 240 L 565 290 L 550 320 L 520 335 L 490 330 L 460 310 L 445 270 L 450 210 L 460 160 Z',
    center_x: 510,
    center_y: 245,
    aqi: 225,
    category: 'Poor',
    pollutants: { pm25: 165, pm10: 265, no2: 65, so2: 30, co: 5.5 },
    sources: { vehicular: 45, construction: 30, industrial: 15, waste_burning: 10 },
    forecast: { hours24: 240, hours48: 250 },
    alerts: ['Construction activity', 'Metro expansion work'],
    priority: 4,
  },
];

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding database...');
    
    await client.query('BEGIN');
    
    // Clear existing data
    await client.query('TRUNCATE TABLE alerts, forecasts, pollution_sources, aqi_data, time_series_data, weather_data, wards CASCADE');
    
    // Insert wards
    for (const ward of wards) {
      await client.query(
        `INSERT INTO wards (id, name, coordinates_path, center_x, center_y) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name, 
         coordinates_path = EXCLUDED.coordinates_path,
         center_x = EXCLUDED.center_x,
         center_y = EXCLUDED.center_y,
         updated_at = CURRENT_TIMESTAMP`,
        [ward.id, ward.name, ward.coordinates_path, ward.center_x, ward.center_y]
      );
      
      // Insert AQI data
      await client.query(
        `INSERT INTO aqi_data (ward_id, aqi, category, pm25, pm10, no2, so2, co) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          ward.id,
          ward.aqi,
          ward.category,
          ward.pollutants.pm25,
          ward.pollutants.pm10,
          ward.pollutants.no2,
          ward.pollutants.so2,
          ward.pollutants.co,
        ]
      );
      
      // Insert pollution sources
      await client.query(
        `INSERT INTO pollution_sources (ward_id, vehicular, construction, industrial, waste_burning) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          ward.id,
          ward.sources.vehicular,
          ward.sources.construction,
          ward.sources.industrial,
          ward.sources.waste_burning,
        ]
      );
      
      // Insert forecast
      await client.query(
        `INSERT INTO forecasts (ward_id, hours_24, hours_48) 
         VALUES ($1, $2, $3)`,
        [ward.id, ward.forecast.hours24, ward.forecast.hours48]
      );
      
      // Insert alerts
      for (const alertMessage of ward.alerts) {
        await client.query(
          `INSERT INTO alerts (ward_id, message, priority, is_active) 
           VALUES ($1, $2, $3, true)`,
          [ward.id, alertMessage, ward.priority]
        );
      }
      
      // Insert time series data (last 7 days)
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const aqiVariation = ward.aqi + (Math.random() * 40 - 20);
        const pm25Variation = ward.pollutants.pm25 + (Math.random() * 30 - 15);
        const pm10Variation = ward.pollutants.pm10 + (Math.random() * 40 - 20);
        
        await client.query(
          `INSERT INTO time_series_data (ward_id, date, aqi, pm25, pm10) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (ward_id, date) DO UPDATE SET 
           aqi = EXCLUDED.aqi, pm25 = EXCLUDED.pm25, pm10 = EXCLUDED.pm10`,
          [
            ward.id,
            date.toISOString().split('T')[0],
            Math.max(0, Math.round(aqiVariation)),
            Math.max(0, Math.round(pm25Variation)),
            Math.max(0, Math.round(pm10Variation)),
          ]
        );
      }
      
      // Insert weather data
      await client.query(
        `INSERT INTO weather_data (ward_id, wind_speed, temperature, humidity) 
         VALUES ($1, $2, $3, $4)`,
        [ward.id, 8.5, 28, 65]
      );
    }
    
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
    console.log(`   Inserted ${wards.length} wards with complete data`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

seed().catch(() => process.exit(1));

