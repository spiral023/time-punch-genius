import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { TimeCalculatorProvider } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { vi } from 'vitest';

// Mock für useAppSettings Hook
vi.mock('@/hooks/useAppSettings', () => ({
  useAppSettings: () => ({
    settings: {
      personalVacationDays: 25,
      cardVisibility: {},
      gradientId: 1,
      showWelcomeScreen: false,
      columnWidthSlider: 50,
      zoomLevel: 1,
    },
    setPersonalVacationDays: vi.fn(),
    setCardVisibility: vi.fn(),
    setGradientId: vi.fn(),
    setShowWelcomeScreen: vi.fn(),
    setColumnWidthSlider: vi.fn(),
    setZoomLevel: vi.fn(),
    cardVisibility: {},
    zoomLevel: 1,
  }),
}));

// Mock für useNotifications Hook
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    permission: 'granted' as const,
    scheduledNotifications: [],
    scheduleNotification: vi.fn(),
    removeNotification: vi.fn(),
  }),
  NotificationsContext: React.createContext(null),
}));

// Mock für holidays
vi.mock('@/lib/holidays', () => ({
  getHolidays: vi.fn().mockResolvedValue([]),
  isHoliday: vi.fn().mockReturnValue(false),
}));

// Test Query Client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AppSettingsProvider>
          <TooltipProvider>
            <TimeCalculatorProvider>
              {children}
            </TimeCalculatorProvider>
          </TooltipProvider>
        </AppSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper für localStorage Mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store,
  };
};

// Helper für File Mock
export const createMockFile = (name: string, content: string, type = 'application/json') => {
  const file = new File([content], name, { type });
  return file;
};

// Helper für Event Mock
export const createMockChangeEvent = (file: File) => ({
  target: {
    files: [file],
  },
} as unknown as React.ChangeEvent<HTMLInputElement>);
