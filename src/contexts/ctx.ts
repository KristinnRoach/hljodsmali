import { Dispatch, SetStateAction, createContext } from 'react';

// import { Howl } from 'howler';

interface AudioSrcCtxType {
  ogAudioElement: React.MutableRefObject<HTMLAudioElement>;
  // soundRef: React.MutableRefObject<Howl | null>;
  audioSrcUrl: string;
  setAudioSrcUrl: Dispatch<SetStateAction<string>>;
  globalLoopState: boolean;
  setGlobalLoopState: Dispatch<SetStateAction<boolean>>;
  playAudio: (rate?: number) => void;
}

export const AudioSrcCtx = createContext<AudioSrcCtxType>({
  ogAudioElement: { current: new Audio() },
  // soundRef: { current: null },
  audioSrcUrl: '',
  setAudioSrcUrl: () => {},
  globalLoopState: false,
  setGlobalLoopState: () => {},
  playAudio: () => {},
});
