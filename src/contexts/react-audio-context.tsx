'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createAudioContext, resumeAudioContext } from '../utils/audioUtils';

type ReactAudioCtxProviderProps = {
  children: React.ReactNode;
};

type ReactAudioCtxType = {
  audioCtx: AudioContext;
};

export const ReactAudioCtx = createContext<ReactAudioCtxType | null>(null);

export default function ReactAudioCtxProvider({
  children,
}: ReactAudioCtxProviderProps) {
  const [audioCtx, setAudioCtx] = useState<AudioContext>(
    createAudioContext(0.0001)
  );

  useEffect(() => {
    if (!audioCtx) {
      throw new Error('Failed to create audio context');
    }

    const handleStateChange = () => {
      resumeAudioContext(audioCtx);
    };

    audioCtx.addEventListener('statechange', handleStateChange);

    return () => {
      audioCtx.removeEventListener('statechange', handleStateChange);
      // audioCtx.close();
      // console.warn('audioCtx closed from ReactAudioCtxProvider');
    };
  }, [audioCtx]);

  return (
    <ReactAudioCtx.Provider value={{ audioCtx }}>
      {children}
    </ReactAudioCtx.Provider>
  );
}

export function useReactAudioCtx() {
  const context = useContext(ReactAudioCtx);
  if (!context) {
    throw new Error(
      'useReactAudioCtx must be used within a ReactAudioCtxProvider'
    );
  }
  return context;
}

// let audioCtx: AudioContext | null = null;

// if (typeof window !== 'undefined') {
//   if (!audioCtx) {
//     audioCtx = new (window.AudioContext ||
//       (window as any).webkitAudioContext)();
//   }
// }

// if (audioCtx.state === 'suspended') {
//   audioCtx.resume();
// }

// type AudioContextState = {
//   audioCtx: AudioContext;
// };

// export const ReactAudioCtx = createContext<AudioContextType | null>(null);
