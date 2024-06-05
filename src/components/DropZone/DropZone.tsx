'use client';
import React, { useContext, useState } from 'react';

// import Sampler from '../Sampler/Sampler';
import Samples from '../Samples/Samples';

import styles from '../../styles/page.module.scss';
import { AudioSrcCtx } from '@components/contexts/ctx';
import Recorder from '../Sampler/Recorder';
import SamplePlayer from '../Sampler/SamplePlayer';

export default function DropZone() {
  // const { audioSrcUrl, setAudioSrcUrl, globalLoopState, setGlobalLoopState } =
  //   useContext(AudioSrcCtx);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    //setAudioSrcUrl('');

    const files = e.dataTransfer.files;
    handleDroppedFiles(files);
  };

  const handleDroppedFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const audioUrl = URL.createObjectURL(file);
        //setAudioSrcUrl(audioUrl);
        console.log('Audio file dropped:', file.name);
      } else {
        console.log('Unsupported file dropped:', file.name);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={styles.samplerBox}
    >
      <SamplePlayer />
      <Recorder />
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

// interface DropZoneProps {
//   children: React.ReactNode;
// }

// { children }: DropZoneProps)

// {React.Children.map(children, (child) => {
//   if (React.isValidElement(child)) {
//     const ChildComponent = child.type as React.ComponentType<any>;
//     return <ChildComponent {...child.props} droppedAudioUrl={audioUrl} />;
//   }
//   return child;
// })}
// {/* {children} */}
