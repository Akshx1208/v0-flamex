'use client'

import { Flame, CheckCircle, AlertTriangle, Bot, Thermometer, Info, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

type Activity = {
  id: string
  type: string
  category: string
  message: string
  zone: string | null
  created_at: string
}

type Props = {
  activities: Activity[]
}

const iconMap: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  fire_detected:    { icon: Flame,         color: 'text-chart-4', bg: 'bg-chart-4/10' },
  fire_extinguished:{ icon: CheckCircle,   color: 'text-chart-1', bg: 'bg-chart-1/10' },
  robot_deployed:   { icon: Bot,           color: 'text-primary',  bg: 'bg-primary/10' },
  robot_returned:   { icon: Bot,           color: 'text-primary',  bg: 'bg-primary/10' },
  temp_warning:     { icon: Thermometer,   color: 'text-chart-3', bg: 'bg-chart-3/10' },
  sensor_warning:   { icon: AlertTriangle, color: 'text-chart-3', bg: 'bg-chart-3/10' },
  system_alert:     { icon: Info,          color: 'text-chart-2', bg: 'bg-chart-2/10' },
  system_check:     { icon: Shield,        color: 'text-chart-1', bg: 'bg-chart-1/10' },
}

const fallback = { icon: Info, color: 'text-chart-2', bg: 'bg-chart-2/10' }

export function ActivityFeed({ activities }: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            )}
            {activities.map((activity) => {
              const { icon: Icon, color, bg } = iconMap[activity.type] ?? fallback
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`size-4 ${color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-relaxed">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
