// src/components/Sampler/Recorder.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useSamplerCtx } from '../../contexts/sampler-context';
import Toggle from '../UI/Basic/Toggle';

export default function Recorder() {
  const { startRecording, stopRecording } = useSamplerCtx();
  const [isRecording, setIsRecording] = useState(false);
  const { audioCtx, ensureAudioCtx } = useReactAudioCtx();

  const toggleRecording = useCallback(() => {
    if (!audioCtx) {
      ensureAudioCtx();
    }
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  }, [isRecording, startRecording, stopRecording, audioCtx, ensureAudioCtx]);

  return (
    <div className='recorder'>
      <Toggle
        isOn={isRecording}
        onToggle={toggleRecording}
        label={isRecording ? 'Stop' : 'Record'}
        type='record'
      />
    </div>
  );
}
