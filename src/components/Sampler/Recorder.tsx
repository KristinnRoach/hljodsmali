// src/components/Recorder.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useSamplerCtx } from '../../contexts/sampler-context';
// import SamplerEngine from '../../lib/SamplerEngine';

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
      <button onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}
