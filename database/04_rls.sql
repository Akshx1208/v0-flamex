-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Run after schema. Locks down tables for Supabase anon/service roles.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE zones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fire_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot             ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- READ-ONLY policies for anon (dashboard viewers)
-- ============================================================
CREATE POLICY "anon_read_zones"           ON zones             FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_sensors"         ON sensors           FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_sensor_readings" ON sensor_readings   FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_fire_events"     ON fire_events       FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_robot"           ON robot             FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_diagnostics"     ON robot_diagnostics FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_missions"        ON missions          FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_alerts"          ON alerts            FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_activity_logs"   ON activity_logs     FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_settings"        ON system_settings   FOR SELECT TO anon USING (TRUE);

-- ============================================================
-- FULL ACCESS for service_role (backend / IoT ingestion)
-- ============================================================
CREATE POLICY "service_all_zones"             ON zones             FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_sensors"           ON sensors           FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_sensor_readings"   ON sensor_readings   FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_fire_events"       ON fire_events       FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_robot"             ON robot             FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_robot_diagnostics" ON robot_diagnostics FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_missions"          ON missions          FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_alerts"            ON alerts            FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_activity_logs"     ON activity_logs     FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_all_settings"          ON system_settings   FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
