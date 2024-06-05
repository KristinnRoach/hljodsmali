'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

import { AudioSrcCtx } from './ctx';
// import audioCtx from './webAudioCtx';
import { startRecordAudioBuffer, stopRecordAudioBuffer } from './record';

type AudioSrcCtxProviderProps = {
  children: ReactNode;
};

export function AudioSrcCtxProvider({ children }: AudioSrcCtxProviderProps) {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  async function startRecording(duration?: number): Promise<void> {
    const buffer = await startRecordAudioBuffer(duration);
    setAudioBuffer(buffer);
  }

  function stopRecording(): void {
    stopRecordAudioBuffer();
  }

  const contextValue = {
    startRecording,
    stopRecording,
    audioBuffer,
  };
  return (
    <AudioSrcCtx.Provider value={contextValue}>{children}</AudioSrcCtx.Provider>
  );
}

export default AudioSrcCtxProvider;

// const ogAudioElement = useRef<HTMLAudioElement>(new Audio());
// const [audioSrcUrl, setAudioSrcUrl] = useState<string>('');
// const [globalLoopState, setGlobalLoopState] = useState<boolean>(false);
// const [nrChannels, setNrChannels] = useState<number>(1);

// useEffect(() => {
//   // Set the src whenever audioSrcUrl changes
//   ogAudioElement.current.src = audioSrcUrl;
//   console.log('ogAudioElement.src:', ogAudioElement.current.src);
// }, [audioSrcUrl]);

// const playAudio = (rate: number = 1.0) => {
//   console.log('audio src: ', audioSrcUrl, 'playAudio rate:', rate);
//   if (ogAudioElement.current) {
//     ogAudioElement.current.playbackRate = rate;
//     ogAudioElement.current.play();
//   } else {
//     console.error('Audio is not loaded yet');
//   }
// };

// const contextValue = {
//   ogAudioElement,
//   audioSrcUrl,
//   setAudioSrcUrl,
//   globalLoopState,
//   setGlobalLoopState,
//   playAudio,
// };
