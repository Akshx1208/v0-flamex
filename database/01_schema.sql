-- ============================================================
-- FLAME-X DATABASE SCHEMA
-- Run this first to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ZONES
-- Physical zones monitored by the system
-- ============================================================
CREATE TABLE IF NOT EXISTS zones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,          -- e.g. 'Zone A - Sector 1'
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SENSORS
-- Physical sensors deployed in zones
-- ============================================================
CREATE TABLE IF NOT EXISTS sensors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id     UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                 -- e.g. 'MQ-2 Gas Sensor'
  type        TEXT NOT NULL                  -- 'gas' | 'flame' | 'smoke' | 'temperature'
                CHECK (type IN ('gas', 'flame', 'smoke', 'temperature')),
  unit        TEXT NOT NULL,                 -- 'ppm' | 'intensity' | 'density' | 'celsius'
  max_value   NUMERIC NOT NULL DEFAULT 100,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SENSOR READINGS
-- Time-series readings from each sensor
-- ============================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id   UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value       NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast time-range queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time
  ON sensor_readings (sensor_id, recorded_at DESC);

-- ============================================================
-- FIRE EVENTS
-- Detected fire incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS fire_events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id          UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  severity         TEXT NOT NULL DEFAULT 'medium'
                     CHECK (severity IN ('low', 'medium', 'high')),
  status           TEXT NOT NULL DEFAULT 'detected'
                     CHECK (status IN ('detected', 'responding', 'extinguished')),
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extinguished_at  TIMESTAMPTZ,
  response_time_s  INTEGER,                  -- seconds from detection to extinguish
  notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_fire_events_zone
  ON fire_events (zone_id, detected_at DESC);

-- ============================================================
-- ROBOT
-- Single robot record (expandable to fleet)
-- ============================================================
CREATE TABLE IF NOT EXISTS robot (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL DEFAULT 'Flame-X',
  status           TEXT NOT NULL DEFAULT 'idle'
                     CHECK (status IN ('idle', 'patrolling', 'deployed', 'charging', 'offline')),
  battery_pct      INTEGER NOT NULL DEFAULT 100 CHECK (battery_pct BETWEEN 0 AND 100),
  water_tank_pct   INTEGER NOT NULL DEFAULT 100 CHECK (water_tank_pct BETWEEN 0 AND 100),
  signal_pct       INTEGER NOT NULL DEFAULT 100 CHECK (signal_pct BETWEEN 0 AND 100),
  motor_speed_rpm  INTEGER NOT NULL DEFAULT 0,
  current_zone_id  UUID REFERENCES zones(id),
  cpu_usage_pct    INTEGER DEFAULT 0,
  core_temp_c      INTEGER DEFAULT 0,
  uptime_seconds   INTEGER DEFAULT 0,
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROBOT DIAGNOSTICS
-- Per-component health checks
-- ============================================================
CREATE TABLE IF NOT EXISTS robot_diagnostics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  robot_id    UUID NOT NULL REFERENCES robot(id) ON DELETE CASCADE,
  component   TEXT NOT NULL,                 -- e.g. 'Main Controller'
  status      TEXT NOT NULL DEFAULT 'ok'
                CHECK (status IN ('ok', 'warning', 'error')),
  detail      TEXT,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MISSIONS
-- Robot deployment missions
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  robot_id        UUID NOT NULL REFERENCES robot(id) ON DELETE CASCADE,
  fire_event_id   UUID REFERENCES fire_events(id),
  type            TEXT NOT NULL DEFAULT 'fire_suppression'
                    CHECK (type IN ('fire_suppression', 'patrol', 'inspection')),
  description     TEXT NOT NULL,
  result          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (result IN ('pending', 'success', 'failed', 'aborted')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_s      INTEGER                    -- computed on close
);

CREATE INDEX IF NOT EXISTS idx_missions_robot
  ON missions (robot_id, started_at DESC);

-- ============================================================
-- ALERTS
-- System-generated alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  severity       TEXT NOT NULL DEFAULT 'info'
                   CHECK (severity IN ('info', 'warning', 'critical')),
  category       TEXT NOT NULL DEFAULT 'system'
                   CHECK (category IN ('fire', 'sensor', 'robot', 'system')),
  zone_id        UUID REFERENCES zones(id),
  is_resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged   BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_unresolved
  ON alerts (is_resolved, created_at DESC);

-- ============================================================
-- ACTIVITY LOGS
-- Append-only audit trail of all system events
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL,                 -- 'fire_detected' | 'robot_deployed' | etc.
  category    TEXT NOT NULL DEFAULT 'system'
                CHECK (category IN ('fire', 'robot', 'sensor', 'system')),
  message     TEXT NOT NULL,
  zone_id     UUID REFERENCES zones(id),
  metadata    JSONB,                         -- flexible extra data
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_time
  ON activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_category
  ON activity_logs (category, created_at DESC);

-- ============================================================
-- SYSTEM SETTINGS
-- Key-value config store
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
