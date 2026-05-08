import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { ActivityFeed } from '@/components/activity-feed'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Bot, CheckCircle, AlertTriangle, Thermometer, Info, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 30

const categoryColors: Record<string, string> = {
  fire:   'bg-chart-4/10 text-chart-4 border-chart-4/20',
  robot:  'bg-primary/10 text-primary border-primary/20',
  sensor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  system: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
}

const iconMap: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  fire_detected:     { icon: Flame,         color: 'text-chart-4', bg: 'bg-chart-4/10' },
  fire_extinguished: { icon: CheckCircle,   color: 'text-chart-1', bg: 'bg-chart-1/10' },
  robot_deployed:    { icon: Bot,           color: 'text-primary',  bg: 'bg-primary/10' },
  robot_returned:    { icon: Bot,           color: 'text-primary',  bg: 'bg-primary/10' },
  temp_warning:      { icon: Thermometer,   color: 'text-chart-3', bg: 'bg-chart-3/10' },
  sensor_warning:    { icon: AlertTriangle, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  system_alert:      { icon: Info,          color: 'text-chart-2', bg: 'bg-chart-2/10' },
  system_check:      { icon: Shield,        color: 'text-chart-1', bg: 'bg-chart-1/10' },
}
const fallback = { icon: Info, color: 'text-chart-2', bg: 'bg-chart-2/10' }

async function getData() {
  const [logsRes, recentRes] = await Promise.all([
    supabase
      .from('activity_logs')
      .select('*, zones(name)')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('activity_logs')
      .select('*, zones(name)')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const logs = (logsRes.data ?? []).map((r: any) => ({ ...r, zone: r.zones?.name ?? null }))
  const recent = (recentRes.data ?? []).map((r: any) => ({ ...r, zone: r.zones?.name ?? null }))

  const counts = { fire: 0, robot: 0, sensor: 0, system: 0 }
  for (const log of logs) {
    if (log.category in counts) counts[log.category as keyof typeof counts]++
  }

  return { logs, recent, counts }
}

export default async function ActivityLogsPage() {
  const { logs, recent, counts } = await getData()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {(['fire', 'robot', 'sensor', 'system'] as const).map((cat) => (
                <Card key={cat} className="border-border/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground capitalize">{cat} Events</p>
                    <p className="text-2xl font-bold mt-1">{counts[cat]}</p>
                    <Badge className={`mt-2 ${categoryColors[cat]}`} variant="outline">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>All Activity</CardTitle>
                    <CardDescription>Complete system event log</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {logs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
                    ) : (
                      <div className="space-y-1">
                        {logs.map((log) => {
                          const { icon: Icon, color, bg } = iconMap[log.type] ?? fallback
                          return (
                            <div key={log.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/30 transition-colors">
                              <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                                <Icon className={`size-4 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">{log.message}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  {log.zone ? ` · ${log.zone}` : ''}
                                </p>
                              </div>
                              <Badge className={categoryColors[log.category] ?? categoryColors.system} variant="outline">
                                {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <ActivityFeed activities={recent} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
