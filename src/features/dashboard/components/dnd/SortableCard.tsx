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
    isSorting,
  } = useSortable({ 
    id,
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className={`sortable-card relative ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''} ${
        isDragging ? 'dragging opacity-90' : ''
      }`}
    >
      <div 
        className={`relative ${
          isDragging ? 'shadow-2xl' : ''
        } ${
          isEditing ? 'hover:shadow-md border-2 border-dashed border-transparent hover:border-primary/30' : ''
        }`}
      >
        {isEditing && (
          <motion.div
            {...listeners}
            className="absolute top-2 right-2 z-10 p-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg cursor-grab hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
            aria-label="Karte verschieben"
            title="Karte verschieben"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <GripVertical className="h-4 w-4" />
          </motion.div>
        )}
        <div className={`${isEditing ? 'pointer-events-none' : ''} ${isDragging ? 'opacity-90' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
