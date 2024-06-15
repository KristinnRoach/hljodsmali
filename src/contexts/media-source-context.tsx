'use client';

import {
  ReactNode,
  useContext,
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useReactAudioCtx } from './react-audio-context';

import { blobToAudioBuffer } from '../utils/record';

type MediaSourceCtxProviderProps = {
  children: ReactNode;
};

type MediaSourceCtxType = {
  audioBufferRef: React.MutableRefObject<AudioBuffer | null>;
  audioBuffer: AudioBuffer | null;
  setNewAudioSrc: (newAudioBuffer: AudioBuffer | Blob) => void;
};

export const MediaSourceCtx = createContext<MediaSourceCtxType | null>(null);

export default function MediaSourceCtxProvider({
  children,
}: MediaSourceCtxProviderProps) {
  const { audioCtx } = useReactAudioCtx();

  // is state audio buffer needed?
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (audioBuffer) {
      audioBufferRef.current = audioBuffer;
    }
  }, [audioBuffer]);

  async function setNewAudioSrc(newAudio: AudioBuffer | Blob): Promise<void> {
    if (newAudio instanceof AudioBuffer) {
      setAudioBuffer(newAudio);
    } else if (newAudio instanceof Blob) {
      const buffer = await blobToAudioBuffer(newAudio, audioCtx);
      setAudioBuffer(buffer);
    } else {
      throw new Error('Audio source must be an AudioBuffer or a Blob');
    }
  }

  const contextValue = {
    audioBufferRef,
    audioBuffer,
    setNewAudioSrc,
    setAudioBuffer,
  };
  return (
    <MediaSourceCtx.Provider value={contextValue}>
      {children}
    </MediaSourceCtx.Provider>
  );
}

export function useMediaSourceCtx() {
  const context = useContext(MediaSourceCtx);
  if (!context) {
    throw new Error(
      'useMediaSourceCtx must be used within a MediaSourceCtxProvider'
    );
  }
  return context;
}

// const ogAudioElement = useRef<HTMLAudioElement>(new Audio());
// const [audioSrcUrl, setAudioSrcUrl] = useState<string>('');
// const [globalLoopState, setGlobalLoopState] = useState<boolean>(false);
// const [nrChannels, setNrChannels] = useState<number>(1);

// const sampleRate = 44100; // Standard sample rate for audio
// const length = sampleRate * 1; // 1 second worth of samples
// const numberOfChannels = 1; // Mono

// const emptyAudioBuffer = new AudioBuffer({
//   length: 1,
//   numberOfChannels: 1,
//   sampleRate: audioCtx.sampleRate,
// });
