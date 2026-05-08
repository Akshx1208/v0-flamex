-- ============================================================
-- FLAME-X SEED DATA
-- Run after 01_schema.sql to populate initial data
-- ============================================================

-- ============================================================
-- ZONES
-- ============================================================
INSERT INTO zones (id, name, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Zone A - Sector 1', 'Main entrance area'),
  ('11111111-0000-0000-0000-000000000002', 'Zone A - Sector 2', 'Lab area'),
  ('11111111-0000-0000-0000-000000000003', 'Zone A - Sector 3', 'Robot charging bay'),
  ('11111111-0000-0000-0000-000000000004', 'Zone B - Sector 1', 'Storage room A'),
  ('11111111-0000-0000-0000-000000000005', 'Zone B - Sector 2', 'Storage room B'),
  ('11111111-0000-0000-0000-000000000006', 'Zone B - Sector 3', 'Corridor B'),
  ('11111111-0000-0000-0000-000000000007', 'Zone C - Sector 1', 'Server room'),
  ('11111111-0000-0000-0000-000000000008', 'Zone C - Sector 2', 'Office area'),
  ('11111111-0000-0000-0000-000000000009', 'Zone C - Sector 4', 'Utility room')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SENSORS
-- ============================================================
INSERT INTO sensors (id, zone_id, name, type, unit, max_value) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'MQ-2 Gas Sensor',    'gas',         'ppm',       300),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'IR Flame Sensor',    'flame',       'intensity', 100),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 'Smoke Detector',     'smoke',       'density',   100),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000005', 'MQ-7 CO Sensor',     'gas',         'ppm',       200),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000007', 'IR Flame Sensor',    'flame',       'intensity', 100),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000008', 'Smoke Detector',     'smoke',       'density',   100),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'Temp Sensor A1',     'temperature', 'celsius',   120),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000002', 'Temp Sensor A2',     'temperature', 'celsius',   120),
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000004', 'Temp Sensor B1',     'temperature', 'celsius',   120),
  ('22222222-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000005', 'Temp Sensor B2',     'temperature', 'celsius',   120),
  ('22222222-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000007', 'Temp Sensor C1',     'temperature', 'celsius',   120),
  ('22222222-0000-0000-0000-000000000012', '11111111-0000-0000-0000-000000000008', 'Temp Sensor C2',     'temperature', 'celsius',   120)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROBOT
-- ============================================================
INSERT INTO robot (id, name, status, battery_pct, water_tank_pct, signal_pct, motor_speed_rpm, current_zone_id, cpu_usage_pct, core_temp_c, uptime_seconds) VALUES
  ('33333333-0000-0000-0000-000000000001', 'Flame-X', 'idle', 85, 72, 95, 60, '11111111-0000-0000-0000-000000000003', 34, 52, 24120)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROBOT DIAGNOSTICS
-- ============================================================
INSERT INTO robot_diagnostics (robot_id, component, status, detail) VALUES
  ('33333333-0000-0000-0000-000000000001', 'Main Controller',      'ok',      'Operating normally'),
  ('33333333-0000-0000-0000-000000000001', 'Motor Driver',         'ok',      'All 4 motors responsive'),
  ('33333333-0000-0000-0000-000000000001', 'Pump System',          'ok',      'Pressure: 2.4 bar'),
  ('33333333-0000-0000-0000-000000000001', 'Sensor Array',         'ok',      '6/6 sensors active'),
  ('33333333-0000-0000-0000-000000000001', 'Communication Module', 'ok',      'Signal: -42 dBm'),
  ('33333333-0000-0000-0000-000000000001', 'Navigation System',    'warning', 'Recalibration recommended');

