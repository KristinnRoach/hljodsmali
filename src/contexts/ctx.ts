import { createContext } from 'react';

interface AudioSrcCtxType {
  startRecording: (duration?: number) => void;
  stopRecording: () => void;
  audioBuffer: AudioBuffer | undefined;
}

export const AudioSrcCtx = createContext<AudioSrcCtxType>({
  startRecording: () => {
    // possible to provide default behavior here if needed
  },
  stopRecording: () => {},
  audioBuffer: undefined,
});

// —————————————————————————————————————————————————————————————————

// import { createContext, Dispatch, SetStateAction } from 'react';
// interface AudioSrcCtxType {
//   ogAudioElement: React.MutableRefObject<HTMLAudioElement>;
//   audioSrcUrl: string;
//   setAudioSrcUrl: Dispatch<SetStateAction<string>>;
//   globalLoopState: boolean;
//   setGlobalLoopState: Dispatch<SetStateAction<boolean>>;
//   playAudio: (rate?: number) => void;
// }

// export const AudioSrcCtx = createContext<AudioSrcCtxType>({
//   ogAudioElement: { current: new Audio() },
//   audioSrcUrl: '',
//   setAudioSrcUrl: () => {},
//   globalLoopState: false,
//   setGlobalLoopState: () => {},
//   playAudio: () => {},
// });
