import { DashboardLayout } from '@/types';
import { AverageDayCard } from '../components/cards/AverageDayCard';
import { BreakInfoCard } from '../components/cards/BreakInfoCard';
import { CurrentTimeCard } from '../components/cards/CurrentTimeCard';
import { FreeDaysCard } from '../components/cards/FreeDaysCard';
import { HomeOfficeCard } from '../components/cards/HomeOfficeCard';
import InfoCard from '../components/cards/InfoCard';
import { NotesCard } from '../components/cards/NotesCard';
import { OutsideRegularHoursCard } from '../components/cards/OutsideRegularHoursCard';
import { StatisticsCard } from '../components/cards/StatisticsCard';
import { TipsCard } from '../components/cards/TipsCard';
import VacationPlanningCard from '../components/cards/VacationPlanningCard';
import { WorkingTimeCard } from '../components/cards/WorkingTimeCard';
import { TargetTimesCard } from '../components/cards/TargetTimesCard';
import { AverageWorkdayHoursChart } from '../components/AverageWorkdayHoursChart';
import { WeeklyHoursChart } from '../components/WeeklyHoursChart';
import HeatmapCard from '../components/cards/HeatmapCard';
import { TimeInputSection } from '@/features/time-calculator/components/TimeInputSection';
import { SummarySection } from '@/features/time-calculator/components/SummarySection';
import { DataManagement } from '@/features/time-calculator/components/DataManagement';

export interface CardMeta {
  id: string;
  name: string;
  component: React.ComponentType;
}

export const cardRegistry: Record<string, CardMeta> = {
  currentTime: { id: 'currentTime', name: 'Aktuelle Uhrzeit', component: CurrentTimeCard },
  summary: { id: 'summary', name: 'Zusammenfassung', component: SummarySection },
  timeInput: { id: 'timeInput', name: 'Erfasste Zeiten', component: TimeInputSection },
  workingTime: { id: 'workingTime', name: 'Arbeitszeit', component: WorkingTimeCard },
  targetTimes: { id: 'targetTimes', name: 'Zielzeiten', component: TargetTimesCard },
  breakInfo: { id: 'breakInfo', name: 'Pauseninfo', component: BreakInfoCard },
  statistics: { id: 'statistics', name: 'Statistik', component: StatisticsCard },
  homeOffice: { id: 'homeOffice', name: 'Home-Office', component: HomeOfficeCard },
  vacation: { id: 'vacation', name: 'Urlaubsplanung', component: VacationPlanningCard },
  notes: { id: 'notes', name: 'Notizen', component: NotesCard },
  tips: { id: 'tips', name: 'Tipp des Tages', component: TipsCard },
  freeDays: { id: 'freeDays', name: 'Freie Tage', component: FreeDaysCard },
  averageDay: { id: 'averageDay', name: 'Mein durchschnittlicher Tag', component: AverageDayCard },
  weeklyHours: { id: 'weeklyHours', name: 'Diese Woche', component: WeeklyHoursChart },
  outsideRegularHours: { id: 'outsideRegularHours', name: 'Außerhalb Normalzeit', component: OutsideRegularHoursCard },
  averageWorkdayHours: { id: 'averageWorkdayHours', name: 'Durchschnitt pro Wochentag', component: AverageWorkdayHoursChart },
  heatmap: { id: 'heatmap', name: 'Arbeits-Heatmap', component: HeatmapCard },
  info: { id: 'info', name: 'Infos', component: InfoCard },
  // dataManagement is handled as a special case in Dashboard.tsx because of the ref
};


export const defaultLayout: DashboardLayout = {
  version: 3,
  columns: [
    ['currentTime', 'averageDay', 'weeklyHours', 'summary', 'homeOffice', 'info'],
    ['timeInput', 'notes', 'breakInfo'],
    ['workingTime', 'targetTimes', 'vacation', 'outsideRegularHours'],
    ['tips', 'heatmap', 'freeDays', 'averageWorkdayHours', 'statistics'],
  ],
};

// 2-Spalten Layout
export const twoColumnLayout: DashboardLayout = {
  version: 3,
  columns: [
    [
      'currentTime',
      'workingTime', 
      'averageDay',
      'targetTimes',
      'weeklyHours',
      'vacation',
      'summary',
      'outsideRegularHours',
      'homeOffice',
    ],
    [
      'timeInput',
      'tips',
      'heatmap',
      'notes',
      'freeDays',
      'breakInfo',
      'averageWorkdayHours',
      'statistics',
      'info'
    ],
    [], // Leere Spalte 3
    []  // Leere Spalte 4
  ],
};

// 3-Spalten Layout
export const threeColumnLayout: DashboardLayout = {
  version: 3,
  columns: [
    [
      'currentTime',
      'workingTime',
      'averageDay',
      'weeklyHours',
      'summary',
      'homeOffice',
      'info',
    ],
    [
      'timeInput',
      'targetTimes',
      'vacation',
      'outsideRegularHours',
      'averageWorkdayHours'
    ],
    [
      'tips',
      'heatmap',
      'notes',
      'freeDays',
      'breakInfo',
      'statistics'
    ],
    [] // Leere Spalte 4
  ],
};

// 1-Spalten Layout
export const oneColumnLayout: DashboardLayout = {
  version: 3,
  columns: [
    [
      'currentTime',
      'workingTime',
      'averageDay',
      'timeInput',
      'targetTimes',
      'heatmap',
      'weeklyHours',
      'notes',
      'vacation',
      'freeDays',
      'summary',
      'breakInfo',
      'outsideRegularHours',
      'averageWorkdayHours',
      'homeOffice',
      'info',
      'statistics',
      'tips'
    ],
    [], // Leere Spalte 2
    [], // Leere Spalte 3
    []  // Leere Spalte 4
  ],
};
