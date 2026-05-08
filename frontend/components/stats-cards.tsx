'use client'

import { Thermometer, Wind, Flame, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  avgTemp: string | number
  maxGas: string | number
  fireCount: number
}

export function StatsCards({ avgTemp, maxGas, fireCount }: Props) {
  const stats = [
    {
      title: 'Temperature',
      value: `${avgTemp}°C`,
      change: 'avg last hour',
      trend: 'up' as const,
      icon: Thermometer,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Gas Level',
      value: `${maxGas} ppm`,
      change: 'peak last hour',
      trend: 'down' as const,
      icon: Wind,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Fire Events',
      value: String(fireCount),
      change: 'last 24 hours',
      trend: 'up' as const,
      icon: Flame,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: 'all sensors active',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === 'up' ? (
                    <ArrowUp className="size-3 text-chart-1" />
                  ) : (
                    <ArrowDown className="size-3 text-chart-4" />
                  )}
                  <span className="text-muted-foreground">{stat.change}</span>
                </div>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
