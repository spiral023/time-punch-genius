import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { DashboardLayout, defaultLayout, cardRegistry } from '@/features/dashboard/config/layout';

const STORAGE_KEY = 'dashboardLayout';

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
    // Add missing cards to the end of the last column
    if (newColumns.length > 0) {
      newColumns[newColumns.length - 1].push(...missingCards);
    } else {
      // If there are no columns, create one with the missing cards
      newColumns.push(missingCards);
    }
    newLayout.columns = newColumns;
  }

  // Always update to the latest version after migration
  newLayout.version = defaultLayout.version;
  return newLayout;
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
        // Always run migration logic to catch newly added cards
        return validateLayout(migrateLayout(parsed));
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
