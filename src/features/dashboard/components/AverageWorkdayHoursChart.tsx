"use client"

import * as React from "react"
import { getYear } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart2 } from "lucide-react"
import { formatHoursMinutes } from "@/lib/timeUtils"
import { useTimeCalculatorContext } from "@/features/time-calculator/contexts/TimeCalculatorContext"

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

export const AverageWorkdayHoursChart: React.FC = () => {
  const { statistics, selectedDate } = useTimeCalculatorContext();
  
  // Create a proper mapping to reorder days starting with Monday
  const dayOrder = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const orderedChartData = dayOrder.map(dayName => {
    const dayData = statistics.averageDailyMinutes.find(item => item.day === dayName);
    return {
      day: dayName,
      hours: dayData ? parseFloat((dayData.averageMinutes / 60).toFixed(2)) : 0,
      fill: getBarColorByMinutes(dayData ? dayData.averageMinutes : 0),
      averageMinutes: dayData ? dayData.averageMinutes : 0, // Keep original minutes for tooltip
    };
  });

  const maxHours = Math.max(...orderedChartData.map(item => item.hours), 7.7);
  const yAxisMax = Math.ceil(maxHours);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Durchschnitt pro Wochentag
        </CardTitle>
        <CardDescription>Durchschnitt für das Jahr {getYear(selectedDate)}</CardDescription>
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
              domain={[0, yAxisMax]}
            />
            <ChartTooltip
              cursor={false}
              allowEscapeViewBox={{ x: false, y: false }}
              position={{ x: undefined, y: undefined }}
              content={<ChartTooltipContent 
                labelFormatter={(label) => {
                  // Ensure we show the correct day name from the label
                  const dayNames = {
                    'Mo': 'Montag',
                    'Di': 'Dienstag', 
                    'Mi': 'Mittwoch',
                    'Do': 'Donnerstag',
                    'Fr': 'Freitag',
                    'Sa': 'Samstag',
                    'So': 'Sonntag'
                  };
                  return dayNames[label as keyof typeof dayNames] || label;
                }}
                formatter={(value, name, props) => {
                  // Use the averageMinutes from the payload to ensure accuracy and round to whole minutes
                  const rawMinutes = props.payload.averageMinutes || (parseFloat(value as string) * 60);
                  const roundedMinutes = Math.round(rawMinutes);
                  return [formatHoursMinutes(roundedMinutes), null];
                }}
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
