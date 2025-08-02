import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
  id: string;
  items: string[];
  children: React.ReactNode;
  isEditing?: boolean;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, items, children, isEditing = false }) => {
  const { setNodeRef, isOver, active } = useDroppable({ id });

  const hasContent = items.length > 0;
  const showDropZone = isEditing && !hasContent;

  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div 
        ref={setNodeRef} 
        className={`dashboard-column transition-all duration-200 ${
          isOver ? 'droppable-column drag-over' : ''
        } ${active ? 'droppable-column' : ''}`}
        style={{
          minHeight: showDropZone ? '120px' : hasContent ? 'auto' : '0px',
          padding: isOver ? '0.5rem' : '0',
        }}
      >
        {children}
        {showDropZone && (
          <div className={`flex items-center justify-center h-24 text-muted-foreground text-sm border-2 border-dashed rounded-lg transition-all duration-200 ${
            isOver 
              ? 'border-primary/50 bg-primary/10 text-primary' 
              : 'border-muted/30 hover:border-muted/50'
          }`}>
            <div className="text-center">
              <div className="text-lg mb-1">📋</div>
              <div>Karten hier ablegen</div>
            </div>
          </div>
        )}
      </div>
    </SortableContext>
  );
};
