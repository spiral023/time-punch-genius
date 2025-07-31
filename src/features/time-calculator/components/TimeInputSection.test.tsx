import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeInputSection } from './TimeInputSection';
import { useTimeCalculatorContext } from '../contexts/TimeCalculatorContext';
import { createMockTimeCalculatorContext } from '@/test/mock-factories';

// Mock the context
vi.mock('../contexts/TimeCalculatorContext');

const mockUseTimeCalculatorContext = vi.mocked(useTimeCalculatorContext);

describe('TimeInputSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Holiday functionality', () => {
    it('should show textarea with holiday styling on holidays', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: 'holiday',
        input: '',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      // Textarea sollte sichtbar sein
      const textarea = screen.getByTestId('time-input-textarea');
      expect(textarea).toBeInTheDocument();
      
      // Holiday-spezifischer Placeholder
      expect(textarea).toHaveAttribute('placeholder', 
        'Feiertag - Zeitbuchungen im Format HH:mm-HH:mm eingeben (falls gearbeitet wird).'
      );
      
      // Holiday-Styling
      expect(textarea).toHaveClass('border-yellow-200', 'bg-yellow-50/50');
      
      // Holiday-Icon sollte sichtbar sein
      const holidayIcon = screen.getByRole('button');
      expect(holidayIcon).toBeInTheDocument();
    });

    it('should allow input on holidays', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: 'holiday',
        input: '',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      const textarea = screen.getByTestId('time-input-textarea');
      
      // Eingabe sollte möglich sein
      fireEvent.change(textarea, { target: { value: '08:00-16:00' } });
      expect(mockContext.setInput).toHaveBeenCalledWith('08:00-16:00');
    });

    it('should show time entries on holidays', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: 'holiday',
        input: '08:00-16:00',
        timeEntries: [{
          start: '08:00',
          end: '16:00',
          duration: 480, // 8 Stunden in Minuten
          reason: '',
          originalLine: '08:00-16:00'
        }],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      // "Erfasste Zeiten" Sektion sollte sichtbar sein
      expect(screen.getByText('Erfasste Zeiten')).toBeInTheDocument();
      expect(screen.getByText('08:00 - 16:00')).toBeInTheDocument();
      expect(screen.getByText('8:00')).toBeInTheDocument(); // Dauer
    });

    it('should show errors on holidays', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: 'holiday',
        input: 'invalid-time',
        timeEntries: [],
        errors: [{
          line: 1,
          message: 'Ungültiges Zeitformat'
        }]
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      // Fehler sollten angezeigt werden
      expect(screen.getByText('Zeile 1: Ungültiges Zeitformat')).toBeInTheDocument();
    });
  });

  describe('Full-day special days functionality', () => {
    const fullDaySpecialTypes = [
      'vacation',
      'sick', 
      'care_leave',
      'wedding',
      'bereavement',
      'special_leave',
      'works_council',
      'training',
      'vocational_school'
    ];

    fullDaySpecialTypes.forEach(specialType => {
      it(`should block input for ${specialType}`, () => {
        const mockContext = createMockTimeCalculatorContext({
          specialDayType: specialType as any,
          input: '',
          timeEntries: [],
          errors: []
        });
        
        mockUseTimeCalculatorContext.mockReturnValue(mockContext);

        render(<TimeInputSection />);

        // Textarea sollte NICHT sichtbar sein
        expect(screen.queryByTestId('time-input-textarea')).not.toBeInTheDocument();
        
        // SpecialDayDisplay sollte sichtbar sein
        expect(screen.getByText('Keine Zeitbuchung erforderlich.')).toBeInTheDocument();
      });

      it(`should not show time entries for ${specialType}`, () => {
        const mockContext = createMockTimeCalculatorContext({
          specialDayType: specialType as any,
          input: '',
          timeEntries: [{
            start: '08:00',
            end: '16:00',
            duration: 480,
            reason: '',
            originalLine: '08:00-16:00'
          }],
          errors: []
        });
        
        mockUseTimeCalculatorContext.mockReturnValue(mockContext);

        render(<TimeInputSection />);

        // "Erfasste Zeiten" sollte NICHT sichtbar sein
        expect(screen.queryByText('Erfasste Zeiten')).not.toBeInTheDocument();
      });

      it(`should not show errors for ${specialType}`, () => {
        const mockContext = createMockTimeCalculatorContext({
          specialDayType: specialType as any,
          input: '',
          timeEntries: [],
          errors: [{
            line: 1,
            message: 'Ungültiges Zeitformat'
          }]
        });
        
        mockUseTimeCalculatorContext.mockReturnValue(mockContext);

        render(<TimeInputSection />);

        // Fehler sollten NICHT angezeigt werden
        expect(screen.queryByText('Zeile 1: Ungültiges Zeitformat')).not.toBeInTheDocument();
      });
    });
  });

  describe('Normal day functionality', () => {
    it('should show textarea with normal styling on normal days', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: null,
        input: '',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      const textarea = screen.getByTestId('time-input-textarea');
      expect(textarea).toBeInTheDocument();
      
      // Normal placeholder
      expect(textarea).toHaveAttribute('placeholder', 
        "Noch keine Einträge für diesen Tag. Buchungen im Format HH:mm-HH:mm, 'Urlaub' oder 'Krankenstand' eingeben."
      );
      
      // Kein Holiday-Styling
      expect(textarea).not.toHaveClass('border-yellow-200', 'bg-yellow-50/50');
    });

    it('should allow input on normal days', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: null,
        input: '',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      const textarea = screen.getByTestId('time-input-textarea');
      
      fireEvent.change(textarea, { target: { value: '09:00-17:00' } });
      expect(mockContext.setInput).toHaveBeenCalledWith('09:00-17:00');
    });
  });

  describe('Clear input functionality', () => {
    it('should show clear button when input exists', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: null,
        input: '08:00-16:00',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      const clearButton = screen.getByLabelText('Zeitbuchungen für diesen Tag löschen');
      expect(clearButton).toBeInTheDocument();
    });

    it('should call clearInput when clear button is clicked', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: null,
        input: '08:00-16:00',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      const clearButton = screen.getByLabelText('Zeitbuchungen für diesen Tag löschen');
      fireEvent.click(clearButton);
      
      expect(mockContext.clearInput).toHaveBeenCalled();
    });

    it('should not show clear button when no input exists', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: null,
        input: '',
        timeEntries: [],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      expect(screen.queryByLabelText('Zeitbuchungen für diesen Tag löschen')).not.toBeInTheDocument();
    });
  });

  describe('Delete entry functionality', () => {
    it('should delete specific entry when delete button is clicked', () => {
      const mockContext = createMockTimeCalculatorContext({
        specialDayType: null,
        input: '08:00-12:00\n13:00-17:00',
        timeEntries: [
          {
            start: '08:00',
            end: '12:00',
            duration: 240,
            reason: '',
            originalLine: '08:00-12:00'
          },
          {
            start: '13:00',
            end: '17:00',
            duration: 240,
            reason: '',
            originalLine: '13:00-17:00'
          }
        ],
        errors: []
      });
      
      mockUseTimeCalculatorContext.mockReturnValue(mockContext);

      render(<TimeInputSection />);

      const deleteButtons = screen.getAllByLabelText('Diesen Eintrag löschen');
      expect(deleteButtons).toHaveLength(2);
      
      // Ersten Eintrag löschen
      fireEvent.click(deleteButtons[0]);
      
      expect(mockContext.setInput).toHaveBeenCalledWith('13:00-17:00');
    });
  });
});
