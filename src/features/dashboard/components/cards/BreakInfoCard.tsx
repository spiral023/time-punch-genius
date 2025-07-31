import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { Coffee, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BreakInfoCard: React.FC = () => {
  const { totalBreak, breakDeduction, grossTotalMinutes, breakCompliance, statistics, setSelectedDate } = useTimeCalculatorContext();
  const {
    longestBreak,
    longestBreakDate,
    daysWithoutRequiredBreak,
    daysWithInsufficientSingleBreak,
    daysWithBreakViolations,
    totalMissedBreakMinutes,
  } = statistics;

  const getComplianceIcon = () => {
    if (grossTotalMinutes < 360) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (!breakCompliance) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (breakCompliance.isCompliant) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getComplianceMessage = () => {
    if (grossTotalMinutes < 360) {
      return <span className="text-green-500">Keine Pausenpflicht bei unter 6h Arbeitszeit.</span>;
    }

    if (!breakCompliance) {
      return <span className="text-green-500">Keine Pausenpflicht für Sondertage.</span>;
    }

    if (breakCompliance.isCompliant) {
      return <span className="text-green-500">✅ Vollständig gesetzeskonform</span>;
    }

    if (breakCompliance.violations && breakCompliance.violations.length === 2) {
      return <span className="text-red-500">❌ Gesetzesverletzung: {breakCompliance.violations.join(' und ')}</span>;
    }

    if (!breakCompliance.hasRequiredTotalBreak) {
      return <span className="text-yellow-600">⚠️ {breakCompliance.violations?.[0] || 'Pausenproblem'} - wird automatisch abgezogen</span>;
    }

    if (!breakCompliance.hasMinimumSingleBreak) {
      return <span className="text-red-500">❌ {breakCompliance.violations?.[0] || 'Pausenproblem'}</span>;
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          Pauseninfo
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>Österreichisches Arbeitszeitgesetz:</strong><br />
                  Bei über 6h Arbeitszeit sind mindestens 30 Minuten Pause erforderlich. 
                  Bei mehreren Pausen muss eine davon mindestens 10 Minuten betragen.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Konsumierte Pausen</span>
            <span className="text-sm font-bold">{formatHoursMinutes(totalBreak)}</span>
          </div>
          
          {grossTotalMinutes >= 360 && breakCompliance && (
            <div className="flex justify-between">
              <span className="text-sm">Längste Einzelpause</span>
              <span className="text-sm font-bold">{formatHoursMinutes(breakCompliance.longestSingleBreak)}</span>
            </div>
          )}

          <div className="flex items-start gap-2 pt-2">
            {getComplianceIcon()}
            <p className="text-sm text-muted-foreground flex-1">
              {getComplianceMessage()}
            </p>
          </div>

          {grossTotalMinutes >= 360 && breakCompliance && !breakCompliance.hasMinimumSingleBreak && breakCompliance.hasRequiredTotalBreak && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
              <p className="text-sm text-red-700">
                <strong>💡 Tipp:</strong> Verlänger eine deiner Pausen auf mindestens 10 Minuten, 
                um vollständig gesetzeskonform zu sein. Kurze Pausen sind zusätzlich erlaubt.
              </p>
            </div>
          )}

          {/* Pausenstatistiken */}
          <div className="border-t pt-4 mt-4 space-y-3">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Längste Pause</span>
                <motion.span
                  key={`longest-break-${longestBreak}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (longestBreakDate) {
                      setSelectedDate(new Date(longestBreakDate));
                    }
                  }}
                >
                  {longestBreak ? formatHoursMinutes(longestBreak) : '-'}
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {longestBreakDate ? format(new Date(longestBreakDate), 'dd.MM.yyyy', { locale: de }) : ''}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Tage ohne Pflichtpause</span>
                <motion.span
                  key={`days-without-break-${daysWithoutRequiredBreak}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-bold text-sm ${daysWithoutRequiredBreak > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {daysWithoutRequiredBreak} Tage
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Gesamtpause &lt; 30min
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Tage ohne 10min-Pause</span>
                <motion.span
                  key={`days-insufficient-single-break-${daysWithInsufficientSingleBreak}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-bold text-sm ${daysWithInsufficientSingleBreak > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {daysWithInsufficientSingleBreak} Tage
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Keine Einzelpause ≥10min
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Arbeitszeitverletzungen</span>
                <motion.span
                  key={`days-break-violations-${daysWithBreakViolations}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-bold text-sm ${daysWithBreakViolations > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {daysWithBreakViolations} Tage
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Pausenregelung nicht eingehalten
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Nicht konsumierte Pausenzeit</span>
                <motion.span
                  key={`total-missed-break-${totalMissedBreakMinutes}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-bold text-sm ${
                    totalMissedBreakMinutes === 0 ? 'text-green-500' : 
                    totalMissedBreakMinutes <= 120 ? 'text-orange-500' : 'text-red-500'
                  }`}
                >
                  {totalMissedBreakMinutes > 0 ? formatHoursMinutes(totalMissedBreakMinutes) : '-'}
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                An Werktagen im Jahr
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <a href='https://ko-fi.com/R6R21IOETB' target='_blank' rel="noopener noreferrer">
            <img height='36' style={{ border: 0, height: '46px' }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' alt='Buy Me a Coffee at ko-fi.com' />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
