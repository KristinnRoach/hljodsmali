import { createContext } from 'react';

interface AudioSrcCtxType {
  startRecording: (duration?: number) => void;
  stopRecording: () => void;
  audioBufferRef: React.MutableRefObject<AudioBuffer | null>;
  setNewAudioSrc: (newAudioBuffer: AudioBuffer | Blob) => void;
}

export const AudioSrcCtx = createContext<AudioSrcCtxType>({
  startRecording: () => {
    // possible to provide default behavior here if needed
  },
  stopRecording: () => {},
  audioBufferRef: { current: null },
  setNewAudioSrc: () => {},
});

// —————————————————————————————————————————————————————————————————

//const emptyBuffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);

// audioBuffer: AudioBuffer;
// setAudioBuffer: (audioBuffer: AudioBuffer) => void;

// audioBuffer: emptyBuffer,
// setAudioBuffer: () => {},
