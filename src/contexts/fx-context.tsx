'use client';

import React, {
  ReactNode,
  useContext,
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useReactAudioCtx } from './react-audio-context';

type FxCtxProviderProps = {
  children: ReactNode;
};

type FxCtxType = {
  reverbEnabledRef: React.MutableRefObject<boolean>;
  setReverbEnabled: (val: boolean) => void;
};

export const FxCtx = createContext<FxCtxType | null>(null);

export default function FxCtxProvider({ children }: FxCtxProviderProps) {
  const { audioCtx } = useReactAudioCtx();

  const [reverbEnabled, setReverbEnabled] = useState<boolean>(false);
  const reverbEnabledRef = useRef<boolean>(reverbEnabled);

  useEffect(() => {
    reverbEnabledRef.current = reverbEnabled;
  }, [reverbEnabled]);

  const contextValue = {
    reverbEnabledRef,
    setReverbEnabled,
  };
  return <FxCtx.Provider value={contextValue}>{children}</FxCtx.Provider>;
}

export function useFxCtx() {
  const context = useContext(FxCtx);
  if (!context) {
    throw new Error('useFxCtx must be used within a FxCtxProvider');
  }
  return context;
}
