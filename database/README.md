# Flame-X Database

This folder contains all SQL scripts for the Flame-X firefighting robot monitoring system.

## Files

1. **01_schema.sql** — Creates all tables, indexes, and constraints
2. **02_seed.sql** — Populates initial data (zones, sensors, robot, sample events)
3. **03_queries.sql** — Query library for all application features
4. **04_rls.sql** — Row Level Security policies for Supabase

## Setup Instructions

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://hoqgildrfsuzrdtxxeor.supabase.co
2. Navigate to **SQL Editor**
3. Run each file in order:
   - `01_schema.sql`
   - `02_seed.sql`
   - `04_rls.sql`

### Option 2: Command Line (psql)

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hoqgildrfsuzrdtxxeor.supabase.co:5432/postgres"

# Run all scripts in order
psql $DATABASE_URL -f 01_schema.sql
psql $DATABASE_URL -f 02_seed.sql
psql $DATABASE_URL -f 04_rls.sql
```

### Option 3: Supabase CLI

```bash
supabase db push
```

## Database Schema Overview

### Core Tables

- **zones** — Physical zones monitored by the system
- **sensors** — Deployed sensors (gas, flame, smoke, temperature)
- **sensor_readings** — Time-series sensor data
- **fire_events** — Detected fire incidents
- **robot** — Robot status and telemetry
- **robot_diagnostics** — Per-component health checks
- **missions** — Robot deployment missions
- **alerts** — System-generated alerts
- **activity_logs** — Audit trail of all events
- **system_settings** — Key-value configuration

### Relationships

```
zones
  ├─ sensors
  │   └─ sensor_readings
  ├─ fire_events
  │   └─ missions
  └─ alerts

robot
  ├─ robot_diagnostics
  └─ missions
```

## Query Reference

See `03_queries.sql` for all application queries organized by feature:

- Dashboard / Stats
- Temperature monitoring
- Gas sensors
- Fire events
- Robot status
- Alerts
- Activity logs
- System settings

## Security

Row Level Security (RLS) is enabled on all tables:

- **anon role** (frontend) — Read-only access
- **service_role** (backend) — Full access for writes

See `04_rls.sql` for policy details.

## Data Retention

Sensor readings are retained based on the `data_retention_days` setting (default: 30 days).

Run this periodically via cron:

```sql
DELETE FROM sensor_readings
WHERE recorded_at < NOW() - (
  SELECT value::int FROM system_settings WHERE key = 'data_retention_days'
) * INTERVAL '1 day';
```
