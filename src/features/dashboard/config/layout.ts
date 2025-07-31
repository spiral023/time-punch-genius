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
  info: { id: 'info', name: 'Infos', component: InfoCard },
  // dataManagement is handled as a special case in Dashboard.tsx because of the ref
};

export interface DashboardLayout {
  version: number;
  columns: string[][];
}

export const defaultLayout: DashboardLayout = {
  version: 3,
  columns: [
    ['currentTime', 'averageDay', 'weeklyHours', 'summary', 'homeOffice'],
    ['timeInput', 'notes', 'breakInfo', 'info'],
    ['workingTime', 'targetTimes', 'vacation', 'outsideRegularHours'],
    ['tips', 'freeDays', 'averageWorkdayHours', 'statistics'],
  ],
};
