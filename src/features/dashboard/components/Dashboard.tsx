import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { WelcomePopup } from './WelcomePopup';
import { DateNavigator } from '@/features/time-calculator/components/DateNavigator';
import { NotificationManager } from './NotificationManager';
import { DashboardSettings } from './DashboardSettings';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { cardRegistry, defaultLayout } from '../config/layout';

// Hilfsfunktion für Slider-Wert zu Kartenbreite Mapping
const getCardMinWidth = (sliderValue: number): number => {
  // 0-100 → 300px bis 500px (300px + sliderValue * 2)
  return 300 + (sliderValue * 2);
};
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DroppableColumn } from './dnd/DroppableColumn';
import { SortableCard } from './dnd/SortableCard';
import { ImportExportMenu } from './ImportExportMenu';
import { DataManagement } from '@/features/time-calculator/components/DataManagement';

const Dashboard = () => {
  const { cardVisibility, columnWidthSlider, cardLayoutMode } = useAppSettings();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [layout, setLayout] = useDashboardLayout(isEditing);

  const handleResetLayout = () => {
    setLayout(defaultLayout);
  };

  // Berechne die Kartenbreite basierend auf dem Slider-Wert (nur wenn fixe Breite aktiviert ist)
  const cardMinWidth = cardLayoutMode === 'fixed' ? getCardMinWidth(columnWidthSlider) : undefined;

  const {
    setSelectedDate,
    averageDayData,
    triggerImport,
    triggerWebdeskImport,
    dataManagementRef,
  } = useTimeCalculatorContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string): string | undefined => {
    // Check if id is a column id
    if (layout.columns.some((_, index) => String(index) === id)) {
      return id;
    }
    
    // Find which column contains this card
    for (let i = 0; i < layout.columns.length; i++) {
      if (layout.columns[i].includes(id)) {
        return String(i);
      }
    }
    
    return undefined;
  };

  // Validate layout to prevent duplicates and ensure data integrity
  const validateLayout = (newLayout: typeof layout): typeof layout => {
    const allCards = new Set<string>();
    const validatedColumns = newLayout.columns.map(column => {
      const uniqueColumn = column.filter(cardId => {
        if (allCards.has(cardId)) {
          console.warn(`Duplicate card detected: ${cardId}, removing duplicate`);
          return false;
        }
        allCards.add(cardId);
        return true;
      });
      return uniqueColumn;
    });
    
    return { ...newLayout, columns: validatedColumns };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    console.log('Drag started:', activeId);
    setActiveId(activeId);
    setIsDragging(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId; // overId might be a column

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLayout((prev) => {
      const activeColumnIndex = Number(activeContainer);
      const overColumnIndex = Number(overContainer);
      
      // Validate column indices
      if (activeColumnIndex < 0 || activeColumnIndex >= prev.columns.length ||
          overColumnIndex < 0 || overColumnIndex >= prev.columns.length) {
        return prev;
      }
      
      const activeItems = [...prev.columns[activeColumnIndex]];
      const overItems = [...prev.columns[overColumnIndex]];
      
      const activeIndex = activeItems.indexOf(activeId);
      
      // Validate that the item exists in the active column
      if (activeIndex === -1) {
        return prev;
      }
      
      // Check if item already exists in target column (prevent duplicates)
      if (overItems.includes(activeId)) {
        return prev;
      }
      
      const overIndex = overItems.includes(overId) ? overItems.indexOf(overId) : overItems.length;

      // Remove from active column
      activeItems.splice(activeIndex, 1);
      
      // Add to over column
      overItems.splice(overIndex, 0, activeId);

      const newColumns = [...prev.columns];
      newColumns[activeColumnIndex] = activeItems;
      newColumns[overColumnIndex] = overItems;
      
      const newLayout = { ...prev, columns: newColumns };
      const validatedLayout = validateLayout(newLayout);
      return validatedLayout;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active.id, over: over?.id });
    
    setActiveId(null);
    setIsDragging(false);
    
    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId; // overId might be a column

    if (!activeContainer || !overContainer) {
      return;
    }

    if (activeContainer === overContainer) {
      // Sorting within the same column
      setLayout((prev) => {
        const columnIndex = Number(activeContainer);
        
        // Validate column index
        if (columnIndex < 0 || columnIndex >= prev.columns.length) {
          return prev;
        }
        
        const items = [...prev.columns[columnIndex]];
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        
        // Validate indices and ensure they're different
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          const newColumns = [...prev.columns];
          newColumns[columnIndex] = newItems;
          
          // Validate that no duplicates were created
          const uniqueItems = [...new Set(newItems)];
          if (uniqueItems.length !== newItems.length) {
            console.warn('Duplicate items detected, reverting layout change');
            return prev;
          }
          
          const newLayout = { ...prev, columns: newColumns };
          const validatedLayout = validateLayout(newLayout);
          return validatedLayout;
        }
        
        return prev;
      });
    }
    // Cross-column moves are already handled in handleDragOver
  };

  const isCardVisible = (cardId: string) => {
    if (cardVisibility[cardId] === false) return false;
    if (cardId === 'averageDay' && !averageDayData) return false;
    return true;
  };
  
  const getCardComponent = (cardId: string) => {
    const card = cardRegistry[cardId];
    if (!card) return null;
    const CardComponent = card.component;
    return <CardComponent />;
  };

  // Ermittelt die Anzahl der genutzten Spalten (Spalten mit sichtbaren Karten)
  const getUsedColumnsCount = () => {
    if (isEditing) {
      // Im Bearbeitungsmodus alle Spalten anzeigen
      return layout.columns.length;
    }
    
    let usedColumns = 0;
    for (const column of layout.columns) {
      const hasVisibleCards = column.some(cardId => isCardVisible(cardId));
      if (hasVisibleCards) {
        usedColumns++;
      }
    }
    return Math.max(1, usedColumns); // Mindestens 1 Spalte
  };

  // Filtert nur die Spalten mit Inhalt (außer im Bearbeitungsmodus)
  const getVisibleColumns = () => {
    if (isEditing) {
      // Im Bearbeitungsmodus alle Spalten zurückgeben
      return layout.columns.map((column, index) => ({ column, index }));
    }
    
    return layout.columns
      .map((column, index) => ({ column, index }))
      .filter(({ column }) => column.some(cardId => isCardVisible(cardId)));
  };

  const usedColumnsCount = getUsedColumnsCount();
  const visibleColumns = getVisibleColumns();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <WelcomePopup onTriggerImport={triggerImport} onTriggerWebdeskImport={triggerWebdeskImport} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto space-y-6"
      >
        <div className="flex justify-center items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Clock className="h-8 w-8 text-primary" />
            <Tooltip>
              <TooltipTrigger asChild>
                <h1
                  className="text-3xl font-bold text-foreground cursor-pointer"
                  onClick={() => setSelectedDate(new Date())}
                >
                  ZE-Helper
                </h1>
              </TooltipTrigger>
              <TooltipContent>
                <p>Klick mich um zum aktuellen Tag zu wechseln</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </div>

        <DateNavigator 
          leftSlot={<ImportExportMenu />}
          rightSlot={
            <div className="flex items-center gap-2">
              <DashboardSettings 
                isEditing={isEditing} 
                setIsEditing={setIsEditing} 
                onResetLayout={handleResetLayout}
                onSetLayout={setLayout}
              />
              {isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsEditing(false)}
                      className="shrink-0"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Layout speichern und Bearbeitungsmodus beenden</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          } 
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div 
            className={`dashboard-grid ${cardLayoutMode === 'fixed' ? 'fixed-width' : ''} ${cardLayoutMode === 'uniform' ? 'uniform-width' : ''}`}
            style={{
              ...(cardLayoutMode === 'fixed' ? { '--card-min-width': `${cardMinWidth}px` } : {}),
              '--used-columns': usedColumnsCount,
            } as React.CSSProperties}
            data-columns={usedColumnsCount}
          >
            {visibleColumns.map(({ column, index }) => (
              <DroppableColumn key={`col-${index}`} id={String(index)} items={column} isEditing={isEditing}>
                {column.map((cardId) => {
                  if (!isCardVisible(cardId)) {
                    return null;
                  }
                  return (
                    <SortableCard key={cardId} id={cardId} isEditing={isEditing}>
                      {getCardComponent(cardId)}
                    </SortableCard>
                  );
                })}
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="opacity-75">{getCardComponent(activeId)}</div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <NotificationManager />
        {/* Unsichtbare DataManagement-Komponente für Ref-Funktionalität */}
        <div className="hidden">
          <DataManagement ref={dataManagementRef} />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
