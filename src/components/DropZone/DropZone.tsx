'use client';
import React, { useState, useRef } from 'react';

import Recorder from '../Sampler/Recorder';
import Player from '../Sampler/Player';
import { Voice } from '../../types';

import styles from '../../styles/page.module.scss';

export default function DropZone() {

  const voicesRef = useRef<Voice[]>([]); // þarf??
  // const latestVoice = (): Voice => {
  //   return voicesRef.current[voicesRef.current.length - 1];
  // };

  const [latestVoice, setLatestVoice] = useState<Voice>();

  const [loopState, setLoopState] = useState<boolean>(false); // leysa per voice með type

  const audioElementRef = useRef<HTMLAudioElement>(null);

  const [sampleUrl, setSampleUrl] = useState<string>('');

  function setAudioElSrc(sampleUrl: string): void {
    if (audioElementRef.current) {
      if (audioElementRef.current.src) {
        URL.revokeObjectURL(audioElementRef.current.src);
      }
      audioElementRef.current.src = sampleUrl;
      setSampleUrl(sampleUrl);
    } else {
      console.error('audioElementRef.current is null');
    }
  }

  function onPause(thisVoice: Voice) {
    if (!thisVoice.isLooping && voicesRef) {
      // thisVoice.audioEl.removeEventListener('pause', onPause); // unneccessary?
      voicesRef.current = voicesRef.current.filter((c) => c !== thisVoice);
    } else {
      thisVoice.audioEl.currentTime = 0.1;
      thisVoice.audioEl.play();
    }
  }

  function createNextVoice() {
    if (audioElementRef.current) {
      const clone = audioElementRef.current.cloneNode(true) as HTMLAudioElement;

      if (clone) {
        const thisVoice = {
          audioEl: clone,
          pauseTime: 2000, // fallback
          isLooping: false,
        };
        setLoopState(false);

        thisVoice.audioEl.currentTime = 0.1;
        thisVoice.audioEl.preservesPitch = false;
        thisVoice.audioEl.addEventListener('pause', () => {
          onPause(thisVoice);
        });
        // thisVoice.audioEl.addEventListener('play', () => {
        //   onPlay(thisVoice);
        // });
        voicesRef.current.push(thisVoice);

        setLatestVoice(thisVoice);
      } else {
        console.error('Failed to clone audio element');
      }
    } else {
      console.error('audioElementRef.current is null');
    }
  }


  const chooseSample = (audioUrl: string) => {
    if (audioUrl) {
      setSampleUrl(audioUrl);
      //prepPlayback(audioUrl);
    }
  };

  const toggleLoop = (): void => {
    if (latestVoice && latestVoice.isLooping) {
      latestVoice.isLooping = false;
      setLoopState(false);
    } else if (latestVoice && !latestVoice.isLooping) {
      latestVoice.isLooping = true;
      setLoopState(true);
    }
  };

  /* Drop Handlers */

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSampleUrl('');

    const files = e.dataTransfer.files;
    handleDroppedFiles(files);
  };

  const handleDroppedFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const audioUrl = URL.createObjectURL(file);
        setSampleUrl(audioUrl);
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
      <audio
        ref={audioElementRef}
        preload="auto" // henda?
      />
      <Recorder setSampleUrl={setAudioElSrc} createNextVoice={createNextVoice} />
      <Player voice={latestVoice} createNextVoice={createNextVoice} />
      {/* <Sampler setSampleUrl={setSampleUrl} /> */}
    </div>
  );
}


// useEffect(() => {
    //   if (droppedAudioUrl && audioElementRef.current) {
    //     blobsRef.current = [];
    //     if (audioElementRef.current.src) {
    //       URL.revokeObjectURL(audioElementRef.current.src);
    //     }
    //     audioElementRef.current.src = droppedAudioUrl;
    //     setSampleUrl(droppedAudioUrl);
    //   }
    // }, [droppedAudioUrl]);

        // function onPlay(thisVoice: Voice) {
    //   setTimeout(() => {
    //     thisVoice.audioEl.pause();
    //     console.log('timeout paused: ', thisVoice.pauseTime);
    //   }, thisVoice.pauseTime);
    // }


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
