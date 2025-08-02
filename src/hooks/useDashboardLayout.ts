import { Dispatch, SetStateAction, useMemo } from 'react';
import { DashboardLayout } from '@/types';
import { cardRegistry, defaultLayout } from '@/features/dashboard/config/layout';
import { useAppSettings } from './useAppSettings';

const migrateLayout = (layout: DashboardLayout): DashboardLayout => {
  let newLayout = { ...layout };

  // Migration from v1 to v2
  if (newLayout.version === 1) {
    const newColumns = newLayout.columns.map(column =>
      column.map(cardId => cardId === 'results' ? 'workingTime' : cardId)
    );
    for (let i = 0; i < newColumns.length; i++) {
      const workingTimeIndex = newColumns[i].indexOf('workingTime');
      if (workingTimeIndex !== -1) {
        newColumns[i].splice(workingTimeIndex + 1, 0, 'targetTimes');
        break;
      }
    }
    newLayout = { version: 2, columns: newColumns };
  }

  // General migration to add missing cards from the registry
  const allRegisteredCards = Object.keys(cardRegistry);
  const allLayoutCards = new Set(newLayout.columns.flat());
  const missingCards = allRegisteredCards.filter(cardId => !allLayoutCards.has(cardId));

  if (missingCards.length > 0) {
    const newColumns = [...newLayout.columns];
    // Add missing cards using balanced distribution
    missingCards.forEach((cardId, index) => {
      const targetColumnIndex = index % newColumns.length;
      if (newColumns[targetColumnIndex]) {
        newColumns[targetColumnIndex].push(cardId);
      } else {
        newColumns.push([cardId]);
      }
    });
    newLayout.columns = newColumns;
  }

  // Always update to the latest version after migration
  newLayout.version = defaultLayout.version;
  return newLayout;
};

// Optimized layout distribution algorithm
const optimizeLayout = (layout: DashboardLayout, visibleCards: Set<string>): DashboardLayout => {
  // Get all visible cards from the current layout
  const allVisibleCards = layout.columns
    .flat()
    .filter(cardId => visibleCards.has(cardId));

  // If no visible cards, return empty layout
  if (allVisibleCards.length === 0) {
    return { ...layout, columns: [[], [], [], []] };
  }

  // Determine optimal number of columns based on screen size and card count
  const getOptimalColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1024) return 2;
    if (width < 1400) return 3;
    return 4;
  };

  const columnCount = Math.min(getOptimalColumnCount(), allVisibleCards.length);
  const newColumns: string[][] = Array.from({ length: columnCount }, () => []);

  // Distribute cards evenly across columns using round-robin
  allVisibleCards.forEach((cardId, index) => {
    const columnIndex = index % columnCount;
    newColumns[columnIndex].push(cardId);
  });

  // Ensure we always have 4 columns for consistency (empty ones will be hidden)
  while (newColumns.length < 4) {
    newColumns.push([]);
  }

  return { ...layout, columns: newColumns };
};

export const useDashboardLayout = (isEditing?: boolean): [DashboardLayout, Dispatch<SetStateAction<DashboardLayout>>] => {
  const { dashboardLayout, setDashboardLayout, cardVisibility } = useAppSettings();

  // Create set of visible cards for performance
  const visibleCards = useMemo(() => {
    const visible = new Set<string>();
    Object.keys(cardRegistry).forEach(cardId => {
      if (cardVisibility[cardId] !== false) {
        visible.add(cardId);
      }
    });
    return visible;
  }, [cardVisibility]);

  // Validate layout to prevent duplicates and ensure data integrity
  const validateLayout = (layout: DashboardLayout): DashboardLayout => {
    const allCards = new Set<string>();
    const validatedColumns = layout.columns.map(column => {
      const uniqueColumn = column.filter(cardId => {
        if (allCards.has(cardId)) {
          console.warn(`Duplicate card detected during layout validation: ${cardId}, removing duplicate`);
          return false;
        }
        allCards.add(cardId);
        return true;
      });
      return uniqueColumn;
    });
    
    return { ...layout, columns: validatedColumns };
  };

  // Migrate layout to add missing cards from the registry
  const migrateLayoutForNewCards = (layout: DashboardLayout): DashboardLayout => {
    const allRegisteredCards = Object.keys(cardRegistry);
    const allLayoutCards = new Set(layout.columns.flat());
    const missingCards = allRegisteredCards.filter(cardId => !allLayoutCards.has(cardId));

    if (missingCards.length > 0) {
      const newColumns = [...layout.columns];
      // Add missing cards using balanced distribution
      missingCards.forEach((cardId, index) => {
        const targetColumnIndex = index % Math.max(newColumns.length, 1);
        if (newColumns[targetColumnIndex]) {
          newColumns[targetColumnIndex].push(cardId);
        } else {
          newColumns.push([cardId]);
        }
      });
      return { ...layout, columns: newColumns };
    }

    return layout;
  };

  // Apply migrations and validation to the current layout
  const migratedLayout = migrateLayoutForNewCards(dashboardLayout);
  const validatedLayout = validateLayout(migratedLayout);
  
  // Only apply optimization on initial load or when cards are added/removed, not during edit mode changes
  const currentLayout = useMemo(() => {
    // Check if this is the default layout (user hasn't customized yet)
    const isDefaultLayout = JSON.stringify(validatedLayout.columns) === JSON.stringify(defaultLayout.columns);
    
    // Never optimize if the layout exactly matches the default layout
    // This ensures that when users reset to default, they get the exact layout we defined
    if (isDefaultLayout) {
      return validatedLayout;
    }
    
    // Only optimize if not in edit mode and it's not the default layout
    // This handles cases where cards were added/removed but layout was customized
    if (!isEditing && !isDefaultLayout) {
      // Check if there are missing cards that need to be distributed
      const allRegisteredCards = Object.keys(cardRegistry);
      const allLayoutCards = new Set(validatedLayout.columns.flat());
      const missingCards = allRegisteredCards.filter(cardId => !allLayoutCards.has(cardId));
      
      // Only optimize if there are missing cards
      if (missingCards.length > 0) {
        return optimizeLayout(validatedLayout, visibleCards);
      }
    }
    
    // Otherwise, return the layout as-is to preserve user customizations
    return validatedLayout;
  }, [validatedLayout, visibleCards, isEditing]);

  // Wrapper for setLayout that validates before setting
  const setValidatedLayout: Dispatch<SetStateAction<DashboardLayout>> = (value) => {
    const newLayout = typeof value === 'function' ? value(currentLayout) : value;
    const validatedLayout = validateLayout(newLayout);
    setDashboardLayout(validatedLayout);
  };

  return [currentLayout, setValidatedLayout];
};
