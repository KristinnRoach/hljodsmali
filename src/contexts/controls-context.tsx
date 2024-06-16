'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

type ControlsCxtProviderProps = {
  children: ReactNode;
};

type ControlsCxtProps = {
  attackRatioRef: React.MutableRefObject<number>;
  releaseRatioRef: React.MutableRefObject<number>;
  masterVolumeRef: React.MutableRefObject<number>;
  attackRatio: number;
  releaseRatio: number;
  masterVolume: number;
  setAttackRatio: (value: number) => void;
  setReleaseRatio: (value: number) => void;
  setMasterVolume: (value: number) => void;
};

export const ControlsCxt = createContext<ControlsCxtProps | null>(null);

export default function ControlsCtxProvider({
  children,
}: ControlsCxtProviderProps) {
  const [attackRatio, setAttackRatio] = useState(0.05);
  const [releaseRatio, setReleaseRatio] = useState(0.1);
  const [masterVolume, setMasterVolume] = useState(0.75);

  const attackRatioRef = useRef(attackRatio);
  const releaseRatioRef = useRef(releaseRatio);
  const masterVolumeRef = useRef(masterVolume);

  useEffect(() => {
    attackRatioRef.current = attackRatio;
    releaseRatioRef.current = releaseRatio;
    masterVolumeRef.current = masterVolume;
  }, [attackRatio, releaseRatio, masterVolume]);

  const contextValue = {
    attackRatioRef,
    releaseRatioRef,
    masterVolumeRef,
    attackRatio,
    releaseRatio,
    masterVolume,
    setAttackRatio,
    setReleaseRatio,
    setMasterVolume,
  };

  return (
    <ControlsCxt.Provider value={contextValue}>{children}</ControlsCxt.Provider>
  );
}

export function useControlsCtx() {
  const context = useContext(ControlsCxt);
  if (!context) {
    throw new Error('useControlsCtx must be used within a ControlsCtxProvider');
  }
  return context;
}