-- ============================================================
-- FIRE EVENTS
-- ============================================================
INSERT INTO fire_events (zone_id, severity, status, detected_at, extinguished_at, response_time_s) VALUES
  ('11111111-0000-0000-0000-000000000005', 'high',   'extinguished', NOW() - INTERVAL '2 hours',   NOW() - INTERVAL '2 hours'   + INTERVAL '4 minutes 32 seconds', 272),
  ('11111111-0000-0000-0000-000000000001', 'medium', 'extinguished', NOW() - INTERVAL '4 hours',   NOW() - INTERVAL '4 hours'   + INTERVAL '3 minutes 10 seconds', 190),
  ('11111111-0000-0000-0000-000000000009', 'low',    'extinguished', NOW() - INTERVAL '1 day',     NOW() - INTERVAL '1 day'     + INTERVAL '2 minutes 45 seconds', 165),
  ('11111111-0000-0000-0000-000000000006', 'high',   'extinguished', NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours' + INTERVAL '5 minutes', 300),
  ('11111111-0000-0000-0000-000000000002', 'medium', 'extinguished', NOW() - INTERVAL '2 days',    NOW() - INTERVAL '2 days'    + INTERVAL '3 minutes 55 seconds', 235);

-- ============================================================
-- MISSIONS
-- ============================================================
INSERT INTO missions (robot_id, type, description, result, started_at, ended_at, duration_s) VALUES
  ('33333333-0000-0000-0000-000000000001', 'fire_suppression', 'Fire suppression - Zone B Sector 2', 'success', NOW() - INTERVAL '2 hours',   NOW() - INTERVAL '2 hours'   + INTERVAL '4 minutes 32 seconds', 272),
  ('33333333-0000-0000-0000-000000000001', 'patrol',           'Patrol - Zone A full sweep',         'success', NOW() - INTERVAL '3 hours',   NOW() - INTERVAL '3 hours'   + INTERVAL '12 minutes 10 seconds', 730),
  ('33333333-0000-0000-0000-000000000001', 'fire_suppression', 'Fire suppression - Zone A Sector 1', 'success', NOW() - INTERVAL '1 day',     NOW() - INTERVAL '1 day'     + INTERVAL '3 minutes 55 seconds', 235);

-- ============================================================
-- ALERTS
-- ============================================================
INSERT INTO alerts (title, description, severity, category, zone_id, is_resolved, acknowledged) VALUES
  ('High Temperature Warning',    'Zone B - Sector 2 temperature reached 67°C, exceeding the 60°C threshold.', 'critical', 'sensor', '11111111-0000-0000-0000-000000000005', FALSE, FALSE),
  ('Smoke Density Elevated',      'Smoke density in Zone B - Sector 1 is at 45/100, approaching warning level.', 'warning', 'sensor', '11111111-0000-0000-0000-000000000004', FALSE, FALSE),
  ('Gas Sensor Calibration Due',  'MQ-2 gas sensor in Zone A - Sector 1 requires recalibration for accurate readings.', 'info', 'sensor', '11111111-0000-0000-0000-000000000001', FALSE, FALSE),
  ('Fire Detected & Extinguished','Fire event in Zone B - Sector 2 was detected and successfully extinguished.', 'critical', 'fire',   '11111111-0000-0000-0000-000000000005', TRUE,  TRUE),
  ('Temperature Spike - Zone A',  'Temperature briefly exceeded threshold in Zone A - Sector 1. Returned to normal.', 'warning', 'sensor', '11111111-0000-0000-0000-000000000001', TRUE, TRUE);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
INSERT INTO activity_logs (type, category, message, zone_id, created_at) VALUES
  ('fire_detected',    'fire',   'Fire detected in Zone B - Sector 2',          '11111111-0000-0000-0000-000000000005', NOW() - INTERVAL '2 hours'),
  ('robot_deployed',   'robot',  'Robot deployed to Zone B - Sector 2',         '11111111-0000-0000-0000-000000000005', NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds'),
  ('fire_extinguished','fire',   'Fire successfully extinguished in Zone B',     '11111111-0000-0000-0000-000000000005', NOW() - INTERVAL '2 hours' + INTERVAL '4 minutes 32 seconds'),
  ('temp_warning',     'sensor', 'High temperature alert: 58°C in Zone A',      '11111111-0000-0000-0000-000000000001', NOW() - INTERVAL '4 hours'),
  ('system_alert',     'system', 'System maintenance scheduled for 2:00 AM',    NULL,                                   NOW() - INTERVAL '5 hours'),
  ('sensor_warning',   'sensor', 'Gas sensor calibration required - MQ-2',      '11111111-0000-0000-0000-000000000001', NOW() - INTERVAL '6 hours'),
  ('robot_returned',   'robot',  'Robot returned to charging station',           '11111111-0000-0000-0000-000000000003', NOW() - INTERVAL '1 hour 30 minutes'),
  ('system_check',     'system', 'Daily system health check passed',             NULL,                                   NOW() - INTERVAL '10 hours'),
  ('fire_detected',    'fire',   'Fire detected in Zone A - Sector 1',          '11111111-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day'),
  ('fire_extinguished','fire',   'Fire extinguished in Zone A - Sector 1',      '11111111-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes 55 seconds');

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
  ('temp_warning_threshold_c',   '55',   'Temperature warning alert threshold in Celsius'),
  ('temp_critical_threshold_c',  '70',   'Temperature critical alert threshold in Celsius'),
  ('gas_warning_threshold_ppm',  '150',  'Gas level warning threshold in PPM'),
  ('gas_critical_threshold_ppm', '250',  'Gas level critical threshold in PPM'),
  ('smoke_warning_threshold',    '50',   'Smoke density warning threshold (0-100)'),
  ('robot_max_speed_rpm',        '120',  'Robot maximum motor speed in RPM'),
  ('robot_spray_duration_s',     '30',   'Water spray duration per activation in seconds'),
  ('robot_auto_deploy',          'true', 'Auto-deploy robot on fire detection'),
  ('robot_return_after_mission', 'true', 'Return robot to base after mission completes'),
  ('robot_low_battery_pct',      '20',   'Battery percentage to trigger low battery alert'),
  ('data_retention_days',        '30',   'Number of days to retain sensor readings'),
  ('firmware_version',           'v2.4.1', 'Current robot firmware version')
ON CONFLICT (key) DO NOTHING;
