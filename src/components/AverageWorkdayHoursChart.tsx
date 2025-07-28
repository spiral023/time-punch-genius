"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2 } from "lucide-react"

interface AverageWorkdayHoursChartProps {
  data: { day: string; averageMinutes: number }[]
}

const chartConfig = {
  hours: {
    label: "Stunden",
    color: "hsl(var(--chart-1))",
  },
  goal: {
    label: "Soll",
    color: "hsl(var(--destructive))",
  }
} satisfies ChartConfig

const getBarColorByMinutes = (minutes: number): string => {
  if (minutes === 0) {
    return "hsl(var(--muted))"; // grey for no data
  } else if (minutes < 360) { // unter 06:00
    return "hsl(var(--destructive))"; // red
  } else if (minutes >= 360 && minutes < 462) { // zwischen 06:00 und 07:42
    return "hsl(262.1 83.3% 57.8%)"; // purple
  } else if (minutes >= 462 && minutes < 570) { // zwischen 07:42 und 09:30
    return "hsl(142.1 76.2% 36.3%)"; // green
  } else if (minutes >= 570 && minutes < 600) { // zwischen 09:30 und 10:00
    return "hsl(47.9 95.8% 53.1%)"; // yellow
  } else { // über 10:00
    return "hsl(var(--destructive))"; // red
  }
};

export const AverageWorkdayHoursChart: React.FC<AverageWorkdayHoursChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    day: item.day,
    hours: parseFloat((item.averageMinutes / 60).toFixed(2)),
    fill: getBarColorByMinutes(item.averageMinutes),
  }));

  // Reorder data to start with Monday
  const orderedChartData = [
    ...chartData.filter(d => d.day !== 'So'),
    ...chartData.filter(d => d.day === 'So')
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Durchschnitt pro Wochentag
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={orderedChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              unit="h"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name, props) => [`${props.payload.hours} Stunden`, null]}
              />}
            />
            <Bar dataKey="hours" radius={4} isAnimationActive={false}>
              {orderedChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
            <ReferenceLine 
              y={7.7} 
              stroke="var(--color-goal)" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
