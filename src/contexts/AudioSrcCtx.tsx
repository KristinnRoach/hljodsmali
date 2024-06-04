'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

import { AudioSrcCtx } from './ctx';

type AudioSrcCtxProviderProps = {
  children: ReactNode;
};

export function AudioSrcCtxProvider({ children }: AudioSrcCtxProviderProps) {
  const ogAudioElement = useRef<HTMLAudioElement>(new Audio());
  const [nrChannels, setNrChannels] = useState<number>(1);
  const [audioSrcUrl, setAudioSrcUrl] = useState<string>('');
  const [globalLoopState, setGlobalLoopState] = useState<boolean>(false);

  useEffect(() => {
    // Set the src whenever audioSrcUrl changes
    ogAudioElement.current.src = audioSrcUrl;
    console.log('ogAudioElement.src:', ogAudioElement.current.src);
  }, [audioSrcUrl]);

  const playAudio = (rate: number = 1.0) => {
    console.log('audio src: ', audioSrcUrl, 'playAudio rate:', rate);
    if (ogAudioElement.current) {
      ogAudioElement.current.playbackRate = rate;
      ogAudioElement.current.play();
    } else {
      console.error('Audio is not loaded yet');
    }
  };

  const contextValue = {
    ogAudioElement,
    audioSrcUrl,
    setAudioSrcUrl,
    globalLoopState,
    setGlobalLoopState,
    playAudio,
  };

  return (
    <AudioSrcCtx.Provider value={contextValue}>{children}</AudioSrcCtx.Provider>
  );
}

export default AudioSrcCtxProvider;

// const soundRef = useRef<Howl | null>(null);

// useEffect(() => {
//   if (audioSrcUrl) {
//     if (soundRef.current) {
//       soundRef.current.unload();
//     }
//     soundRef.current = new Howl({
//       src: [audioSrcUrl],
//       loop: globalLoopState,
//       html5: true,
//     });

//     soundRef.current.once('load', () => {
//       console.log('Audio loaded successfully');
//     });

//     soundRef.current.on('loaderror', (id, error) => {
//       console.error('Audio load error:', error);
//     });
//   }
// }, [audioSrcUrl]);
