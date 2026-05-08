'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const chartData = [
  { time: '12:00', gas: 80, flame: 0, smoke: 15 },
  { time: '12:05', gas: 85, flame: 0, smoke: 18 },
  { time: '12:10', gas: 92, flame: 5, smoke: 25 },
  { time: '12:15', gas: 120, flame: 45, smoke: 55 },
  { time: '12:20', gas: 145, flame: 78, smoke: 72 },
  { time: '12:25', gas: 130, flame: 35, smoke: 45 },
  { time: '12:30', gas: 95, flame: 8, smoke: 28 },
  { time: '12:35', gas: 88, flame: 0, smoke: 20 },
  { time: '12:40', gas: 82, flame: 0, smoke: 16 },
  { time: '12:45', gas: 78, flame: 0, smoke: 14 },
]

const chartConfig = {
  gas: {
    label: 'Gas Level',
    color: 'var(--chart-3)',
  },
  flame: {
    label: 'Flame Intensity',
    color: 'var(--chart-4)',
  },
  smoke: {
    label: 'Smoke Density',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

export function SensorMetricsChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Sensor Metrics</CardTitle>
        <CardDescription>Real-time multi-sensor readings during last incident</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              domain={[0, 160]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="gas"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="flame"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="smoke"
              stroke="var(--chart-5)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
