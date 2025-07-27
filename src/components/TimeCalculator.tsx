// TimeCalculator.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatMinutesToTime, formatHoursMinutes, calculateTimeDetails, calculateAverageDay, calculateOutsideRegularHours, parseTimeToMinutes } from '@/lib/timeUtils';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { getHolidays, isHoliday } from '@/lib/holidays';
import { Holiday } from '@/types';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDataManagement } from '@/hooks/useDataManagement';
import { HomeOfficeCard } from './HomeOfficeCard';
import { useSummary } from '@/hooks/useSummary';
import { useStatistics } from '@/hooks/useStatistics';
import { useYearData } from '@/hooks/useYearData';
import { AverageDayCard } from './AverageDayCard';
import { FreeDaysCard } from './FreeDaysCard';
import { OutsideRegularHoursCard } from './OutsideRegularHoursCard';
import { StatisticsCard } from './time-calculator/StatisticsCard';
import { AverageWorkdayHoursChart } from './AverageWorkdayHoursChart';
import { WeeklyHoursChart } from './WeeklyHoursChart';
import { WelcomePopup } from './WelcomePopup';
import { DateNavigator } from './time-calculator/DateNavigator';
import { TimeInputSection } from './time-calculator/TimeInputSection';
import { ResultsSection } from './time-calculator/ResultsSection';
import { SummarySection } from './time-calculator/SummarySection';
import { DataManagement, DataManagementHandles } from './time-calculator/DataManagement';
import { NotesCard } from './NotesCard';
import { TipsCard } from './TipsCard';
import VacationPlanningCard from './VacationPlanningCard';
import InfoCard from './InfoCard';
import { NotificationManager } from './NotificationManager';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;
const formatNotesKey = (date: Date): string => `zehelper_notes_${format(date, 'yyyy-MM-dd')}`;
const WEEKLY_HOURS_KEY = 'zehelper_weekly_hours';

