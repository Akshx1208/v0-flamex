import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Thermometer, Bell, Bot, Shield, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getData() {
  const { data } = await supabase.from('system_settings').select('key, value, description')
  return Object.fromEntries((data ?? []).map((s) => [s.key, s.value]))
}

export default async function SettingsPage() {
  const settings = await getData()

  const thresholdFields = [
    { label: 'Temperature Warning (°C)', key: 'temp_warning_threshold_c',   unit: '°C' },
    { label: 'Temperature Critical (°C)', key: 'temp_critical_threshold_c', unit: '°C' },
    { label: 'Gas Level Warning (ppm)',   key: 'gas_warning_threshold_ppm', unit: 'ppm' },
    { label: 'Gas Level Critical (ppm)',  key: 'gas_critical_threshold_ppm', unit: 'ppm' },
    { label: 'Smoke Density Warning',     key: 'smoke_warning_threshold',   unit: '/100' },
  ]

  const robotFields = [
    { label: 'Max Speed (RPM)',              key: 'robot_max_speed_rpm' },
    { label: 'Water Spray Duration (sec)',   key: 'robot_spray_duration_s' },
    { label: 'Auto-Deploy on Fire',          key: 'robot_auto_deploy' },
    { label: 'Return to Base After Mission', key: 'robot_return_after_mission' },
    { label: 'Low Battery Threshold (%)',    key: 'robot_low_battery_pct' },
  ]

  const notificationItems = [
    { label: 'Fire Detection Alerts',    description: 'Immediate notification on fire events',       enabled: true },
    { label: 'Temperature Warnings',     description: 'Alert when thresholds are exceeded',          enabled: true },
    { label: 'Gas Sensor Alerts',        description: 'Notify on elevated gas readings',             enabled: true },
    { label: 'Robot Status Updates',     description: 'Updates on robot deployment and return',      enabled: false },
    { label: 'System Maintenance',       description: 'Scheduled maintenance reminders',             enabled: false },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-6">

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="size-4" />
                  Alert Thresholds
                </CardTitle>
                <CardDescription>Sensor trigger values loaded from database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {thresholdFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium w-64 shrink-0">{field.label}</label>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 rounded-md border border-border/50 bg-secondary/30 px-3 py-2 text-sm font-mono">
                        {settings[field.key] ?? '—'}
                      </div>
                      <span className="text-xs text-muted-foreground w-12">{field.unit}</span>
                    </div>
                  </div>
                ))}
                <button className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Save className="size-4" />
                  Save Thresholds
                </button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-4" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage how and when you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={item.enabled
                        ? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
                        : 'bg-secondary text-muted-foreground border-border/50'}
                    >
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="size-4" />
                  Robot Configuration
                </CardTitle>
                <CardDescription>Flame-X robot operational parameters from database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {robotFields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium w-64 shrink-0">{field.label}</label>
                    <div className="flex-1 rounded-md border border-border/50 bg-secondary/30 px-3 py-2 text-sm font-mono">
                      {settings[field.key] ?? '—'}
                    </div>
                  </div>
                ))}
                <button className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Save className="size-4" />
                  Save Configuration
                </button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-4" />
                  System
                </CardTitle>
                <CardDescription>General system information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Firmware Version', value: settings['firmware_version'] ?? '—', action: 'Check for updates' },
                  { label: 'Data Retention',   value: `${settings['data_retention_days'] ?? '—'} days`, action: 'Configure' },
                  { label: 'API Connection',   value: 'Connected', action: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                    {item.action && (
                      <button className="text-xs text-primary hover:underline">{item.action}</button>
                    )}
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
