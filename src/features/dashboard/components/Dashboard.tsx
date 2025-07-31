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
  const { cardVisibility, columnWidthSlider } = useAppSettings();
  const [layout, setLayout] = useDashboardLayout();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleResetLayout = () => {
    setLayout(defaultLayout);
  };

  // Berechne die Kartenbreite basierend auf dem Slider-Wert
  const cardMinWidth = getCardMinWidth(columnWidthSlider);

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

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    console.log('Drag started:', activeId);
    setActiveId(activeId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    console.log('Drag over:', { activeId, overId });

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId; // overId might be a column

    console.log('Containers:', { activeContainer, overContainer });

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLayout((prev) => {
      const activeColumnIndex = Number(activeContainer);
      const overColumnIndex = Number(overContainer);
      
      const activeItems = [...prev.columns[activeColumnIndex]];
      const overItems = [...prev.columns[overColumnIndex]];
      
      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.includes(overId) ? overItems.indexOf(overId) : overItems.length;

      // Remove from active column
      activeItems.splice(activeIndex, 1);
      
      // Add to over column
      overItems.splice(overIndex, 0, activeId);

      const newColumns = [...prev.columns];
      newColumns[activeColumnIndex] = activeItems;
      newColumns[overColumnIndex] = overItems;
      
      console.log('Layout updated:', newColumns);
      return { ...prev, columns: newColumns };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active.id, over: over?.id });
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId; // overId might be a column

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      // Sorting within the same column
      setLayout((prev) => {
        const columnIndex = Number(activeContainer);
        const items = [...prev.columns[columnIndex]];
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          const newColumns = [...prev.columns];
          newColumns[columnIndex] = newItems;
          return { ...prev, columns: newColumns };
        }
        
        return prev;
      });
    }

    setActiveId(null);
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
            className="dashboard-grid gap-6"
            style={{
              '--card-min-width': `${cardMinWidth}px`
            } as React.CSSProperties}
          >
            {layout.columns.map((column, colIndex) => (
              <DroppableColumn key={`col-${colIndex}`} id={String(colIndex)} items={column}>
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
