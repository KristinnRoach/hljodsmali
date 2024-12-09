// src/components/Sampler/Recorder.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useSamplerCtx } from '../../contexts/sampler-context';
import Toggle from '../UI/Basic/Toggle';

export default function Recorder() {
  const { startRecording, stopRecording } = useSamplerCtx();
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  }, [isRecording, startRecording, stopRecording]);

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
