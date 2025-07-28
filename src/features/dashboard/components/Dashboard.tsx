import React from 'react';
import { motion } from 'framer-motion';
import { gradients } from '@/lib/gradients';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Coffee } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { HomeOfficeCard } from './cards/HomeOfficeCard';
import { AverageDayCard } from './cards/AverageDayCard';
import { FreeDaysCard } from './cards/FreeDaysCard';
import { OutsideRegularHoursCard } from './cards/OutsideRegularHoursCard';
import { StatisticsCard } from './cards/StatisticsCard';
import { AverageWorkdayHoursChart } from './AverageWorkdayHoursChart';
import { WeeklyHoursChart } from './WeeklyHoursChart';
import { WelcomePopup } from './WelcomePopup';
import { DateNavigator } from '@/features/time-calculator/components/DateNavigator';
import { TimeInputSection } from '@/features/time-calculator/components/TimeInputSection';
import { ResultsSection } from '@/features/time-calculator/components/ResultsSection';
import { SummarySection } from '@/features/time-calculator/components/SummarySection';
import { DataManagement } from '@/features/time-calculator/components/DataManagement';
import { NotesCard } from './cards/NotesCard';
import { TipsCard } from './cards/TipsCard';
import VacationPlanningCard from './cards/VacationPlanningCard';
import InfoCard from './cards/InfoCard';
import { NotificationManager } from './NotificationManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatHoursMinutes } from '@/lib/timeUtils';

const Dashboard = () => {
  const { cardVisibility, gradientId, setGradientId } = useAppSettings();

  const changeBackground = () => {
    const currentIndex = gradients.findIndex(g => g.id === gradientId);
    const nextIndex = (currentIndex + 1) % gradients.length;
    const nextGradient = gradients[nextIndex];
    setGradientId(nextGradient.id);
  };

  const {
    selectedDate,
    setSelectedDate,
    currentTime,
    holidays,
    dataManagementRef,
    triggerImport,
    triggerWebdeskImport,
    averageDayData,
    getCurrentTimeColor,
    totalBreak,
    breakDeduction,
    grossTotalMinutes,
  } = useTimeCalculatorContext();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <WelcomePopup onTriggerImport={triggerImport} onTriggerWebdeskImport={triggerWebdeskImport} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex justify-center items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Clock className="h-8 w-8 text-primary" />
            <Tooltip>
              <TooltipTrigger asChild>
                <h1
                  className="text-3xl font-bold text-foreground cursor-pointer"
                  onClick={() => setSelectedDate(new Date())}
                >
                  ZE-Helper
                </h1>
              </TooltipTrigger>
              <TooltipContent>
                <p>Klick mich um zum aktuellen Tag zu wechseln</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </div>

        <DateNavigator />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            {cardVisibility['currentTime'] !== false && <Card onClick={changeBackground} className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {isToday(selectedDate) ? 'Aktuelle Uhrzeit' : 'Tag'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCurrentTimeColor()}`}>
                  {isToday(selectedDate)
                    ? format(currentTime, 'HH:mm:ss')
                    : holidays.find(h => h.date === format(selectedDate, 'yyyy-MM-dd'))?.localName
                    ?? format(selectedDate, 'eeee', { locale: de })}
                </div>
              </CardContent>
            </Card>}

            {cardVisibility['averageDay'] !== false && averageDayData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <AverageDayCard />
              </motion.div>
            )}

            {cardVisibility['weeklyHours'] !== false && <WeeklyHoursChart />}

            {cardVisibility['summary'] !== false && <SummarySection />}
            {cardVisibility['homeOffice'] !== false && <motion.div className="mt-6">
              <HomeOfficeCard />
            </motion.div>}
          </div>
          <div>
            {cardVisibility['timeInput'] !== false && <TimeInputSection />}
            {cardVisibility['notes'] !== false && <motion.div className="mt-6">
              <NotesCard />
            </motion.div>}
            {cardVisibility['breakInfo'] !== false && <motion.div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Pauseninfo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Konsumierte Pausen</span>
                      <span className="text-sm font-bold">{formatHoursMinutes(totalBreak)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      {(() => {
                        if (breakDeduction > 0) {
                          return <span className="text-destructive">{`Gesetzliche Pause (${breakDeduction}m) wurde von der Arbeitszeit abgezogen.`}</span>;
                        }
                        if (grossTotalMinutes >= 360 && totalBreak >= 30) {
                          return <span className="text-green-500">Die Pausenzeit von 30 Minuten wurde erreicht.</span>;
                        }
                        if (grossTotalMinutes >= 360 && totalBreak < 30) {
                          return `Restliche ${30 - totalBreak}m Pause werden noch abgezogen.`;
                        }
                        return "Bei über 6h Arbeit sind 30m Pause Pflicht.";
                      })()}
                    </p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <a href='https://ko-fi.com/R6R21IOETB' target='_blank' rel="noopener noreferrer">
                      <img height='36' style={{ border: 0, height: '36px' }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' alt='Buy Me a Coffee at ko-fi.com' />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>}
            {cardVisibility['info'] !== false && <motion.div className="mt-6">
              <InfoCard />
            </motion.div>}
            <motion.div className="mt-6">
              <DataManagement ref={dataManagementRef} />
            </motion.div>
          </div>

          <div className="space-y-6">
            {cardVisibility['results'] !== false && <ResultsSection />}
            {cardVisibility['vacation'] !== false && <VacationPlanningCard />}
            {cardVisibility['outsideRegularHours'] !== false && <OutsideRegularHoursCard />}
          </div>
          <div className="space-y-6">
            {cardVisibility['tips'] !== false && <TipsCard />}
            {cardVisibility['freeDays'] !== false && <FreeDaysCard />}
            {cardVisibility['averageWorkdayHours'] !== false && <AverageWorkdayHoursChart />}
            {cardVisibility['statistics'] !== false && <StatisticsCard />}
          </div>
        </div>
        <NotificationManager />
      </motion.div>
    </div>
  );
};

export default Dashboard;
