import { supabase } from '../lib/supabase'

/** Hourly average temperature for the last 24 hours (for chart) */
export async function getTemperatureChart(): Promise<
  { hour: string; avg_temp_c: number }[]
> {
  const { data, error } = await supabase.rpc('get_temperature_chart_24h')
  if (error) throw error
  return data
}

/** Current temperature per zone with status */
export async function getZoneTemperatures(): Promise<
  { id: string; name: string; current_temp_c: number; status: string }[]
> {
  const { data, error } = await supabase.rpc('get_zone_temperatures')
  if (error) throw error
  return data
}

/** Min/max temperature per zone (all time) */
export async function getZoneTempMinMax(): Promise<
  { name: string; min_temp_c: number; max_temp_c: number }[]
> {
  const { data, error } = await supabase.rpc('get_zone_temp_min_max')
  if (error) throw error
  return data
}
