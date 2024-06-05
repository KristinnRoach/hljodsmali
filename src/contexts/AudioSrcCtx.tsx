'use client';

import { useState, ReactNode, useRef } from 'react';

import { AudioSrcCtx } from './ctx';
import audioCtx from './webAudioCtx';
import {
  blobToAudioBuffer,
  startRecordAudioBuffer,
  stopRecordAudioBuffer,
} from './record';

type AudioSrcCtxProviderProps = {
  children: ReactNode;
};

export function AudioSrcCtxProvider({ children }: AudioSrcCtxProviderProps) {
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  async function setNewAudioSrc(newAudio: AudioBuffer | Blob): Promise<void> {
    if (newAudio instanceof AudioBuffer) {
      audioBufferRef.current = newAudio;
    } else if (newAudio instanceof Blob) {
      const buffer = await blobToAudioBuffer(newAudio);
      audioBufferRef.current = buffer;
    }
  }

  async function startRecording(duration?: number): Promise<void> {
    const buffer = await startRecordAudioBuffer(duration);
    if (!buffer) {
      console.error('Could not start recording');
      return;
    }
    audioBufferRef.current = buffer;

    console.log('buffer: ', buffer);
  }

  function stopRecording(): void {
    stopRecordAudioBuffer();
  }

  const contextValue = {
    startRecording,
    stopRecording,
    audioBufferRef,
    setNewAudioSrc,
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
