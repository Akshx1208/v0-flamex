import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatsCards } from '@/components/stats-cards'
import { TemperatureChart } from '@/components/temperature-chart'
import { FireEventsChart } from '@/components/fire-events-chart'
import { SensorMetricsChart } from '@/components/sensor-metrics-chart'
import { UserProfileCard } from '@/components/user-profile-card'
import { RobotStatusCard } from '@/components/robot-status-card'
import { ActivityFeed } from '@/components/activity-feed'
import { supabase } from '@/lib/supabase'

export const revalidate = 30 // revalidate every 30 seconds

async function getDashboardData() {
  const [tempRes, gasRes, fireRes, activityRes, robotRes] = await Promise.all([
    supabase
      .from('sensor_readings')
      .select('value, sensors!inner(type)')
      .eq('sensors.type', 'temperature')
      .gte('recorded_at', new Date(Date.now() - 3600000).toISOString())
      .order('recorded_at', { ascending: false }),
    supabase
      .from('sensor_readings')
      .select('value, sensors!inner(type)')
      .eq('sensors.type', 'gas')
      .gte('recorded_at', new Date(Date.now() - 3600000).toISOString())
      .order('value', { ascending: false })
      .limit(1),
    supabase
      .from('fire_events')
      .select('id')
      .gte('detected_at', new Date(Date.now() - 86400000).toISOString()),
    supabase
      .from('activity_logs')
      .select('*, zones(name)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('robot')
      .select('*, zones(name)')
      .limit(1)
      .single(),
  ])

  const temps = tempRes.data ?? []
  const avgTemp = temps.length
    ? (temps.reduce((s, r) => s + Number(r.value), 0) / temps.length).toFixed(1)
    : '—'
  const maxGas = gasRes.data?.[0]?.value ?? 0
  const fireCount = fireRes.data?.length ?? 0
  const robot = robotRes.data ? { ...robotRes.data, current_zone: (robotRes.data as any).zones?.name ?? null } : null

  return {
    avgTemp,
    maxGas,
    fireCount,
    activities: (activityRes.data ?? []).map((r: any) => ({ ...r, zone: r.zones?.name ?? null })),
    robot,
  }
}

export default async function DashboardPage() {
  const { avgTemp, maxGas, fireCount, activities, robot } = await getDashboardData()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <StatsCards avgTemp={avgTemp} maxGas={maxGas} fireCount={fireCount} />
            <div className="grid gap-6 lg:grid-cols-2">
              <TemperatureChart />
              <FireEventsChart />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SensorMetricsChart />
              </div>
              <div className="space-y-6">
                <RobotStatusCard robot={robot} />
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <UserProfileCard />
              <div className="lg:col-span-2">
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
