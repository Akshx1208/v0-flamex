import { supabase, supabaseAdmin } from '../lib/supabase'
import type { FireEvent, FireEventSeverity } from '../lib/types'

/** All fire events ordered by most recent */
export async function getFireEvents(): Promise<FireEvent[]> {
  const { data, error } = await supabase
    .from('fire_events')
    .select('*, zones(name)')
    .order('detected_at', { ascending: false })

  if (error) throw error
  return data.map((row: any) => ({ ...row, zone: row.zones?.name ?? null }))
}

/** Weekly fire events for bar chart (detected vs extinguished per day) */
export async function getWeeklyFireEvents(): Promise<
  { day: string; detected: number; extinguished: number }[]
> {
  const { data, error } = await supabase.rpc('get_weekly_fire_events')
  if (error) throw error
  return data
}

/** Summary stats for the last 7 days */
export async function getFireEventStats(): Promise<{
  total_events: number
  extinguished: number
  avg_response_min: number
}> {
  const { data, error } = await supabase.rpc('get_fire_event_stats')
  if (error) throw error
  return data[0]
}

/** Create a new fire event (server-side only) */
export async function createFireEvent(
  zoneId: string,
  severity: FireEventSeverity
): Promise<FireEvent> {
  const { data, error } = await supabaseAdmin
    .from('fire_events')
    .insert({ zone_id: zoneId, severity, status: 'detected' })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Mark a fire event as extinguished (server-side only) */
export async function extinguishFireEvent(id: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('extinguish_fire_event', { event_id: id })
  if (error) throw error
}
