'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const chartData = [
  { time: '00:00', temperature: 28, threshold: 60 },
  { time: '02:00', temperature: 27, threshold: 60 },
  { time: '04:00', temperature: 26, threshold: 60 },
  { time: '06:00', temperature: 29, threshold: 60 },
  { time: '08:00', temperature: 35, threshold: 60 },
  { time: '10:00', temperature: 42, threshold: 60 },
  { time: '12:00', temperature: 48, threshold: 60 },
  { time: '14:00', temperature: 52, threshold: 60 },
  { time: '16:00', temperature: 45, threshold: 60 },
  { time: '18:00', temperature: 38, threshold: 60 },
  { time: '20:00', temperature: 34, threshold: 60 },
  { time: '22:00', temperature: 31, threshold: 60 },
]

const chartConfig = {
  temperature: {
    label: 'Temperature',
    color: 'var(--chart-2)',
  },
  threshold: {
    label: 'Threshold',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

export function TemperatureChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Temperature Monitoring</CardTitle>
        <CardDescription>24-hour temperature readings from onboard sensors</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
              domain={[0, 80]}
              tickFormatter={(value) => `${value}°C`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#fillTemp)"
            />
            <Area
              type="monotone"
              dataKey="threshold"
              stroke="var(--chart-4)"
              strokeWidth={1}
              strokeDasharray="5 5"
              fill="none"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
