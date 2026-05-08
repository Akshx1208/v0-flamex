import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Flame, Thermometer, Wind, Bell, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { AcknowledgeButton } from '@/components/acknowledge-button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const severityConfig: Record<string, { label: string; badge: string; border: string }> = {
  critical: { label: 'Critical', badge: 'bg-destructive/10 text-destructive border-destructive/20', border: 'border-l-4 border-l-destructive' },
  warning:  { label: 'Warning',  badge: 'bg-chart-3/10 text-chart-3 border-chart-3/20',            border: 'border-l-4 border-l-chart-3' },
  info:     { label: 'Info',     badge: 'bg-chart-2/10 text-chart-2 border-chart-2/20',            border: 'border-l-4 border-l-chart-2' },
  resolved: { label: 'Resolved', badge: 'bg-chart-1/10 text-chart-1 border-chart-1/20',            border: 'border-l-4 border-l-chart-1' },
}

const categoryIcon: Record<string, typeof Flame> = {
  fire: Flame, sensor: Thermometer, robot: Wind, system: Bell,
}

async function getData() {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [activeRes, resolvedRes] = await Promise.all([
    supabase.from('alerts').select('*, zones(name)').eq('is_resolved', false).order('created_at', { ascending: false }),
    supabase.from('alerts').select('*, zones(name)').eq('is_resolved', true).order('resolved_at', { ascending: false }).limit(20),
  ])

  const active = (activeRes.data ?? []).map((r: any) => ({ ...r, zone: r.zones?.name ?? null }))
  const resolved = (resolvedRes.data ?? []).map((r: any) => ({ ...r, zone: r.zones?.name ?? null }))
  const resolvedToday = resolved.filter((a) => a.resolved_at && new Date(a.resolved_at) >= todayStart).length
  const pending = active.filter((a) => !a.acknowledged).length

  return { active, resolved, resolvedToday, pending }
}

export default async function AlertsPage() {
  const { active, resolved, resolvedToday, pending } = await getData()

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
                    <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10">
                      <AlertTriangle className="size-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Alerts</p>
                      <p className="text-2xl font-bold">{active.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10">
                      <Clock className="size-6 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold">{pending}</p>
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
                      <p className="text-sm text-muted-foreground">Resolved Today</p>
                      <p className="text-2xl font-bold">{resolvedToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Alerts requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {active.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No active alerts</p>
                ) : active.map((alert) => {
                  const cfg = severityConfig[alert.severity] ?? severityConfig.info
                  const Icon = categoryIcon[alert.category] ?? Bell
                  return (
                    <div key={alert.id} className={`rounded-lg bg-secondary/30 p-4 ${cfg.border}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Icon className={`size-5 mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-destructive' : alert.severity === 'warning' ? 'text-chart-3' : 'text-chart-2'}`} />
                          <div>
                            <p className="text-sm font-semibold">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={cfg.badge} variant="outline">{cfg.label}</Badge>
                          {!alert.acknowledged && <AcknowledgeButton alertId={alert.id} />}
                          {alert.acknowledged && (
                            <span className="text-xs text-muted-foreground">Acknowledged</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-chart-1" />
                  Resolved Alerts
                </CardTitle>
                <CardDescription>Recently resolved incidents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resolved.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No resolved alerts</p>
                ) : resolved.map((alert) => (
                  <div key={alert.id} className={`rounded-lg bg-secondary/20 p-4 opacity-75 ${severityConfig.resolved.border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="size-5 mt-0.5 shrink-0 text-chart-1" />
                        <div>
                          <p className="text-sm font-semibold">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Clock className="size-3" />
                            {alert.resolved_at
                              ? formatDistanceToNow(new Date(alert.resolved_at), { addSuffix: true })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <Badge className={severityConfig.resolved.badge} variant="outline">
                        <CheckCircle className="size-3 mr-1" />
                        Resolved
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
