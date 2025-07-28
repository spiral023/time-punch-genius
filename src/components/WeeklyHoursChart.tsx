"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, isToday } from 'date-fns'
import { de } from 'date-fns/locale'
import { BarChart2 } from "lucide-react"
import { formatHoursMinutes } from "@/lib/timeUtils"

interface WeeklyHoursChartProps {
  data: { date: Date; totalMinutes: number }[]
  currentWeekTotalMinutes: number
  previousWeekTotalMinutes: number
  selectedDate: Date
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
  if (minutes < 360) { // unter 06:00
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

export const WeeklyHoursChart: React.FC<WeeklyHoursChartProps> = ({ data, currentWeekTotalMinutes, previousWeekTotalMinutes, selectedDate }) => {
  const chartData = data.map(item => ({
    date: format(item.date, 'eee', { locale: de }),
    hours: parseFloat((item.totalMinutes / 60).toFixed(2)),
    fill: getBarColorByMinutes(item.totalMinutes),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Diese Woche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
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
                labelFormatter={(value) => {
                  const fullDate = data.find(d => format(d.date, 'eee', { locale: de }) === value)?.date
                  return fullDate ? format(fullDate, 'eeee, dd.MM', { locale: de }) : value
                }}
                formatter={(value) => [`${value} Stunden`, null]}
              />}
            />
            <Bar dataKey="hours" radius={4} isAnimationActive={false}>
              {chartData.map((entry, index) => (
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
        {isToday(selectedDate) && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>
              <strong className={currentWeekTotalMinutes >= previousWeekTotalMinutes ? "text-green-500" : "text-red-500"}>
                {currentWeekTotalMinutes >= previousWeekTotalMinutes ? "Du hast" : "Du hast"} {formatHoursMinutes(Math.abs(currentWeekTotalMinutes - previousWeekTotalMinutes))} {currentWeekTotalMinutes >= previousWeekTotalMinutes ? "mehr" : "weniger"} gearbeitet als letzte Woche.
              </strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
