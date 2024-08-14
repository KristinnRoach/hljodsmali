import { useState, useCallback, useRef } from 'react';

interface UseDraggableOptions {
  onDrag: (newPosition: number) => void;
  min?: number;
  max?: number;
}

export function useDraggable({
  onDrag,
  min = 0,
  max = 1,
}: UseDraggableOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, currentValue: number) => {
      setIsDragging(true);
      startPosRef.current = e.clientX;
      startValueRef.current = currentValue;
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startPosRef.current;
      const range = max - min;
      const newValue = startValueRef.current + dx / range;
      const constrainedValue = Math.max(min, Math.min(max, newValue));

      requestAnimationFrame(() => onDrag(constrainedValue));
    },
    [isDragging, min, max, onDrag]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
