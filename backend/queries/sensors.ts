import { supabase } from '../lib/supabase'
import type { SensorWithLatestReading } from '../lib/types'

/** Latest reading for every active sensor, with zone name and status */
export async function getSensorsWithLatestReadings(): Promise<SensorWithLatestReading[]> {
  const { data, error } = await supabase.rpc('get_sensors_with_latest_readings')
  if (error) throw error
  return data
}

/** 5-minute bucketed readings for the last 60 minutes (gas, flame, smoke) */
export async function getSensorMetricsChart(): Promise<
  { bucket: string; type: string; avg_value: number }[]
> {
  const { data, error } = await supabase.rpc('get_sensor_metrics_chart')
  if (error) throw error
  return data
}

/** Insert a new sensor reading (called by IoT ingestion) */
export async function insertSensorReading(sensorId: string, value: number): Promise<void> {
  const { error } = await supabase
    .from('sensor_readings')
    .insert({ sensor_id: sensorId, value })

  if (error) throw error
}
