'use client';

import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react';

type AudioDeviceCtxType = {
  inputs: MediaDeviceInfo[];
  outputs: MediaDeviceInfo[];
  inputID: string;
  outputID: string;
  setInputID: (id: string) => void;
  setOutputID: (id: string) => void;
};

const AudioDeviceCtx = createContext<AudioDeviceCtxType | undefined>(undefined);

export default function AudioDeviceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [inputID, setInputID] = useState<string>('');
  const [outputID, setOutputID] = useState<string>('');

  useEffect(() => {
    const fetchDevices = async () => {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const audioinputs = deviceInfos.filter(
        (device) => device.kind === 'audioinput'
      );
      const audiooutputs = deviceInfos.filter(
        (device) => device.kind === 'audiooutput'
      );
      setInputs(audioinputs);
      setOutputs(audiooutputs);
    };

    fetchDevices();
  }, []);

  return (
    <AudioDeviceCtx.Provider
      value={{
        inputs,
        outputs,
        inputID,
        outputID,
        setInputID,
        setOutputID,
      }}
    >
      {children}
    </AudioDeviceCtx.Provider>
  );
}

export const useAudioDeviceCtx = () => {
  const ctx = useContext(AudioDeviceCtx);
  if (!ctx) {
    throw new Error(
      'useAudioDeviceCtx must be used within an AudioDeviceProvider'
    );
  }
  return ctx;
};
