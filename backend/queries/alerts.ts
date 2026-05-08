import { supabase, supabaseAdmin } from '../lib/supabase'
import type { Alert, AlertSeverity, AlertCategory } from '../lib/types'

/** All active (unresolved) alerts, ordered by severity then time */
export async function getActiveAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, zones(name)')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((row: any) => ({ ...row, zone: row.zones?.name ?? null }))
}

/** Recently resolved alerts */
export async function getResolvedAlerts(limit = 50): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, zones(name)')
    .eq('is_resolved', true)
    .order('resolved_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map((row: any) => ({ ...row, zone: row.zones?.name ?? null }))
}

/** Alert count summary */
export async function getAlertCounts(): Promise<{
  active_count: number
  pending_review: number
  resolved_today: number
}> {
  const { data, error } = await supabase.rpc('get_alert_counts')
  if (error) throw error
  return data[0]
}

/** Acknowledge an alert */
export async function acknowledgeAlert(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('alerts')
    .update({ acknowledged: true })
    .eq('id', id)

  if (error) throw error
}

/** Resolve an alert */
export async function resolveAlert(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('alerts')
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

/** Create a new alert (server-side only) */
export async function createAlert(
  title: string,
  description: string,
  severity: AlertSeverity,
  category: AlertCategory,
  zoneId?: string
): Promise<Alert> {
  const { data, error } = await supabaseAdmin
    .from('alerts')
    .insert({ title, description, severity, category, zone_id: zoneId ?? null })
    .select()
    .single()

  if (error) throw error
  return data
}
