'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const chartData = [
  { day: 'Mon', detected: 2, extinguished: 2 },
  { day: 'Tue', detected: 1, extinguished: 1 },
  { day: 'Wed', detected: 3, extinguished: 3 },
  { day: 'Thu', detected: 0, extinguished: 0 },
  { day: 'Fri', detected: 2, extinguished: 2 },
  { day: 'Sat', detected: 1, extinguished: 1 },
  { day: 'Sun', detected: 3, extinguished: 2 },
]

const chartConfig = {
  detected: {
    label: 'Detected',
    color: 'var(--chart-4)',
  },
  extinguished: {
    label: 'Extinguished',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function FireEventsChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Fire Events</CardTitle>
        <CardDescription>Weekly fire detection and response statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
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
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="detected" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="extinguished" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
