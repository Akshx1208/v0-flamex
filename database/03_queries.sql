-- ============================================================
-- FLAME-X QUERY LIBRARY
-- All application queries organised by feature
-- ============================================================


-- ============================================================
-- DASHBOARD / STATS
-- ============================================================

-- Latest temperature reading across all sensors
SELECT
  z.name AS zone,
  sr.value AS temperature_c,
  sr.recorded_at
FROM sensor_readings sr
JOIN sensors s ON s.id = sr.sensor_id
JOIN zones z   ON z.id = s.zone_id
WHERE s.type = 'temperature'
  AND sr.recorded_at = (
    SELECT MAX(recorded_at)
    FROM sensor_readings
    WHERE sensor_id = sr.sensor_id
  )
ORDER BY sr.value DESC;

-- Current average temperature across all zones
SELECT ROUND(AVG(sr.value), 1) AS avg_temp_c
FROM sensor_readings sr
JOIN sensors s ON s.id = sr.sensor_id
WHERE s.type = 'temperature'
  AND sr.recorded_at >= NOW() - INTERVAL '1 hour';

-- Latest gas reading (highest across all gas sensors)
SELECT MAX(sr.value) AS max_gas_ppm
FROM sensor_readings sr
JOIN sensors s ON s.id = sr.sensor_id
WHERE s.type = 'gas'
  AND sr.recorded_at >= NOW() - INTERVAL '1 hour';

-- Fire events count in last 24 hours
SELECT COUNT(*) AS fire_events_24h
FROM fire_events
WHERE detected_at >= NOW() - INTERVAL '24 hours';

-- System health: percentage of sensors with recent readings
SELECT
  ROUND(
    100.0 * COUNT(CASE WHEN last_reading.recorded_at >= NOW() - INTERVAL '5 minutes' THEN 1 END)
    / NULLIF(COUNT(*), 0),
    1
  ) AS system_health_pct
FROM sensors s
LEFT JOIN LATERAL (
  SELECT recorded_at
  FROM sensor_readings
  WHERE sensor_id = s.id
  ORDER BY recorded_at DESC
  LIMIT 1
) last_reading ON TRUE
WHERE s.is_active = TRUE;


-- ============================================================
-- TEMPERATURE
-- ============================================================

-- 24-hour temperature readings for chart (hourly buckets)
SELECT
  DATE_TRUNC('hour', sr.recorded_at) AS hour,
  ROUND(AVG(sr.value), 1)            AS avg_temp_c
FROM sensor_readings sr
JOIN sensors s ON s.id = sr.sensor_id
WHERE s.type = 'temperature'
  AND sr.recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY 1;

-- Current temperature per zone
SELECT
  z.id,
  z.name,
  ROUND(AVG(sr.value), 1) AS current_temp_c,
  CASE
    WHEN AVG(sr.value) >= (SELECT value::numeric FROM system_settings WHERE key = 'temp_critical_threshold_c') THEN 'critical'
    WHEN AVG(sr.value) >= (SELECT value::numeric FROM system_settings WHERE key = 'temp_warning_threshold_c')  THEN 'warning'
    ELSE 'normal'
  END AS status
FROM zones z
JOIN sensors s ON s.zone_id = z.id AND s.type = 'temperature'
JOIN sensor_readings sr ON sr.sensor_id = s.id
  AND sr.recorded_at >= NOW() - INTERVAL '5 minutes'
GROUP BY z.id, z.name
ORDER BY current_temp_c DESC;

-- Min/max temperature per zone (all time)
SELECT
  z.name,
  ROUND(MIN(sr.value), 1) AS min_temp_c,
  ROUND(MAX(sr.value), 1) AS max_temp_c
FROM sensor_readings sr
JOIN sensors s ON s.id = sr.sensor_id AND s.type = 'temperature'
JOIN zones z   ON z.id = s.zone_id
GROUP BY z.name
ORDER BY z.name;


-- ============================================================
-- GAS SENSORS
-- ============================================================

