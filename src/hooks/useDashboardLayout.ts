import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { DashboardLayout, defaultLayout } from '@/features/dashboard/config/layout';

const STORAGE_KEY = 'dashboardLayout';

const migrateLayout = (oldLayout: DashboardLayout): DashboardLayout => {
  if (oldLayout.version === 1) {
    // Migrate from version 1 to version 2: Replace 'results' with 'workingTime' and 'targetTimes'
    const newColumns = oldLayout.columns.map(column => 
      column.map(cardId => {
        if (cardId === 'results') {
          // Replace 'results' with 'workingTime' - 'targetTimes' will be added separately
          return 'workingTime';
        }
        return cardId;
      })
    );

    // Find the column that had 'results' and add 'targetTimes' after 'workingTime'
    for (let i = 0; i < newColumns.length; i++) {
      const workingTimeIndex = newColumns[i].indexOf('workingTime');
      if (workingTimeIndex !== -1) {
        newColumns[i].splice(workingTimeIndex + 1, 0, 'targetTimes');
        break;
      }
    }

    return {
      version: 2,
      columns: newColumns,
    };
  }
  
  return oldLayout;
};

export const useDashboardLayout = (): [DashboardLayout, Dispatch<SetStateAction<DashboardLayout>>] => {
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

  const [layout, setLayout] = useState<DashboardLayout>(() => {
    try {
      const storedLayout = localStorage.getItem(STORAGE_KEY);
      if (storedLayout) {
        const parsed = JSON.parse(storedLayout) as DashboardLayout;
        // Version check for future migrations
        if (parsed.version === defaultLayout.version) {
          return validateLayout(parsed);
        } else if (parsed.version < defaultLayout.version) {
          // Migrate old layout
          const migrated = migrateLayout(parsed);
          return validateLayout(migrated);
        }
      }
    } catch (error) {
      console.error("Failed to load or parse dashboard layout from localStorage", error);
    }
    return validateLayout(defaultLayout);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (error) {
      console.error("Failed to save dashboard layout to localStorage", error);
    }
  }, [layout]);

  // Wrapper for setLayout that validates before setting
  const setValidatedLayout: Dispatch<SetStateAction<DashboardLayout>> = (value) => {
    setLayout(prevLayout => {
      const newLayout = typeof value === 'function' ? value(prevLayout) : value;
      return validateLayout(newLayout);
    });
  };

  return [layout, setValidatedLayout];
};
