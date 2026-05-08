'use client'

import { Bot, Battery, Wifi, Navigation, Droplets, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

type Robot = {
  status: string
  battery_pct: number
  water_tank_pct: number
  signal_pct: number
  motor_speed_rpm: number
  current_zone: string | null
} | null

type Props = { robot: Robot }

export function RobotStatusCard({ robot }: Props) {
  const isOnline = robot && robot.status !== 'offline'

  const statusItems = robot
    ? [
        { label: 'Battery Level',   value: robot.battery_pct,   icon: Battery,  unit: '%' },
        { label: 'Water Tank',      value: robot.water_tank_pct, icon: Droplets, unit: '%' },
        { label: 'Signal Strength', value: robot.signal_pct,    icon: Wifi,     unit: '%' },
        { label: 'Motor Speed',     value: Math.min(robot.motor_speed_rpm, 100), icon: Gauge, unit: 'RPM' },
      ]
    : []

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Robot Status
          </CardTitle>
          <Badge className={isOnline ? 'bg-chart-1/10 text-chart-1 border-chart-1/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
            <span className={`inline-block mr-1.5 size-2 rounded-full ${isOnline ? 'bg-chart-1 animate-pulse' : 'bg-destructive'}`} />
            {robot ? robot.status.charAt(0).toUpperCase() + robot.status.slice(1) : 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <Navigation className="size-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground">{robot?.current_zone ?? 'Unknown'}</p>
          </div>
        </div>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <item.icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <span className="font-medium">{item.value}{item.unit}</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </div>
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
