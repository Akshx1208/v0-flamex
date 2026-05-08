import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { RobotStatusCard } from '@/components/robot-status-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Cpu, Thermometer, Clock, Wrench, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getData() {
  const [robotRes, diagRes, missionsRes] = await Promise.all([
    supabase.from('robot').select('*, zones(name)').limit(1).single(),
    supabase
      .from('robot_diagnostics')
      .select('component, status, detail, checked_at')
      .order('checked_at', { ascending: false }),
    supabase
      .from('missions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10),
  ])

  const robotRaw = robotRes.data as any
  const robot = robotRaw
    ? { ...robotRaw, current_zone: robotRaw.zones?.name ?? null }
    : null

  // Deduplicate diagnostics — latest per component
  const diagMap = new Map<string, any>()
  for (const d of diagRes.data ?? []) {
    if (!diagMap.has(d.component)) diagMap.set(d.component, d)
  }
  const diagnostics = Array.from(diagMap.values())

  const missions = missionsRes.data ?? []

  return { robot, diagnostics, missions }
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default async function RobotStatusPage() {
  const { robot, diagnostics, missions } = await getData()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <RobotStatusCard robot={robot} />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Cpu className="size-5 text-chart-2" />
                        <div>
                          <p className="text-xs text-muted-foreground">CPU Usage</p>
                          <p className="text-xl font-bold">{robot?.cpu_usage_pct ?? '—'}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Thermometer className="size-5 text-chart-3" />
                        <div>
                          <p className="text-xs text-muted-foreground">Core Temp</p>
                          <p className="text-xl font-bold">{robot?.core_temp_c ?? '—'}°C</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-chart-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                          <p className="text-xl font-bold">{robot ? formatUptime(robot.uptime_seconds) : '—'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="size-4" />
                      System Diagnostics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {diagnostics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No diagnostics available</p>
                    ) : (
                      <div className="space-y-2">
                        {diagnostics.map((item) => (
                          <div key={item.component} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                            <div className="flex items-center gap-2">
                              {item.status === 'ok' ? (
                                <CheckCircle className="size-4 text-chart-1" />
                              ) : (
                                <Bot className="size-4 text-chart-3" />
                              )}
                              <span className="text-sm font-medium">{item.component}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{item.detail}</span>
                              <Badge
                                variant="outline"
                                className={item.status === 'ok'
                                  ? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
                                  : 'bg-chart-3/10 text-chart-3 border-chart-3/20'}
                              >
                                {item.status === 'ok' ? 'OK' : 'Warning'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Mission Log</CardTitle>
                <CardDescription>Recent robot deployment history</CardDescription>
              </CardHeader>
              <CardContent>
                {missions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No missions recorded</p>
                ) : (
                  <div className="space-y-3">
                    {missions.map((mission) => (
                      <div key={mission.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                        <div className="flex items-center gap-3">
                          <Bot className="size-4 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{mission.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {formatDuration(mission.duration_s)} ·{' '}
                              {formatDistanceToNow(new Date(mission.started_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={mission.result === 'success'
                            ? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
                            : 'bg-chart-3/10 text-chart-3 border-chart-3/20'}
                        >
                          <CheckCircle className="size-3 mr-1" />
                          {mission.result}
                        </Badge>
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