-- Latest reading per sensor
SELECT
  s.id,
  s.name,
  s.type,
  s.unit,
  s.max_value,
  z.name AS zone,
  sr.value,
  sr.recorded_at,
  CASE
    WHEN s.type = 'gas'   AND sr.value >= (SELECT value::numeric FROM system_settings WHERE key = 'gas_critical_threshold_ppm') THEN 'critical'
    WHEN s.type = 'gas'   AND sr.value >= (SELECT value::numeric FROM system_settings WHERE key = 'gas_warning_threshold_ppm')  THEN 'warning'
    WHEN s.type = 'smoke' AND sr.value >= (SELECT value::numeric FROM system_settings WHERE key = 'smoke_warning_threshold')    THEN 'warning'
    WHEN sr.value > 0 AND s.type = 'flame' THEN 'warning'
    ELSE 'normal'
  END AS status
FROM sensors s
JOIN zones z ON z.id = s.zone_id
JOIN LATERAL (
  SELECT value, recorded_at
  FROM sensor_readings
  WHERE sensor_id = s.id
  ORDER BY recorded_at DESC
  LIMIT 1
) sr ON TRUE
WHERE s.is_active = TRUE
ORDER BY s.type, z.name;

-- Sensor readings for chart (last 60 minutes, 5-min buckets)
SELECT
  DATE_TRUNC('minute', sr.recorded_at) - 
    (EXTRACT(MINUTE FROM sr.recorded_at)::int % 5) * INTERVAL '1 minute' AS bucket,
  s.type,
  ROUND(AVG(sr.value), 1) AS avg_value
FROM sensor_readings sr
JOIN sensors s ON s.id = sr.sensor_id
WHERE sr.recorded_at >= NOW() - INTERVAL '60 minutes'
  AND s.type IN ('gas', 'flame', 'smoke')
GROUP BY 1, 2
ORDER BY 1, 2;


-- ============================================================
-- FIRE EVENTS
-- ============================================================

-- All fire events with zone name
SELECT
  fe.id,
  z.name AS zone,
  fe.severity,
  fe.status,
  fe.detected_at,
  fe.extinguished_at,
  fe.response_time_s,
  fe.notes
FROM fire_events fe
JOIN zones z ON z.id = fe.zone_id
ORDER BY fe.detected_at DESC;

-- Weekly fire events count (detected vs extinguished per day)
SELECT
  TO_CHAR(DATE_TRUNC('day', detected_at), 'Dy') AS day,
  COUNT(*)                                        AS detected,
  COUNT(CASE WHEN status = 'extinguished' THEN 1 END) AS extinguished
FROM fire_events
WHERE detected_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', detected_at)
ORDER BY DATE_TRUNC('day', detected_at);

-- Fire event summary stats (last 7 days)
SELECT
  COUNT(*)                                                    AS total_events,
  COUNT(CASE WHEN status = 'extinguished' THEN 1 END)        AS extinguished,
  ROUND(AVG(response_time_s) / 60.0, 1)                      AS avg_response_min
FROM fire_events
WHERE detected_at >= NOW() - INTERVAL '7 days';

-- Insert a new fire event
-- INSERT INTO fire_events (zone_id, severity, status)
-- VALUES (:zone_id, :severity, 'detected');

-- Update fire event to extinguished
-- UPDATE fire_events
-- SET status = 'extinguished',
--     extinguished_at = NOW(),
--     response_time_s = EXTRACT(EPOCH FROM (NOW() - detected_at))::int
-- WHERE id = :id;


-- ============================================================
-- ROBOT
-- ============================================================

-- Get current robot status
SELECT
  r.id,
  r.name,
  r.status,
  r.battery_pct,
  r.water_tank_pct,
  r.signal_pct,
  r.motor_speed_rpm,
  r.cpu_usage_pct,
  r.core_temp_c,
  r.uptime_seconds,
  r.last_seen_at,
  z.name AS current_zone
FROM robot r
LEFT JOIN zones z ON z.id = r.current_zone_id
LIMIT 1;

-- Update robot telemetry
-- UPDATE robot
-- SET battery_pct     = :battery_pct,
--     water_tank_pct  = :water_tank_pct,
--     signal_pct      = :signal_pct,
--     motor_speed_rpm = :motor_speed_rpm,
--     cpu_usage_pct   = :cpu_usage_pct,
--     core_temp_c     = :core_temp_c,
--     uptime_seconds  = :uptime_seconds,
--     status          = :status,
--     current_zone_id = :zone_id,
--     last_seen_at    = NOW()
-- WHERE id = :id;

-- Latest diagnostics per component
SELECT DISTINCT ON (component)
  component,
  status,
  detail,
  checked_at
