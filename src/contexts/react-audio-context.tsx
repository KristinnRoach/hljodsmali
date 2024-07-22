// src/contexts/react-audio-context.tsx
'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { resumeAudioContext } from '../lib/utils/audioUtils';

type ReactAudioCtxProviderProps = {
  children: React.ReactNode;
};

type ReactAudioCtxType = {
  audioCtx: AudioContext;
};

export const ReactAudioCtx = createContext<ReactAudioCtxType | null>(null);

let audioCtx: AudioContext | null = null;

export default function ReactAudioCtxProvider({
  children,
}: ReactAudioCtxProviderProps) {
  if (typeof window !== 'undefined' && !audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: 0.0001,
    });
  }

  if (!audioCtx) {
    console.warn('Failed to create audio context');
    throw new Error('Failed to create audio context');
  }

  useEffect(() => {
    if (audioCtx) {
      const handleStateChange = () => {
        resumeAudioContext(audioCtx!);
      };

      audioCtx.addEventListener('statechange', handleStateChange);

      return () => {
        audioCtx?.removeEventListener('statechange', handleStateChange);
        // audioCtx.close(); // unecessary and could cause issues?
        // console.warn('audioCtx closed from ReactAudioCtxProvider');
      };
    }
  }, []);

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

// const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

// useEffect(() => {
//   // try {
//   if (typeof window !== 'undefined' && !audioCtx) {
//     setAudioCtx(
//       new (window.AudioContext || (window as any).webkitAudioContext)({
//         latencyHint: 0.0001,
//       })
//     );
//   }
//   // } catch (error) {
//   //   console.error('Failed to create audio context:', error);
//   //   throw new Error('Failed to create audio context');
//   // }
// }, [audioCtx]); // audioCtx
