import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { TemperatureChart } from '@/components/temperature-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Thermometer, ArrowUp, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const statusConfig: Record<string, { label: string; className: string }> = {
  normal:   { label: 'Normal',   className: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
  warning:  { label: 'Warning',  className: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/20' },
}

async function getData() {
  const [settingsRes, readingsRes] = await Promise.all([
    supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['temp_warning_threshold_c', 'temp_critical_threshold_c']),
    supabase
      .from('sensor_readings')
      .select('value, recorded_at, sensors!inner(zone_id, type, zones(name))')
      .eq('sensors.type', 'temperature')
      .gte('recorded_at', new Date(Date.now() - 600000).toISOString()) // last 10 min
      .order('recorded_at', { ascending: false }),
  ])

  const settings = Object.fromEntries((settingsRes.data ?? []).map((s) => [s.key, Number(s.value)]))
  const warnThreshold = settings['temp_warning_threshold_c'] ?? 55
  const critThreshold = settings['temp_critical_threshold_c'] ?? 70

  // Group by zone, take latest reading per zone
  const zoneMap = new Map<string, { name: string; values: number[] }>()
  for (const r of readingsRes.data ?? []) {
    const sensor = r.sensors as any
    const zoneName = sensor?.zones?.name ?? 'Unknown'
    if (!zoneMap.has(zoneName)) zoneMap.set(zoneName, { name: zoneName, values: [] })
    zoneMap.get(zoneName)!.values.push(Number(r.value))
  }

  const zones = Array.from(zoneMap.entries()).map(([name, { values }]) => {
    const current = Math.round(values[0])
    const min = Math.round(Math.min(...values))
    const max = Math.round(Math.max(...values))
    const status = current >= critThreshold ? 'critical' : current >= warnThreshold ? 'warning' : 'normal'
    return { name, current, min, max, status }
  })

  const allTemps = zones.map((z) => z.current)
  const avgTemp = allTemps.length ? (allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(1) : '—'
  const peakTemp = allTemps.length ? Math.max(...allTemps) : '—'
  const peakZone = zones.find((z) => z.current === Math.max(...allTemps))?.name ?? '—'
  const normalCount = zones.filter((z) => z.status === 'normal').length

  return { zones, avgTemp, peakTemp, peakZone, normalCount, total: zones.length, warnThreshold }
}

export default async function TemperaturePage() {
  const { zones, avgTemp, peakTemp, peakZone, normalCount, total, warnThreshold } = await getData()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Average Temp</p>
                  <p className="text-2xl font-bold mt-1">{avgTemp}°C</p>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <ArrowUp className="size-3 text-chart-3" />
                    <span className="text-muted-foreground">last 10 min</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Peak Temp</p>
                  <p className="text-2xl font-bold mt-1">{peakTemp}°C</p>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <Minus className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{peakZone}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Zones Normal</p>
                  <p className="text-2xl font-bold mt-1">{normalCount} / {total}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Alert Threshold</p>
                  <p className="text-2xl font-bold mt-1">{warnThreshold}°C</p>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <Minus className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Configured limit</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TemperatureChart />

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Zone Temperature Breakdown</CardTitle>
                <CardDescription>Current readings across all monitored zones</CardDescription>
              </CardHeader>
              <CardContent>
                {zones.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No temperature readings in the last 10 minutes</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {zones.map((zone) => (
                      <div key={zone.name} className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-chart-2/10">
                            <Thermometer className="size-5 text-chart-2" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{zone.name}</p>
                            <p className="text-xs text-muted-foreground">Min: {zone.min}°C · Max: {zone.max}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">{zone.current}°C</span>
                          <Badge className={statusConfig[zone.status].className} variant="outline">
                            {statusConfig[zone.status].label}
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