FROM robot_diagnostics
WHERE robot_id = (SELECT id FROM robot LIMIT 1)
ORDER BY component, checked_at DESC;

-- Mission log
SELECT
  m.id,
  m.type,
  m.description,
  m.result,
  m.started_at,
  m.ended_at,
  m.duration_s,
  z.name AS zone
FROM missions m
LEFT JOIN fire_events fe ON fe.id = m.fire_event_id
LEFT JOIN zones z        ON z.id  = fe.zone_id
ORDER BY m.started_at DESC
LIMIT 20;

-- Insert a new mission
-- INSERT INTO missions (robot_id, fire_event_id, type, description, result)
-- VALUES (:robot_id, :fire_event_id, :type, :description, 'pending');

-- Close a mission
-- UPDATE missions
-- SET result    = :result,
--     ended_at  = NOW(),
--     duration_s = EXTRACT(EPOCH FROM (NOW() - started_at))::int
-- WHERE id = :id;


-- ============================================================
-- ALERTS
-- ============================================================

-- All active (unresolved) alerts
SELECT
  a.id,
  a.title,
  a.description,
  a.severity,
  a.category,
  a.acknowledged,
  a.created_at,
  z.name AS zone
FROM alerts a
LEFT JOIN zones z ON z.id = a.zone_id
WHERE a.is_resolved = FALSE
ORDER BY
  CASE a.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
  a.created_at DESC;

-- All resolved alerts
SELECT
  a.id,
  a.title,
  a.description,
  a.severity,
  a.category,
  a.resolved_at,
  z.name AS zone
FROM alerts a
LEFT JOIN zones z ON z.id = a.zone_id
WHERE a.is_resolved = TRUE
ORDER BY a.resolved_at DESC
LIMIT 50;

-- Alert counts summary
SELECT
  COUNT(CASE WHEN is_resolved = FALSE THEN 1 END)                          AS active_count,
  COUNT(CASE WHEN is_resolved = FALSE AND acknowledged = FALSE THEN 1 END) AS pending_review,
  COUNT(CASE WHEN is_resolved = TRUE  AND resolved_at >= NOW() - INTERVAL '24 hours' THEN 1 END) AS resolved_today
FROM alerts;

-- Acknowledge an alert
-- UPDATE alerts SET acknowledged = TRUE WHERE id = :id;

-- Resolve an alert
-- UPDATE alerts SET is_resolved = TRUE, resolved_at = NOW() WHERE id = :id;

-- Insert a new alert
-- INSERT INTO alerts (title, description, severity, category, zone_id)
-- VALUES (:title, :description, :severity, :category, :zone_id);


-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

-- Recent activity (last 50 entries)
SELECT
  al.id,
  al.type,
  al.category,
  al.message,
  al.metadata,
  al.created_at,
  z.name AS zone
FROM activity_logs al
LEFT JOIN zones z ON z.id = al.zone_id
ORDER BY al.created_at DESC
LIMIT 50;

-- Activity count by category
SELECT
  category,
  COUNT(*) AS event_count
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY category
ORDER BY event_count DESC;

-- Insert an activity log entry
-- INSERT INTO activity_logs (type, category, message, zone_id, metadata)
-- VALUES (:type, :category, :message, :zone_id, :metadata);


-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

-- Get all settings
SELECT key, value, description, updated_at
FROM system_settings
ORDER BY key;

-- Get a single setting
-- SELECT value FROM system_settings WHERE key = :key;

-- Update a setting
-- UPDATE system_settings
-- SET value = :value, updated_at = NOW()
-- WHERE key = :key;


-- ============================================================
-- SENSOR READINGS — INSERT (used by IoT / backend ingestion)
-- ============================================================

-- Insert a new sensor reading
-- INSERT INTO sensor_readings (sensor_id, value)
-- VALUES (:sensor_id, :value);

-- Bulk insert multiple readings
-- INSERT INTO sensor_readings (sensor_id, value, recorded_at)
-- VALUES
--   (:sensor_id_1, :value_1, :ts_1),
--   (:sensor_id_2, :value_2, :ts_2);

-- Purge old readings (run via cron based on data_retention_days setting)
-- DELETE FROM sensor_readings
-- WHERE recorded_at < NOW() - (
--   SELECT value::int FROM system_settings WHERE key = 'data_retention_days'
-- ) * INTERVAL '1 day';
