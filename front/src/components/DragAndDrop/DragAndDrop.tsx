import { ReactNode, CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";

interface DragAndDropProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

const DragAndDrop = ({ id, children, disabled = false }: DragAndDropProps) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({ 
    id,
    disabled 
  });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...(!disabled && listeners)}
      className="touch-none"
    >
      {children}
    </div>
  );
};

export default DragAndDrop;