const TimeCalculator = () => {
  const { cardVisibility } = useAppSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(38.5);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const { toast } = useToast();
  const dataManagementRef = useRef<DataManagementHandles>(null);
  const { yearData, updateYearData } = useYearData(selectedDate);
  const dailyTargetMinutes = useMemo(() => (weeklyTargetHours / 5) * 60, [weeklyTargetHours]);
  const { handleExportData, handleImportData, handleClearAllData, handleWebdeskImport } = useDataManagement();
  const { weeklySummary, monthlySummary, yearlySummary } = useSummary(selectedDate, yearData, dailyTargetMinutes);
  const statistics = useStatistics(yearData, dailyTargetMinutes);

  const [homeOfficeStats, setHomeOfficeStats] = useState({
    homeOfficeDaysWorkdays: 0,
    homeOfficeDaysWeekendsAndHolidays: 0,
    totalHomeOfficeHoursInNormalTime: 0,
    totalHomeOfficeHoursOutsideNormalTime: 0,
    pureOfficeDays: 0,
    hybridDays: 0,
    hoHoursPercentage: 0,
    hoDaysPercentage: 0,
  });

  useEffect(() => {
    let homeOfficeDaysWorkdays = 0;
    let homeOfficeDaysWeekendsAndHolidays = 0;
    let pureOfficeDays = 0;
    let hybridDays = 0;
    let totalHomeOfficeHours = 0;
    let totalOfficeHours = 0;
    let totalHomeOfficeHoursInNormalTime = 0;
    let totalHomeOfficeHoursOutsideNormalTime = 0;

    const NORMAL_WORK_START = 6 * 60;
    const NORMAL_WORK_END = 19 * 60;

    Object.keys(yearData).forEach(dateKey => {
      const input = yearData[dateKey];
      if (!input) return;

      const date = new Date(dateKey);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = isHoliday(date, holidays);
      
      const lines = input.split('\n');
      const hasHomeOffice = lines.some(line => line.toLowerCase().includes('homeoffice'));
      const hasOffice = lines.some(line => !line.toLowerCase().includes('homeoffice') && line.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/));

      if (isWeekend || holiday) {
        if (hasHomeOffice) homeOfficeDaysWeekendsAndHolidays++;
      } else {
        if (hasHomeOffice && !hasOffice) homeOfficeDaysWorkdays++;
        else if (hasOffice && !hasHomeOffice) pureOfficeDays++;
        else if (hasHomeOffice && hasOffice) hybridDays++;
      }

      lines.forEach(line => {
        const match = line.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (match) {
          const startMinutes = parseTimeToMinutes(match[1]);
          const endMinutes = parseTimeToMinutes(match[2]);
          const duration = endMinutes - startMinutes;

          if (line.toLowerCase().includes('homeoffice')) {
            totalHomeOfficeHours += duration;
            
            if (isWeekend || holiday) {
              totalHomeOfficeHoursOutsideNormalTime += duration;
            } else {
              const overlapStart = Math.max(startMinutes, NORMAL_WORK_START);
              const overlapEnd = Math.min(endMinutes, NORMAL_WORK_END);
              if (overlapEnd > overlapStart) {
                totalHomeOfficeHoursInNormalTime += (overlapEnd - overlapStart);
              }
              if (startMinutes < NORMAL_WORK_START) {
                totalHomeOfficeHoursOutsideNormalTime += Math.min(endMinutes, NORMAL_WORK_START) - startMinutes;
              }
              if (endMinutes > NORMAL_WORK_END) {
                totalHomeOfficeHoursOutsideNormalTime += endMinutes - Math.max(startMinutes, NORMAL_WORK_END);
              }
            }
          } else {
            totalOfficeHours += duration;
          }
        }
      });
    });

    const totalHours = totalHomeOfficeHours + totalOfficeHours;
    const hoHoursPercentage = totalHours > 0 ? (totalHomeOfficeHours / totalHours) * 100 : 0;
    
    const totalDays = homeOfficeDaysWorkdays + pureOfficeDays + hybridDays;
    const hoDaysPercentage = totalDays > 0 ? ((homeOfficeDaysWorkdays + hybridDays) / totalDays) * 100 : 0;

    setHomeOfficeStats({
      homeOfficeDaysWorkdays,
      homeOfficeDaysWeekendsAndHolidays,
      totalHomeOfficeHoursInNormalTime,
      totalHomeOfficeHoursOutsideNormalTime,
      pureOfficeDays,
      hybridDays,
      hoHoursPercentage,
      hoDaysPercentage,
    });
  }, [yearData, holidays]);

  const triggerImport = () => {
    dataManagementRef.current?.triggerImport();
  };

  const triggerWebdeskImport = () => {
    dataManagementRef.current?.triggerWebdeskImport();
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const savedHours = localStorage.getItem(WEEKLY_HOURS_KEY);
    if (savedHours) {
      setWeeklyTargetHours(parseFloat(savedHours));
    }

    const fetchHolidays = async () => {
      const year = selectedDate.getFullYear();
      const fetchedHolidays = await getHolidays(year, 'AT');
      setHolidays(fetchedHolidays);
    };
    fetchHolidays();
  }, [selectedDate]);

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const notesKey = formatNotesKey(selectedDate);
    const savedInput = localStorage.getItem(dateKey) || '';
    const savedNotes = localStorage.getItem(notesKey) || '';
    setInput(savedInput);
    setNotes(savedNotes);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem(WEEKLY_HOURS_KEY, weeklyTargetHours.toString());
  }, [weeklyTargetHours]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const currentData = localStorage.getItem(dateKey);
    if (input !== currentData) {
        if (input) {
            localStorage.setItem(dateKey, input);
        } else {
            localStorage.removeItem(dateKey);
        }
        updateYearData(selectedDate, input);
    }
  }, [input, selectedDate, updateYearData]);

  useEffect(() => {
    const notesKey = formatNotesKey(selectedDate);
    if (notes) {
      localStorage.setItem(notesKey, notes);
    } else {
      localStorage.removeItem(notesKey);
    }
  }, [notes, selectedDate]);

  const { timeEntries, errors, totalMinutes, totalBreak, breakDeduction, grossTotalMinutes, specialDayType } = useTimeCalculator(input, selectedDate, dailyTargetMinutes);

  const weeklyBalance = useMemo(() => {
    const targetMinutes = Math.round(weeklyTargetHours * 60);
    return weeklySummary - targetMinutes;
  }, [weeklySummary, weeklyTargetHours]);

  const weeklyChartData = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const data = [];

    for (const day of days) {
      const dayKey = format(day, 'yyyy-MM-dd');
      const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
      let dayInput = localStorage.getItem(formatDateKey(day)) || '';

      if (dayKey === selectedDateKey) {
        dayInput = input;
      }
      
      const details = calculateTimeDetails(dayInput, dayKey === format(new Date(), 'yyyy-MM-dd') ? currentTime : undefined, dailyTargetMinutes, false);
      data.push({ date: day, totalMinutes: details.totalMinutes });
    }
    return data;
  }, [selectedDate, input, currentTime, dailyTargetMinutes]);

  useEffect(() => {
    if (totalMinutes > 0) {
      document.title = `${formatMinutesToTime(totalMinutes)} - ZE-Helper`;
    } else {
      document.title = 'ZE-Helper';
    }
  }, [totalMinutes]);

  const clearInput = () => {
    setInput('');
    toast({
      title: "Eingaben für diesen Tag gelöscht",
      description: `Alle Zeitbuchungen für ${format(selectedDate, 'dd.MM.yyyy')} wurden entfernt.`
    });
  };

  const averageDayData = useMemo(() => {
    return calculateAverageDay(Object.values(yearData), currentTime, dailyTargetMinutes);
  }, [yearData, currentTime, dailyTargetMinutes]);

  const outsideRegularHours = useMemo(() => {
    const calculateTotalOutsideHours = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end });
      let total = 0;

      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayInput = yearData[dayKey];

        if (dayInput) {
          const details = calculateTimeDetails(dayInput, undefined, dailyTargetMinutes, false);
          total += calculateOutsideRegularHours(details.timeEntries, day, false);
        }
      });
      return total;
    };

    const yearlyStart = startOfYear(selectedDate);
    const yearlyEnd = endOfYear(selectedDate);
    
    let daysWithOutsideHours = 0;
    const yearDays = eachDayOfInterval({ start: yearlyStart, end: yearlyEnd });
    yearDays.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayInput = yearData[dayKey];
        if (dayInput) {
            const details = calculateTimeDetails(dayInput, undefined, dailyTargetMinutes, false);
            const outsideMinutes = calculateOutsideRegularHours(details.timeEntries, day, false);
            if (outsideMinutes > 0) {
                daysWithOutsideHours++;
            }
        }
    });

    const totalDaysWithEntries = Object.values(yearData).filter(d => d && d.trim() !== '').length;

    const weeklyStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weeklyEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const monthlyStart = startOfMonth(selectedDate);
    const monthlyEnd = endOfMonth(selectedDate);

    return {
      week: calculateTotalOutsideHours(weeklyStart, weeklyEnd),
      month: calculateTotalOutsideHours(monthlyStart, monthlyEnd),
      year: calculateTotalOutsideHours(yearlyStart, yearlyEnd),
      daysWithOutsideHours: daysWithOutsideHours,
      totalDaysWithEntries: totalDaysWithEntries,
    };
  }, [selectedDate, yearData]);

  const getCurrentTimeColor = () => {
    if (isHoliday(selectedDate, holidays)) {
      return 'text-yellow-500';
    }
    const day = currentTime.getDay();
    const hour = currentTime.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isWorkingHours = hour >= 6 && hour < 19;
    return isWeekday && isWorkingHours ? 'text-primary' : 'text-red-500';
  };

  const handlePunch = () => {
    const now = format(currentTime, 'HH:mm');
    const lines = input.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    if (lastLine.match(/^\d{2}:\d{2}\s*-\s*$/)) {
      const updatedInput = input.trim().replace(/-\s*$/, `- ${now}`);
      setInput(updatedInput);
      toast({ title: 'Ausgestempelt', description: `Zeitbuchung bis ${now} Uhr vervollständigt.` });
    } else {
      const newEntry = `${now} - `;
      const updatedInput = input ? `${input.trim()}\n${newEntry}` : newEntry;
      setInput(updatedInput);
      toast({ title: 'Eingestempelt', description: `Zeitbuchung um ${now} Uhr gestartet.` });
    }
  };

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

        <DateNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            {cardVisibility['currentTime'] !== false && <Card>
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
                    : isHoliday(selectedDate, holidays)
                    ? holidays.find(h => h.date === format(selectedDate, 'yyyy-MM-dd'))?.localName
                    : format(selectedDate, 'eeee', { locale: de })}
                </div>
              </CardContent>
            </Card>}

            {cardVisibility['averageDay'] !== false && averageDayData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <AverageDayCard
                  avgStart={averageDayData.avgStart}
                  avgEnd={averageDayData.avgEnd}
                  avgBreak={averageDayData.avgBreak}
                  avgHours={averageDayData.avgHours}
                />
              </motion.div>
            )}

            {cardVisibility['weeklyHours'] !== false && <WeeklyHoursChart
              data={weeklyChartData}
              currentWeekTotalMinutes={statistics.currentWeekTotalMinutes}
              previousWeekTotalMinutes={statistics.previousWeekTotalMinutes}
              selectedDate={selectedDate}
            />}

            {cardVisibility['summary'] !== false && <SummarySection
              weeklySummary={weeklySummary}
              monthlySummary={monthlySummary}
              yearlySummary={yearlySummary}
              weeklyBalance={weeklyBalance}
              weeklyTargetHours={weeklyTargetHours}
              setWeeklyTargetHours={setWeeklyTargetHours}
              selectedDate={selectedDate}
            />}
            <motion.div className="mt-6">
              <DataManagement
                ref={dataManagementRef}
                handleExportData={handleExportData}
                handleImportData={handleImportData}
                handleClearAllData={handleClearAllData}
                handleWebdeskImport={handleWebdeskImport}
              />
            </motion.div>
            {cardVisibility['homeOffice'] !== false && <motion.div className="mt-6">
              <HomeOfficeCard
                workdays={homeOfficeStats.homeOfficeDaysWorkdays}
                weekendsAndHolidays={homeOfficeStats.homeOfficeDaysWeekendsAndHolidays}
                hoursInNormalTime={formatHoursMinutes(homeOfficeStats.totalHomeOfficeHoursInNormalTime)}
                hoursOutsideNormalTime={formatHoursMinutes(homeOfficeStats.totalHomeOfficeHoursOutsideNormalTime)}
                pureOfficeDays={homeOfficeStats.pureOfficeDays}
                hybridDays={homeOfficeStats.hybridDays}
                hoHoursPercentage={homeOfficeStats.hoHoursPercentage}
                hoDaysPercentage={homeOfficeStats.hoDaysPercentage}
              />
            </motion.div>}
          </div>
          <div>
            {cardVisibility['timeInput'] !== false && <TimeInputSection
              input={input}
              setInput={setInput}
              errors={errors}
              timeEntries={timeEntries}
              selectedDate={selectedDate}
              clearInput={clearInput}
              specialDayType={specialDayType as "vacation" | "sick" | "holiday" | null}
            />}
            {cardVisibility['notes'] !== false && <motion.div className="mt-6">
              <NotesCard notes={notes} setNotes={setNotes} />
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
          </div>

          <div className="space-y-6">
            {cardVisibility['results'] !== false && <ResultsSection
              totalMinutes={totalMinutes}
              timeEntries={timeEntries}
              handlePunch={handlePunch}
              specialDayType={specialDayType as "vacation" | "sick" | "holiday" | null}
              selectedDate={selectedDate}
            />}
            {cardVisibility['vacation'] !== false && <VacationPlanningCard />}
            {cardVisibility['outsideRegularHours'] !== false && <OutsideRegularHoursCard
              selectedDate={selectedDate}
              outsideHoursWeek={formatHoursMinutes(outsideRegularHours.week)}
              outsideHoursMonth={formatHoursMinutes(outsideRegularHours.month)}
              outsideHoursYear={formatHoursMinutes(outsideRegularHours.year)}
              daysWithOutsideHours={outsideRegularHours.daysWithOutsideHours}
              totalDaysWithEntries={outsideRegularHours.totalDaysWithEntries}
              totalWeekMinutes={weeklySummary}
              totalMonthMinutes={monthlySummary}
              totalYearMinutes={yearlySummary}
              rawOutsideHoursWeek={outsideRegularHours.week}
              rawOutsideHoursMonth={outsideRegularHours.month}
              rawOutsideHoursYear={outsideRegularHours.year}
            />}
          </div>
          <div className="space-y-6">
            {cardVisibility['tips'] !== false && <TipsCard />}
            {cardVisibility['freeDays'] !== false && <FreeDaysCard year={selectedDate.getFullYear()} />}
            {cardVisibility['averageWorkdayHours'] !== false && <AverageWorkdayHoursChart data={statistics.averageDailyMinutes} />}
            {cardVisibility['statistics'] !== false && <StatisticsCard {...statistics} averageBlocksPerDay={statistics.averageBlocksPerDay} />}
          </div>
        </div>
        <NotificationManager />
      </motion.div>
    </div>
  );
};

export default TimeCalculator;
