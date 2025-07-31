import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
  id: string;
  items: string[];
  children: React.ReactNode;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, items, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div 
        ref={setNodeRef} 
        className={`space-y-6 min-h-[200px] p-2 rounded-lg transition-all duration-200 ${
          isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'border-2 border-transparent'
        }`}
      >
        {children}
        {items.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg">
            Karten hier ablegen
          </div>
        )}
      </div>
    </SortableContext>
  );
};
