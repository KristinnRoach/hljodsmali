// src/contexts/ReactAudioCtx.tsx

'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as audioUtils from '../lib/audio/audioCtx-utils';

type ReactAudioCtxType = {
  audioCtx: AudioContext | null;
  isAudioReady: boolean;
};

const ReactAudioCtx = createContext<ReactAudioCtxType | undefined>(undefined);

const ReactAudioCtxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      const ctx = audioUtils.initializeAudioContext();

      await audioUtils.resumeAudioContext();
      setAudioCtx(ctx);
      setIsAudioReady(true);
    };

    initAudio();

    return () => {
      audioUtils.closeAudioContext();
    };
  }, []);

  const contextValue: ReactAudioCtxType = {
    audioCtx,
    isAudioReady,
    ...audioUtils,
  };

  return (
    <ReactAudioCtx.Provider value={contextValue}>
      {children}
    </ReactAudioCtx.Provider>
  );
};

export default ReactAudioCtxProvider;

export const useReactAudioCtx = () => {
  const context = useContext(ReactAudioCtx);
  if (!context) {
    throw new Error(
      'useReactAudioCtx must be used within a ReactAudioCtxProvider'
    );
  }
  return context;
};

export const useAudioCtxUtils = () => {
  const { isAudioReady } = useReactAudioCtx();

  if (!isAudioReady) {
    throw new Error('Audio context is not ready');
  }

  return {
    createGainNode: audioUtils.createGainNode,
    createOscillator: audioUtils.createOscillator,
    createBufferSource: audioUtils.createBufferSource,
    decodeAudioData: audioUtils.decodeAudioData,
  };
};
