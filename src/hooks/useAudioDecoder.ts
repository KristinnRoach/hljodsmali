'use client';

import { useReactAudioCtx } from '../contexts/react-audio-context';

export function useAudioDecoder() {
  const { audioCtx } = useReactAudioCtx();

  return async (arrayBuffer: ArrayBuffer): Promise<AudioBuffer> => {
    return await audioCtx.decodeAudioData(arrayBuffer);
  };
}
