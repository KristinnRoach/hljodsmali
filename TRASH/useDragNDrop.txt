// src/hooks/useDragAndDrop.ts

import { useState, useCallback } from 'react';

export function useDragAndDrop(onFileDrop: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        onFileDrop(file);
      }
    },
    [onFileDrop]
  );

  return { isDragging, handleDragOver, handleDragLeave, handleDrop };
}
