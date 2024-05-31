'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

import { AudioSrcCtx } from './ctx';

type AudioSrcCtxProviderProps = {
  children: ReactNode;
};

// const ogAudioElement = new Audio();

export function AudioSrcCtxProvider({ children }: AudioSrcCtxProviderProps) {
  const ogAudioElement = useRef<HTMLAudioElement>(new Audio());
  const [audioSrcUrl, setAudioSrcUrl] = useState<string>('');

  useEffect(() => {
    // Set the src whenever audioSrcUrl changes
    ogAudioElement.current.src = audioSrcUrl;
    console.log('ogAudioElement.src:', ogAudioElement.current.src);
  }, [audioSrcUrl]);

  const [globalLoopState, setGlobalLoopState] = useState<boolean>(false);

  const contextValue = {
    ogAudioElement,
    audioSrcUrl,
    setAudioSrcUrl,
    globalLoopState,
    setGlobalLoopState,
  };

  return (
    <AudioSrcCtx.Provider value={contextValue}>{children}</AudioSrcCtx.Provider>
  );
}

export default AudioSrcCtxProvider;
