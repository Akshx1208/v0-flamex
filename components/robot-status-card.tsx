'use client'

import { Bot, Battery, Wifi, Navigation, Droplets, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const statusItems = [
  { label: 'Battery Level', value: 85, icon: Battery, unit: '%' },
  { label: 'Water Tank', value: 72, icon: Droplets, unit: '%' },
  { label: 'Signal Strength', value: 95, icon: Wifi, unit: '%' },
  { label: 'Motor Speed', value: 60, icon: Gauge, unit: 'RPM' },
]

export function RobotStatusCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Robot Status
          </CardTitle>
          <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20">
            <span className="mr-1.5 size-2 rounded-full bg-chart-1 animate-pulse" />
            Online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <Navigation className="size-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground">Zone A - Sector 3 (Lab Area)</p>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <item.icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <span className="font-medium">
                  {item.value}
                  {item.unit}
                </span>
              </div>
              <Progress
                value={item.value}
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-lg bg-primary/10 p-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            Deploy Robot
          </button>
          <button className="rounded-lg bg-destructive/10 p-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors">
            Emergency Stop
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
