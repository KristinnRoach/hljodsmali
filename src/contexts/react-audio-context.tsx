'use client';

import React, { createContext, useContext, useState } from 'react';
// import ReactAudioCtx from './ReactAudioCtx';
import { assert } from '../lib/assert';

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
  // assert(typeof window !== 'undefined', 'window is not defined');

  const [audioCtx] = useState<AudioContext>(
    new (window.AudioContext || (window as any).webkitAudioContext)()
  );

  console.log('audioCtx created: ', audioCtx);

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
