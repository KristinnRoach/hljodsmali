'use client';
import React, { useState } from 'react';

interface DropZoneProps {
  children: React.ReactNode;
}

export default function DropZone({ children }: DropZoneProps) {
  const [audioUrl, setAudioUrl] = useState<string>('');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  // };

  // const handleDragLeave = () => {};

  // const handleDragEnd = () => {
  // };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioUrl('');

    const files = e.dataTransfer.files;
    handleDroppedFiles(files);
  };

  const handleDroppedFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const audioUrl = URL.createObjectURL(file);
        setAudioUrl(audioUrl);
        console.log('Audio file dropped:', file.name);
      } else {
        console.log('Unsupported file dropped:', file.name);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      // onDragEnter={handleDragEnter} // nota í visual
      // onDragLeave={handleDragLeave}
      // onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const ChildComponent = child.type as React.ComponentType<any>;
          return <ChildComponent {...child.props} droppedAudioUrl={audioUrl} />;
        }
        return child;
      })}
      {/* {children} */}
    </div>
  );
}
