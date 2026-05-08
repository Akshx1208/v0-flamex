// ============================================================
// FLAME-X — Shared TypeScript types matching the database schema
// ============================================================

export type Zone = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type SensorType = 'gas' | 'flame' | 'smoke' | 'temperature'

export type Sensor = {
  id: string
  zone_id: string
  name: string
  type: SensorType
  unit: string
  max_value: number
  is_active: boolean
  created_at: string
}

export type SensorReading = {
  id: string
  sensor_id: string
  value: number
  recorded_at: string
}

export type SensorWithLatestReading = Sensor & {
  zone: string
  value: number
  recorded_at: string
  status: 'normal' | 'warning' | 'critical'
}

export type FireEventStatus = 'detected' | 'responding' | 'extinguished'
export type FireEventSeverity = 'low' | 'medium' | 'high'

export type FireEvent = {
  id: string
  zone_id: string
  zone?: string
  severity: FireEventSeverity
  status: FireEventStatus
  detected_at: string
  extinguished_at: string | null
  response_time_s: number | null
  notes: string | null
}

export type RobotStatus = 'idle' | 'patrolling' | 'deployed' | 'charging' | 'offline'

export type Robot = {
  id: string
  name: string
  status: RobotStatus
  battery_pct: number
  water_tank_pct: number
  signal_pct: number
  motor_speed_rpm: number
  cpu_usage_pct: number
  core_temp_c: number
  uptime_seconds: number
  current_zone: string | null
  last_seen_at: string
}

export type DiagnosticStatus = 'ok' | 'warning' | 'error'

export type RobotDiagnostic = {
  component: string
  status: DiagnosticStatus
  detail: string | null
  checked_at: string
}

export type MissionType = 'fire_suppression' | 'patrol' | 'inspection'
export type MissionResult = 'pending' | 'success' | 'failed' | 'aborted'

export type Mission = {
  id: string
  type: MissionType
  description: string
  result: MissionResult
  started_at: string
  ended_at: string | null
  duration_s: number | null
  zone: string | null
}

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertCategory = 'fire' | 'sensor' | 'robot' | 'system'

export type Alert = {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  category: AlertCategory
  zone: string | null
  acknowledged: boolean
  is_resolved: boolean
  resolved_at: string | null
  created_at: string
}

export type ActivityCategory = 'fire' | 'robot' | 'sensor' | 'system'

export type ActivityLog = {
  id: string
  type: string
  category: ActivityCategory
  message: string
  zone: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type SystemSetting = {
  key: string
  value: string
  description: string | null
  updated_at: string
}

export type DashboardStats = {
  avg_temp_c: number
  max_gas_ppm: number
  fire_events_24h: number
  system_health_pct: number
}
