import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { TimeInputSection } from './TimeInputSection';
import { useTimeCalculatorContext } from '../contexts/TimeCalculatorContext';
import { createMockTimeCalculatorContext } from '@/test/mock-factories';

// Mock the context to provide a simple pass-through provider and a mockable hook
vi.mock('../contexts/TimeCalculatorContext', () => ({
  useTimeCalculatorContext: vi.fn(),
  TimeCalculatorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseTimeCalculatorContext = vi.mocked(useTimeCalculatorContext);

describe('TimeInputSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render textarea for a normal day', () => {
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
    expect(textarea).toHaveAttribute('placeholder',
      "Noch keine Einträge für diesen Tag. Buchungen im Format HH:mm-HH:mm, 'Urlaub' oder 'Krankenstand' eingeben."
    );
  });

  it('should render special day display for vacation', () => {
    const mockContext = createMockTimeCalculatorContext({
      specialDayType: 'vacation',
    });
    mockUseTimeCalculatorContext.mockReturnValue(mockContext);

    render(<TimeInputSection />);

    expect(screen.getByText('Urlaub')).toBeInTheDocument();
    expect(screen.queryByTestId('time-input-textarea')).not.toBeInTheDocument();
  });

  it('should show error messages', () => {
    const mockContext = createMockTimeCalculatorContext({
      errors: [{ line: 1, message: 'Test-Fehler' }]
    });
    mockUseTimeCalculatorContext.mockReturnValue(mockContext);

    render(<TimeInputSection />);

    expect(screen.getByText('Zeile 1: Test-Fehler')).toBeInTheDocument();
  });

  it('should show time entries', () => {
    const mockContext = createMockTimeCalculatorContext({
      timeEntries: [{
        start: '09:00',
        end: '17:00',
        duration: 480,
        originalLine: '09:00-17:00',
        reason: ''
      }]
    });
    mockUseTimeCalculatorContext.mockReturnValue(mockContext);

    render(<TimeInputSection />);

    expect(screen.getByText('Erfasste Zeiten')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument();
  });
});
