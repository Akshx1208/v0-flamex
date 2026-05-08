import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { SensorMetricsChart } from '@/components/sensor-metrics-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Wind, Flame, CloudFog, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const typeConfig: Record<string, { icon: typeof Wind; color: string; bg: string }> = {
  gas:   { icon: Wind,     color: 'text-chart-3', bg: 'bg-chart-3/10' },
  flame: { icon: Flame,    color: 'text-chart-4', bg: 'bg-chart-4/10' },
  smoke: { icon: CloudFog, color: 'text-chart-5', bg: 'bg-chart-5/10' },
  temperature: { icon: Wind, color: 'text-chart-2', bg: 'bg-chart-2/10' },
}

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  normal:   { label: 'Normal',   className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',         icon: CheckCircle },
  warning:  { label: 'Warning',  className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',         icon: AlertTriangle },
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
}

async function getData() {
  const [settingsRes, sensorsRes] = await Promise.all([
    supabase.from('system_settings').select('key, value')
      .in('key', ['gas_warning_threshold_ppm', 'gas_critical_threshold_ppm', 'smoke_warning_threshold']),
    supabase.from('sensors').select('*, zones(name)').eq('is_active', true).neq('type', 'temperature'),
  ])

  const settings = Object.fromEntries((settingsRes.data ?? []).map((s) => [s.key, Number(s.value)]))
  const gasWarn = settings['gas_warning_threshold_ppm'] ?? 150
  const gasCrit = settings['gas_critical_threshold_ppm'] ?? 250
  const smokeWarn = settings['smoke_warning_threshold'] ?? 50

  const sensors = sensorsRes.data ?? []

  // Fetch latest reading for each sensor
  const sensorData = await Promise.all(
    sensors.map(async (sensor: any) => {
      const { data } = await supabase
        .from('sensor_readings')
        .select('value')
        .eq('sensor_id', sensor.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()

      const value = data?.value ?? 0
      let status = 'normal'
      if (sensor.type === 'gas') {
        status = value >= gasCrit ? 'critical' : value >= gasWarn ? 'warning' : 'normal'
      } else if (sensor.type === 'smoke') {
        status = value >= smokeWarn ? 'warning' : 'normal'
      } else if (sensor.type === 'flame') {
        status = value > 0 ? 'warning' : 'normal'
      }

      return {
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        location: (sensor.zones as any)?.name ?? 'Unknown',
        value: Number(value),
        unit: sensor.unit,
        max: Number(sensor.max_value),
        status,
      }
    })
  )

  const gasSensors = sensorData.filter((s) => s.type === 'gas')
  const flameSensors = sensorData.filter((s) => s.type === 'flame')
  const smokeSensors = sensorData.filter((s) => s.type === 'smoke')

  const maxGas = gasSensors.length ? Math.max(...gasSensors.map((s) => s.value)) : 0
  const activeFlame = flameSensors.filter((s) => s.value > 0).length
  const avgSmoke = smokeSensors.length
    ? (smokeSensors.reduce((a, s) => a + s.value, 0) / smokeSensors.length).toFixed(1)
    : 0

  return { sensorData, maxGas, activeFlame, totalFlame: flameSensors.length, avgSmoke }
}

export default async function GasSensorsPage() {
  const { sensorData, maxGas, activeFlame, totalFlame, avgSmoke } = await getData()

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
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10">
                      <Wind className="size-6 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gas Level (peak)</p>
                      <p className="text-2xl font-bold">{maxGas} ppm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-4/10">
                      <Flame className="size-6 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flame Sensors Active</p>
                      <p className="text-2xl font-bold">{activeFlame} / {totalFlame}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-chart-5/10">
                      <CloudFog className="size-6 text-chart-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Smoke Density (avg)</p>
                      <p className="text-2xl font-bold">{avgSmoke}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <SensorMetricsChart />

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Sensor Status</CardTitle>
                <CardDescription>Live readings from all deployed sensors</CardDescription>
              </CardHeader>
              <CardContent>
                {sensorData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sensors found</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {sensorData.map((sensor) => {
                      const tc = typeConfig[sensor.type] ?? typeConfig.gas
                      const sc = statusConfig[sensor.status]
                      const StatusIcon = sc.icon
                      return (
                        <div key={sensor.id} className="rounded-lg border border-border/50 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex size-9 items-center justify-center rounded-lg ${tc.bg}`}>
                                <tc.icon className={`size-5 ${tc.color}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{sensor.name}</p>
                                <p className="text-xs text-muted-foreground">{sensor.location}</p>
                              </div>
                            </div>
                            <Badge className={sc.className} variant="outline">
                              <StatusIcon className="size-3 mr-1" />
                              {sc.label}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Reading</span>
                              <span className="font-medium">{sensor.value} {sensor.unit}</span>
                            </div>
                            <Progress value={(sensor.value / sensor.max) * 100} className="h-2" />
                          </div>
                        </div>
                      )
                    })}
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
