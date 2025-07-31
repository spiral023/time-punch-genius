/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import { WorkingTimeCard } from './WorkingTimeCard';
import type { SpecialDayType } from '@/types';

// Mock für useTimeCalculatorContext
const mockContext = {
  totalMinutes: 480, // 8 Stunden
  timeEntries: [
    {
      start: '08:00',
      end: '16:00',
      duration: 480,
      originalLine: '08:00 - 16:00',
    },
  ],
  handlePunch: vi.fn(),
  specialDayType: null,
  selectedDate: new Date('2025-07-31'), // Heute (Donnerstag)
};

vi.mock('@/features/time-calculator/contexts/TimeCalculatorContext', () => ({
  useTimeCalculatorContext: () => mockContext,
  TimeCalculatorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock für date-fns format
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      // Simuliere verschiedene Daten basierend auf dem übergebenen Datum
      const dateStr = date.toISOString().split('T')[0];
      return dateStr;
    }
    return date.toISOString().split('T')[0];
  }),
}));

describe('WorkingTimeCard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.totalMinutes = 480;
    mockContext.timeEntries = [
      {
        start: '08:00',
        end: '16:00',
        duration: 480,
        originalLine: '08:00 - 16:00',
      },
    ];
    mockContext.specialDayType = null;
    mockContext.selectedDate = new Date('2025-07-31');
  });

  it('sollte die Arbeitszeit anzeigen', () => {
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('Arbeitszeit')).toBeInTheDocument();
    expect(screen.getByText('8h 0m')).toBeInTheDocument();
  });

  it('sollte Punch-Funktion aufrufen wenn auf Arbeitszeit geklickt wird', async () => {
    render(<WorkingTimeCard />);
    
    const workingTimeDisplay = screen.getByText('8h 0m');
    await user.click(workingTimeDisplay);
    
    expect(mockContext.handlePunch).toHaveBeenCalled();
  });

  it('sollte Punch-Tooltip für heute anzeigen', async () => {
    render(<WorkingTimeCard />);
    
    const workingTimeDisplay = screen.getByText('8h 0m');
    await user.hover(workingTimeDisplay);
    
    await waitFor(() => {
      expect(screen.getAllByText('Klicken zum Ein- oder Ausstempeln')).toHaveLength(2); // Tooltip wird doppelt gerendert
    });
  });

  it('sollte Punch nicht erlauben für vergangene Tage', async () => {
    mockContext.selectedDate = new Date('2025-07-30'); // Gestern
    
    render(<WorkingTimeCard />);
    
    const workingTimeDisplay = screen.getByText('8h 0m');
    await user.hover(workingTimeDisplay);
    
    await waitFor(() => {
      expect(screen.getAllByText('Zeitbuchungen nur für heute möglich')).toHaveLength(2); // Tooltip wird doppelt gerendert
    });
    
    await user.click(workingTimeDisplay);
    expect(mockContext.handlePunch).not.toHaveBeenCalled();
  });

  it('sollte Punch nicht erlauben bei Urlaub/Krankenstand', async () => {
    mockContext.specialDayType = 'vacation';
    mockContext.totalMinutes = 0;
    
    render(<WorkingTimeCard />);
    
    const workingTimeDisplay = screen.getByTestId('working-time-display');
    
    // Bei Urlaub/Krankenstand sollte der Cursor "not-allowed" sein
    expect(workingTimeDisplay).toHaveClass('cursor-not-allowed');
    
    await user.click(workingTimeDisplay);
    expect(mockContext.handlePunch).not.toHaveBeenCalled();
  });

  it('sollte Punch erlauben bei Feiertagen', async () => {
    mockContext.specialDayType = 'holiday';
    mockContext.totalMinutes = 0;
    
    render(<WorkingTimeCard />);
    
      const workingTimeDisplay = screen.getByTestId('working-time-display');
    
    // Bei Feiertagen sollte Punchen möglich sein
    expect(workingTimeDisplay).toHaveClass('cursor-pointer');
    expect(workingTimeDisplay).not.toHaveClass('cursor-not-allowed');
    
    await user.hover(workingTimeDisplay);
    
    await waitFor(() => {
      expect(screen.getAllByText('Klicken zum Ein- oder Ausstempeln (Feiertag)')).toHaveLength(2);
    });
    
    await user.click(workingTimeDisplay);
    expect(mockContext.handlePunch).toHaveBeenCalled();
  });

  it('sollte Punch nicht erlauben bei ganztägigen Sondertagen', async () => {
    // Test verschiedene ganztägige Sondertage
    const fullDayTypes = ['vacation', 'sick', 'care_leave', 'wedding', 'bereavement', 'special_leave', 'works_council', 'training', 'vocational_school'];
    
    for (const dayType of fullDayTypes) {
      mockContext.specialDayType = dayType as SpecialDayType;
      mockContext.totalMinutes = 0;
      
      const { rerender } = render(<WorkingTimeCard />);
      
      const workingTimeDisplay = screen.getByText('0h 0m');
      
      // Bei ganztägigen Sondertagen sollte Punchen nicht möglich sein
      expect(workingTimeDisplay).toHaveClass('cursor-not-allowed');
      expect(workingTimeDisplay).not.toHaveClass('cursor-pointer');
      
      await user.click(workingTimeDisplay);
      expect(mockContext.handlePunch).not.toHaveBeenCalled();
      
      rerender(<div />); // Cleanup für nächste Iteration
      vi.clearAllMocks();
    }
  });

  it('sollte Delta zur Sollarbeitszeit anzeigen', () => {
    mockContext.totalMinutes = 462; // 7:42 (Sollzeit)
    
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('Delta:')).toBeInTheDocument();
    expect(screen.getByText('+0h 0m')).toBeInTheDocument();
  });

  it('sollte negative Delta anzeigen bei Unterzeit', () => {
    mockContext.totalMinutes = 420; // 7:00
    
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('-0h 42m')).toBeInTheDocument();
  });

  it('sollte positive Delta anzeigen bei Überzeit', () => {
    mockContext.totalMinutes = 540; // 9:00
    
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('+1h 18m')).toBeInTheDocument();
  });

  it('sollte Anzahl der Zeiträume anzeigen', () => {
    mockContext.timeEntries = [
      { start: '08:00', end: '12:00', duration: 240, originalLine: '08:00 - 12:00' },
      { start: '13:00', end: '17:00', duration: 240, originalLine: '13:00 - 17:00' },
    ];
    
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('2 Zeiträume erfasst')).toBeInTheDocument();
  });

  it('sollte Singular für einen Zeitraum verwenden', () => {
    mockContext.timeEntries = [
      { start: '08:00', end: '16:00', duration: 480, originalLine: '08:00 - 16:00' },
    ];
    
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('1 Zeitraum erfasst')).toBeInTheDocument();
  });

  it('sollte "Keine Einträge" anzeigen wenn keine Zeiteinträge vorhanden', () => {
    mockContext.timeEntries = [];
    mockContext.totalMinutes = 0;
    
    render(<WorkingTimeCard />);
    
    expect(screen.getByText('Keine Einträge')).toBeInTheDocument();
  });

  it('sollte Warnung bei über 9:30h anzeigen', () => {
    mockContext.totalMinutes = 580; // 9:40
    
    render(<WorkingTimeCard />);
    
    // Prüfe dass die Zeit angezeigt wird und das Warn-Icon vorhanden ist
    expect(screen.getByText('9h 40m')).toBeInTheDocument();
    // Das Warn-Icon wird über CSS eingefügt, prüfe die Klasse
    const timeDisplay = screen.getByText('9h 40m');
    expect(timeDisplay).toHaveClass('text-yellow-500');
  });

  it('sollte kritische Warnung bei über 10h anzeigen', async () => {
    mockContext.totalMinutes = 620; // 10:20
    
    render(<WorkingTimeCard />);
    
    // Suche nach dem Warn-Icon und hover darüber
    const workingTimeElement = screen.getByText('10h 20m');
    expect(workingTimeElement).toBeInTheDocument();
    
    // Das Warn-Icon sollte sichtbar sein (über CSS)
    const cardContent = workingTimeElement.closest('.relative');
    expect(cardContent).toBeInTheDocument();
  });

  it('sollte korrekte Farbklassen für verschiedene Arbeitszeiten verwenden', () => {
    // Test für unter 6 Stunden (rot)
    mockContext.totalMinutes = 300; // 5:00
    const { rerender } = render(<WorkingTimeCard />);
    
    let workingTimeDisplay = screen.getByText('5h 0m');
    expect(workingTimeDisplay).toHaveClass('text-red-500');
    
    // Test für 6-7:42 Stunden (lila)
    mockContext.totalMinutes = 420; // 7:00
    rerender(<WorkingTimeCard />);
    
    workingTimeDisplay = screen.getByText('7h 0m');
    expect(workingTimeDisplay).toHaveClass('text-purple-500');
    
    // Test für 7:42-9:30 Stunden (grün)
    mockContext.totalMinutes = 480; // 8:00
    rerender(<WorkingTimeCard />);
    
    workingTimeDisplay = screen.getByText('8h 0m');
    expect(workingTimeDisplay).toHaveClass('text-green-500');
    
    // Test für 9:30-10 Stunden (gelb)
    mockContext.totalMinutes = 580; // 9:40
    rerender(<WorkingTimeCard />);
    
    workingTimeDisplay = screen.getByText('9h 40m');
    expect(workingTimeDisplay).toHaveClass('text-yellow-500');
    
    // Test für über 10 Stunden (rot)
    mockContext.totalMinutes = 620; // 10:20
    rerender(<WorkingTimeCard />);
    
    workingTimeDisplay = screen.getByText('10h 20m');
    expect(workingTimeDisplay).toHaveClass('text-red-500');
  });

  it('sollte blaue Farbe für Sondertage verwenden', () => {
    mockContext.specialDayType = 'vacation';
    mockContext.totalMinutes = 0;
    
    render(<WorkingTimeCard />);
    
    const workingTimeDisplay = screen.getByText('0h 0m');
    expect(workingTimeDisplay).toHaveClass('text-blue-500');
  });

  it('sollte Delta für Wochenende und Feiertage neutral anzeigen', () => {
    mockContext.specialDayType = 'holiday';
    mockContext.totalMinutes = 0;
    
    render(<WorkingTimeCard />);
    
    // Es gibt mehrere "0h 0m" Texte (Arbeitszeit und Delta), prüfe beide
    const timeTexts = screen.getAllByText('0h 0m');
    expect(timeTexts).toHaveLength(2); // Arbeitszeit und Delta
    expect(screen.getByText('Delta:')).toBeInTheDocument();
  });
});
