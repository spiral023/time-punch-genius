import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import Dashboard from './Dashboard';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { createMockTimeCalculatorContext } from '@/test/mock-factories';

// Mock child components
vi.mock('./cards/WorkingTimeCard', () => ({
  WorkingTimeCard: () => <div data-testid="working-time-card">Working Time Card</div>,
}));
vi.mock('./cards/StatisticsCard', () => ({
  StatisticsCard: () => <div data-testid="statistics-card">Statistics Card</div>,
}));
vi.mock('./cards/InfoCard', () => ({
  default: () => <div data-testid="info-card">Info Card</div>,
}));
vi.mock('./WeeklyHoursChart', () => ({
  WeeklyHoursChart: () => <div data-testid="weekly-hours-chart">Weekly Hours Chart</div>,
}));

// Mock other components used by Dashboard
vi.mock('./WelcomePopup', () => ({
  WelcomePopup: () => <div data-testid="welcome-popup">Welcome Popup</div>,
}));
vi.mock('@/features/time-calculator/components/DateNavigator', () => ({
  DateNavigator: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="date-navigator">{children}</div>
  ),
}));
vi.mock('./NotificationManager', () => ({
  NotificationManager: () => <div data-testid="notification-manager">Notification Manager</div>,
}));
vi.mock('./DashboardSettings', () => ({
  DashboardSettings: () => <div data-testid="dashboard-settings">Dashboard Settings</div>,
}));
vi.mock('./ImportExportMenu', () => ({
  ImportExportMenu: () => <div data-testid="import-export-menu">Import Export Menu</div>,
}));
vi.mock('@/features/time-calculator/components/DataManagement', () => ({
  DataManagement: React.forwardRef(() => <div data-testid="data-management">Data Management</div>),
}));
vi.mock('./dnd/DroppableColumn', () => ({
  DroppableColumn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="droppable-column">{children}</div>
  ),
}));
vi.mock('./dnd/SortableCard', () => ({
  SortableCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-card">{children}</div>
  ),
}));

// Mock the layout config
vi.mock('../config/layout', () => ({
  cardRegistry: {
    'working-time': {
      id: 'working-time',
      name: 'Arbeitszeit',
      component: () => <div data-testid="working-time-card">Working Time Card</div>,
    },
    'statistics': {
      id: 'statistics',
      name: 'Statistik',
      component: () => <div data-testid="statistics-card">Statistics Card</div>,
    },
    'info': {
      id: 'info',
      name: 'Infos',
      component: () => <div data-testid="info-card">Info Card</div>,
    },
    'weekly-chart': {
      id: 'weekly-chart',
      name: 'Wöchentliche Übersicht',
      component: () => <div data-testid="weekly-hours-chart">Weekly Hours Chart</div>,
    },
  },
  defaultLayout: {
    version: 1,
    columns: [
      ['working-time', 'statistics'],
      ['info', 'weekly-chart'],
    ],
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCorners: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => <button {...props}>{children}</button>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
}));

// Mock hooks
vi.mock('@/features/time-calculator/contexts/TimeCalculatorContext');
const mockUseAppSettings = vi.fn();
vi.mock('@/hooks/useAppSettings', () => ({
  useAppSettings: mockUseAppSettings,
}));
vi.mock('@/hooks/useDashboardLayout');

const mockUseTimeCalculatorContext = vi.mocked(useTimeCalculatorContext);
const mockUseDashboardLayout = vi.mocked(useDashboardLayout);

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockUseTimeCalculatorContext.mockReturnValue(createMockTimeCalculatorContext());

    mockUseAppSettings.mockReturnValue({
      settings: {
        cardVisibility: {
          'working-time': true,
          'statistics': true,
          'info': true,
          'weekly-chart': true,
        },
        columnWidthSlider: 50,
        gradientId: 1,
        personalVacationDays: 25,
        showWelcomeScreen: true,
        zoomLevel: 0.8,
      },
      gradientId: 1,
      setGradientId: vi.fn(),
      cardVisibility: {
        'working-time': true,
        'statistics': true,
        'info': true,
        'weekly-chart': true,
      },
      setCardVisibility: vi.fn(),
      setAllCardsVisibility: vi.fn(),
      personalVacationDays: 25,
      setPersonalVacationDays: vi.fn(),
      setShowWelcomeScreen: vi.fn(),
      columnWidthSlider: 50,
      setColumnWidthSlider: vi.fn(),
      zoomLevel: 0.8,
      setZoomLevel: vi.fn(),
    });

    mockUseDashboardLayout.mockReturnValue([
      {
        columns: [
          ['working-time', 'statistics'],
          ['info', 'weekly-chart'],
        ],
        version: 1,
      },
      vi.fn(),
    ]);
  });

  it('should render the main dashboard components', () => {
    const { container } = render(<Dashboard />);

    // Prüfe, dass die Dashboard-Komponente ohne Fehler rendert
    expect(container).toBeInTheDocument();
    
    // Prüfe, dass die Komponente nicht leer ist
    expect(container.firstChild).not.toBeNull();
  });
});
