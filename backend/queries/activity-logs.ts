import { supabase, supabaseAdmin } from '../lib/supabase'
import type { ActivityLog, ActivityCategory } from '../lib/types'

/** Recent activity log entries */
export async function getActivityLogs(limit = 50): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*, zones(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map((row: any) => ({ ...row, zone: row.zones?.name ?? null }))
}

/** Activity count by category for the last 24 hours */
export async function getActivityCountByCategory(): Promise<
  { category: string; event_count: number }[]
> {
  const { data, error } = await supabase.rpc('get_activity_count_by_category')
  if (error) throw error
  return data
}

/** Append a new activity log entry (server-side only) */
export async function logActivity(
  type: string,
  category: ActivityCategory,
  message: string,
  zoneId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('activity_logs')
    .insert({
      type,
      category,
      message,
      zone_id: zoneId ?? null,
      metadata: metadata ?? null,
    })

  if (error) throw error
}
