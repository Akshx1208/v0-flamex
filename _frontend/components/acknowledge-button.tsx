'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function AcknowledgeButton({ alertId }: { alertId: string }) {
  const router = useRouter()

  async function handleAcknowledge() {
    await supabase.from('alerts').update({ acknowledged: true }).eq('id', alertId)
    router.refresh()
  }

  return (
    <button
      onClick={handleAcknowledge}
      className="rounded-md bg-secondary px-3 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors"
    >
      Acknowledge
    </button>
  )
}
