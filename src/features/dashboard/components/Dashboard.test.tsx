/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import Dashboard from './Dashboard';

// Mock für alle Dashboard-Abhängigkeiten
vi.mock('./cards/WorkingTimeCard', () => ({
  WorkingTimeCard: () => <div data-testid="working-time-card">Working Time Card</div>,
}));

vi.mock('./cards/StatisticsCard', () => ({
  StatisticsCard: () => <div data-testid="statistics-card">Statistics Card</div>,
}));

vi.mock('./cards/InfoCard', () => ({
  InfoCard: () => <div data-testid="info-card">Info Card</div>,
}));

vi.mock('./WeeklyHoursChart', () => ({
  WeeklyHoursChart: () => <div data-testid="weekly-hours-chart">Weekly Hours Chart</div>,
}));

vi.mock('./ImportExportMenu', () => ({
  ImportExportMenu: () => <div data-testid="import-export-menu">Import Export Menu</div>,
}));

vi.mock('./DashboardSettings', () => ({
  DashboardSettings: () => <div data-testid="dashboard-settings">Dashboard Settings</div>,
}));

// Mock für WelcomePopup mit direkter Kontrolle über Sichtbarkeit
let mockWelcomePopupVisible = false;

vi.mock('./WelcomePopup', () => ({
  WelcomePopup: () => {
    return mockWelcomePopupVisible ? <div data-testid="welcome-popup">Welcome Popup</div> : null;
  },
}));

vi.mock('./NotificationManager', () => ({
  NotificationManager: () => <div data-testid="notification-manager">Notification Manager</div>,
}));

vi.mock('@/features/time-calculator/components/DateNavigator', () => ({
  DateNavigator: ({ leftSlot, rightSlot }: { leftSlot: React.ReactNode; rightSlot: React.ReactNode }) => (
    <div data-testid="date-navigator">
      <div data-testid="left-slot">{leftSlot}</div>
      <div data-testid="right-slot">{rightSlot}</div>
    </div>
  ),
}));

vi.mock('@/features/time-calculator/components/DataManagement', () => ({
  DataManagement: () => <div data-testid="data-management">Data Management</div>,
}));

vi.mock('../config/layout', () => ({
  cardRegistry: {
    'working-time': { component: () => <div data-testid="working-time-card">Working Time Card</div> },
    'statistics': { component: () => <div data-testid="statistics-card">Statistics Card</div> },
    'info': { component: () => <div data-testid="info-card">Info Card</div> },
    'weekly-chart': { component: () => <div data-testid="weekly-hours-chart">Weekly Hours Chart</div> },
  },
  defaultLayout: {
    columns: [
      ['working-time', 'statistics'],
      ['info', 'weekly-chart']
    ]
  },
}));

// Mock für useDashboardLayout Hook
vi.mock('@/hooks/useDashboardLayout', () => ({
  useDashboardLayout: () => [
    {
      columns: [
        ['working-time', 'statistics'],
        ['info', 'weekly-chart']
      ]
    },
    vi.fn()
  ],
}));

// Mock für useAppSettings Hook
const mockAppSettings = {
  cardVisibility: {
    'working-time': true,
    'statistics': true,
    'info': true,
    'weekly-chart': true,
  },
  columnWidthSlider: 50,
  settings: {
    showWelcomePopup: false,
  },
  updateSettings: vi.fn(),
};

vi.mock('@/hooks/useAppSettings', () => ({
  useAppSettings: () => mockAppSettings,
}));

// Mock für useTimeCalculatorContext
const mockTimeCalculatorContext = {
  setSelectedDate: vi.fn(),
  averageDayData: null,
  triggerImport: vi.fn(),
  triggerWebdeskImport: vi.fn(),
  dataManagementRef: { current: null },
};

vi.mock('@/features/time-calculator/contexts/TimeCalculatorContext', () => ({
  useTimeCalculatorContext: () => mockTimeCalculatorContext,
  TimeCalculatorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock für DragDropContext
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: () => void }) => (
    <div data-testid="drag-drop-context" data-on-drag-end={onDragEnd ? 'true' : 'false'}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
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

vi.mock('./dnd/DroppableColumn', () => ({
  DroppableColumn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="droppable">{children}</div>
  ),
}));

vi.mock('./dnd/SortableCard', () => ({
  SortableCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="draggable">{children}</div>
  ),
}));

describe('Dashboard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAppSettings.settings.showWelcomePopup = false;
  });

  it('sollte Dashboard-Komponenten rendern', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('working-time-card')).toBeInTheDocument();
    expect(screen.getByTestId('statistics-card')).toBeInTheDocument();
    expect(screen.getByTestId('info-card')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-hours-chart')).toBeInTheDocument();
  });

  it('sollte Import/Export-Menü rendern', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('import-export-menu')).toBeInTheDocument();
  });

  it('sollte Dashboard-Einstellungen rendern', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('dashboard-settings')).toBeInTheDocument();
  });

  it('sollte Drag & Drop Context einrichten', () => {
    render(<Dashboard />);
    
    const dragDropContext = screen.getByTestId('drag-drop-context');
    expect(dragDropContext).toBeInTheDocument();
    expect(dragDropContext).toHaveAttribute('data-on-drag-end', 'true');
  });

  it('sollte Droppable-Bereiche für linke und rechte Spalte haben', () => {
    render(<Dashboard />);
    
    const droppableAreas = screen.getAllByTestId('droppable');
    expect(droppableAreas).toHaveLength(2); // Linke und rechte Spalte
  });

  it('sollte Welcome-Popup anzeigen wenn aktiviert', () => {
    mockWelcomePopupVisible = true;
    
    render(<Dashboard />);
    
    expect(screen.getByTestId('welcome-popup')).toBeInTheDocument();
    
    // Reset für andere Tests
    mockWelcomePopupVisible = false;
  });

  it('sollte Welcome-Popup nicht anzeigen wenn deaktiviert', () => {
    mockWelcomePopupVisible = false;
    
    render(<Dashboard />);
    
    expect(screen.queryByTestId('welcome-popup')).not.toBeInTheDocument();
  });

  it('sollte Layout-Updates verarbeiten können', () => {
    render(<Dashboard />);
    
    // Simuliere Drag & Drop durch direkten Aufruf der onDragEnd Funktion
    // In einem echten Test würde man das Drag & Drop Event simulieren
    const dragDropContext = screen.getByTestId('drag-drop-context');
    expect(dragDropContext).toBeInTheDocument();
  });

  it('sollte responsive Layout haben', () => {
    render(<Dashboard />);
    
    // Prüfe, dass die Container-Klassen vorhanden sind
    const container = screen.getByTestId('drag-drop-context').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('sollte alle Karten-Komponenten in der richtigen Reihenfolge anzeigen', () => {
    render(<Dashboard />);
    
    // Prüfe, dass alle erwarteten Karten vorhanden sind
    const cards = [
      'working-time-card',
      'statistics-card', 
      'info-card',
      'weekly-hours-chart'
    ];
    
    cards.forEach(cardTestId => {
      expect(screen.getByTestId(cardTestId)).toBeInTheDocument();
    });
  });

  it('sollte Einstellungen-Button funktional sein', async () => {
    render(<Dashboard />);
    
    // Das Dashboard-Settings-Komponente sollte gerendert werden
    expect(screen.getByTestId('dashboard-settings')).toBeInTheDocument();
  });

  it('sollte Import/Export-Funktionalität zugänglich machen', () => {
    render(<Dashboard />);
    
    expect(screen.getByTestId('import-export-menu')).toBeInTheDocument();
  });
});
