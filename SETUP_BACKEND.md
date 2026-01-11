# Backend Setup Guide

Quick setup guide for the Ward-Wise Pollution Dashboard backend.

## Prerequisites

1. **PostgreSQL** - Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
2. **Node.js 18+** - Already installed if you can run `npm`

## Step-by-Step Setup

### 1. Install PostgreSQL

Download and install PostgreSQL for Windows. During installation:
- Remember the password you set for the `postgres` user
- Default port is `5432`

### 2. Create Database

Open **pgAdmin** (comes with PostgreSQL) or use **Command Prompt**:

```bash
# Using psql (if in PATH)
psql -U postgres
CREATE DATABASE ward_pollution_db;
\q
```

Or using pgAdmin:
1. Right-click "Databases" → "Create" → "Database"
2. Name: `ward_pollution_db`
3. Click "Save"

### 3. Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

Edit `backend\.env` file with a text editor:

```
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ward_pollution_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

CORS_ORIGIN=http://localhost:5173
```

Replace `your_postgres_password_here` with your PostgreSQL password.

### 4. Set Up Database Schema

```bash
cd backend
npm run db:migrate
```

This creates all tables and indexes.

### 5. Seed Database with Initial Data

```bash
npm run db:seed
```

This populates the database with all 8 Delhi wards and their data.

### 6. Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
✅ Database connected
```

### 7. Test Backend

Open browser and go to: `http://localhost:3001/health`

You should see: `{"status":"ok","timestamp":"..."}`

## Troubleshooting

### "Database connection error"

- Check PostgreSQL is running (Windows Services → PostgreSQL)
- Verify username and password in `.env`
- Check database `ward_pollution_db` exists

### "relation does not exist"

- Run migration: `npm run db:migrate`

### Port already in use

- Change `PORT` in `.env` to a different number (e.g., 3002)

## Next Steps

Once the backend is running, start the frontend:

```bash
# In project root (new terminal)
npm run dev
```

The frontend will automatically connect to the backend API.









