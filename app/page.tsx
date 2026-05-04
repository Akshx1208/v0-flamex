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

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Stats Overview */}
            <StatsCards />

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TemperatureChart />
              <FireEventsChart />
            </div>

            {/* Bottom Section */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SensorMetricsChart />
              </div>
              <div className="space-y-6">
                <RobotStatusCard />
              </div>
            </div>

            {/* User Profile and Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
              <UserProfileCard />
              <div className="lg:col-span-2">
                <ActivityFeed />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
