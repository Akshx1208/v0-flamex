import { supabase } from '../lib/supabase'
import type { Zone } from '../lib/types'

export async function getAllZones(): Promise<Zone[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getZoneById(id: string): Promise<Zone | null> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
