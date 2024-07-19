// src/components/Recorder.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useSamplerCtx } from '../../contexts/sampler-context';
// import SamplerEngine from '../../lib/SamplerEngine';
import Toggle from '../UI/Basic/Toggle';

export default function Recorder() {
  // const samplerEngine = SamplerEngine.getInstance();
  const { startRecording, stopRecording } = useSamplerCtx();
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // samplerEngine.stopRecording();
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      // samplerEngine.startRecording();
      setIsRecording(true);
    }
  }, [isRecording, startRecording, stopRecording]); // samplerEngine

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
