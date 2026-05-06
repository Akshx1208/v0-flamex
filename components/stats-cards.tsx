'use client'

import { Thermometer, Wind, Flame, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const stats = [
  {
    title: 'Temperature',
    value: '42°C',
    change: '+2.5%',
    trend: 'up',
    icon: Thermometer,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  {
    title: 'Gas Level',
    value: '124 ppm',
    change: '-5.2%',
    trend: 'down',
    icon: Wind,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    title: 'Fire Events',
    value: '3',
    change: '+1',
    trend: 'up',
    icon: Flame,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  {
    title: 'System Health',
    value: '98.5%',
    change: '+0.3%',
    trend: 'up',
    icon: Activity,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
]

export function StatsCards() {
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
                  <span className={stat.trend === 'up' ? 'text-chart-1' : 'text-chart-4'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">vs last hour</span>
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
