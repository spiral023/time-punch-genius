import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface SortableCardProps {
  id: string;
  children: React.ReactNode;
  isEditing: boolean;
}

export const SortableCard: React.FC<SortableCardProps> = ({ id, children, isEditing }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className={`relative ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className={`relative transition-all duration-200 ${isDragging ? 'scale-105 shadow-lg' : ''} ${isEditing ? 'hover:shadow-md border-2 border-dashed border-transparent hover:border-primary/30' : ''}`}>
        {isEditing && (
          <div
            {...listeners}
            className="absolute top-2 right-2 z-10 p-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg cursor-grab hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
            aria-label="Karte verschieben"
            title="Karte verschieben"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className={isEditing ? 'pointer-events-none' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
};
