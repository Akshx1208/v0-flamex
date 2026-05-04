'use client'

import { Flame, CheckCircle, AlertTriangle, Bot, Thermometer, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const activities = [
  {
    id: 1,
    type: 'fire_detected',
    message: 'Fire detected in Zone B - Sector 2',
    time: '2 min ago',
    icon: Flame,
    iconColor: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  {
    id: 2,
    type: 'robot_deployed',
    message: 'Robot deployed to incident location',
    time: '2 min ago',
    icon: Bot,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 3,
    type: 'fire_extinguished',
    message: 'Fire successfully extinguished',
    time: '5 min ago',
    icon: CheckCircle,
    iconColor: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
  {
    id: 4,
    type: 'temp_warning',
    message: 'High temperature alert: 58°C in Zone A',
    time: '12 min ago',
    icon: Thermometer,
    iconColor: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  {
    id: 5,
    type: 'system_alert',
    message: 'System maintenance scheduled for 2:00 AM',
    time: '1 hour ago',
    icon: Info,
    iconColor: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    id: 6,
    type: 'warning',
    message: 'Gas sensor calibration required',
    time: '2 hours ago',
    icon: AlertTriangle,
    iconColor: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
]

export function ActivityFeed() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${activity.bgColor}`}>
                  <activity.icon className={`size-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
