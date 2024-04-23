'use client';
import React, { useState } from 'react';

import Sampler from '../Sampler/Sampler';
import Samples from '../Samples/Samples';

// interface DropZoneProps {
//   children: React.ReactNode;
// }

export default function DropZone() {
  // { children }: DropZoneProps)
  const [audioUrl, setAudioUrl] = useState<string>('');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

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
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      <Sampler droppedAudioUrl={audioUrl} />
    </div>
  );
}

// onDragEnter={handleDragEnter} // nota í visual
// onDragLeave={handleDragLeave}
// onDragEnd={handleDragEnd}

// const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
//   e.preventDefault();
// };

// const handleDragLeave = () => {};

// const handleDragEnd = () => {
// };

// {React.Children.map(children, (child) => {
//   if (React.isValidElement(child)) {
//     const ChildComponent = child.type as React.ComponentType<any>;
//     return <ChildComponent {...child.props} droppedAudioUrl={audioUrl} />;
//   }
//   return child;
// })}
// {/* {children} */}
