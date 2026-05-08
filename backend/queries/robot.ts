import { supabase, supabaseAdmin } from '../lib/supabase'
import type { Robot, RobotDiagnostic, Mission, RobotStatus, MissionResult } from '../lib/types'

/** Current robot status */
export async function getRobot(): Promise<Robot | null> {
  const { data, error } = await supabase
    .from('robot')
    .select('*, zones(name)')
    .limit(1)
    .single()

  if (error) throw error
  return { ...data, current_zone: data.zones?.name ?? null }
}

/** Latest diagnostic per component */
export async function getRobotDiagnostics(): Promise<RobotDiagnostic[]> {
  const { data, error } = await supabase.rpc('get_robot_diagnostics')
  if (error) throw error
  return data
}

/** Recent mission log */
export async function getMissions(limit = 20): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*, fire_events(zone_id, zones(name))')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map((row: any) => ({
    ...row,
    zone: row.fire_events?.zones?.name ?? null,
  }))
}

/** Update robot telemetry (server-side / IoT ingestion) */
export async function updateRobotTelemetry(
  id: string,
  telemetry: Partial<Pick<Robot, 'battery_pct' | 'water_tank_pct' | 'signal_pct' | 'motor_speed_rpm' | 'cpu_usage_pct' | 'core_temp_c' | 'uptime_seconds' | 'status'>>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('robot')
    .update({ ...telemetry, last_seen_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

/** Create a new mission */
export async function createMission(
  robotId: string,
  type: Mission['type'],
  description: string,
  fireEventId?: string
): Promise<Mission> {
  const { data, error } = await supabaseAdmin
    .from('missions')
    .insert({ robot_id: robotId, type, description, fire_event_id: fireEventId ?? null, result: 'pending' })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Close a mission */
export async function closeMission(id: string, result: MissionResult): Promise<void> {
  const { error } = await supabaseAdmin.rpc('close_mission', { mission_id: id, mission_result: result })
  if (error) throw error
}
