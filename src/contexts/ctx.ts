import { Dispatch, SetStateAction, createContext } from 'react';

interface AudioSrcCtxType {
  ogAudioElement: React.MutableRefObject<HTMLAudioElement>;
  audioSrcUrl: string;
  setAudioSrcUrl: Dispatch<SetStateAction<string>>;
  globalLoopState: boolean;
  setGlobalLoopState: Dispatch<SetStateAction<boolean>>;
  playAudio: (rate?: number) => void;
}

export const AudioSrcCtx = createContext<AudioSrcCtxType>({
  ogAudioElement: { current: new Audio() },
  audioSrcUrl: '',
  setAudioSrcUrl: () => {},
  globalLoopState: false,
  setGlobalLoopState: () => {},
  playAudio: () => {},
});
