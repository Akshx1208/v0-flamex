import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { FireEventsChart } from '@/components/fire-events-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 30

const severityColors: Record<string, string> = {
  high:   'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  low:    'bg-chart-1/10 text-chart-1 border-chart-1/20',
}

async function getData() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [eventsRes, statsRes] = await Promise.all([
    supabase
      .from('fire_events')
      .select('*, zones(name)')
      .order('detected_at', { ascending: false })
      .limit(20),
    supabase
      .from('fire_events')
      .select('id, status, response_time_s')
      .gte('detected_at', sevenDaysAgo),
  ])

  const events = (eventsRes.data ?? []).map((r: any) => ({ ...r, zone: r.zones?.name ?? 'Unknown' }))
  const stats = statsRes.data ?? []
  const total = stats.length
  const extinguished = stats.filter((e) => e.status === 'extinguished').length
  const avgResponse = stats.filter((e) => e.response_time_s).length
    ? (stats.reduce((s, e) => s + (e.response_time_s ?? 0), 0) / stats.filter((e) => e.response_time_s).length / 60).toFixed(1)
    : '—'

  return { events, total, extinguished, avgResponse }
}

export default async function FireDetectionPage() {
  const { events, total, extinguished, avgResponse } = await getData()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-4/10">
                      <Flame className="size-6 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events (7d)</p>
                      <p className="text-2xl font-bold">{total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-1/10">
                      <CheckCircle className="size-6 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Extinguished</p>
                      <p className="text-2xl font-bold">{extinguished}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10">
                      <AlertTriangle className="size-6 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-2xl font-bold">{avgResponse} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <FireEventsChart />

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Recent Fire Events</CardTitle>
                <CardDescription>Detailed log of all detected fire incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No fire events recorded</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                        <div className="flex items-center gap-3">
                          <Flame className="size-4 text-chart-4 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <MapPin className="size-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{event.zone}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="size-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(event.detected_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={severityColors[event.severity] ?? severityColors.medium} variant="outline">
                            {event.severity}
                          </Badge>
                          <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20" variant="outline">
                            <CheckCircle className="size-3 mr-1" />
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
