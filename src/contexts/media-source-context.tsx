'use client';

import { ReactNode, useContext, createContext, useRef, useState } from 'react';
import { Sample } from '../types';

type MediaSourceCtxProviderProps = {
  children: ReactNode;
};

type MediaSourceCtxType = {
  theBuffer: React.MutableRefObject<AudioBuffer | null>;
  theSample: React.MutableRefObject<Sample | null>;
  setNewAudioSrc: (sample: Sample) => void;
  sampleSwitch: boolean;
};

export const MediaSourceCtx = createContext<MediaSourceCtxType | null>(null);

export default function MediaSourceCtxProvider({
  children,
}: MediaSourceCtxProviderProps) {
  // const { audioCtx } = useReactAudioCtx();

  /* URL TEST FOR SAMPLE */

  const theSample = useRef<Sample | null>(null);
  const theBuffer = useRef<AudioBuffer | null>(null);

  const [sampleSwitch, setSampleSwitch] = useState<boolean>(false);

  //const sampleId = searchParams.get('sample-id');

  // const [audioURL, setAudioURL] = useState(() => {
  //   const savedURL = localStorage.getItem('audioURL');
  //   return savedURL ? JSON.parse(savedURL) : '';
  // });

  // useEffect(() => {
  //   audioBufferRef.current = audioBuffer;
  //   localStorage.setItem('audioURL', JSON.stringify(audioURL));
  // }, [audioURL]);

  // // Clean up audioURL on unmount
  // useEffect(() => {
  //   return () => {
  //     if (audioURL) {
  //       URL.revokeObjectURL(audioURL);
  //     }
  //   };
  // }, []);

  // Set audiobuffer and audiobufferref from local storage if it exists
  // useEffect(() => {
  //   async function getBufferFromURL(url: string): Promise<AudioBuffer> {
  //     const res = await fetch(url);
  //     const blob = await res.blob();
  //     return await blobToAudioBuffer(blob, audioCtx);
  //   }

  //   const savedURL: string | null = localStorage.getItem('audioURL') || null;
  //   if (savedURL) {
  //     // const url = JSON.parse(savedURL);
  //     getBufferFromURL(savedURL).then((buffer) => {
  //       setAudioBuffer(buffer);
  //       audioBufferRef.current = buffer;
  //     });
  //   }
  // }, []);

  function setNewAudioSrc(newSample: Sample): void {
    if (!newSample.buffer || !newSample) {
      throw new Error('No buffer in sample object');
    }
    theSample.current = newSample;
    theBuffer.current = newSample.buffer;
    setSampleSwitch((prev) => !prev);
  }

  const contextValue = {
    theBuffer,
    theSample,
    setNewAudioSrc,
    sampleSwitch,
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
