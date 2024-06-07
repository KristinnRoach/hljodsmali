'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { AudioSrcCtx } from '../../contexts/ctx';
import { sliceAudioBuffer } from '../../utils/audioBuffer';
import BasicSlider from '../Slider/BasicSlider';

const SampleSlicer: React.FC = ({}) => {
  const { audioBufferRef, setNewAudioSrc } = useContext(AudioSrcCtx);

  function initEndTrimMs(durationMs: number): number {
    return durationMs - durationMs / 6;
  }

  const durationMsRef = useRef<number>(audioBufferRef.current?.duration || 0);

  const [startPoint, setStartPoint] = useState<number>(0);
  const [endPoint, setEndPoint] = useState<number>(0);

  console.log(
    'slicer rerendered, endPoint: ',
    endPoint,
    'durationMsRef: ',
    durationMsRef.current
  );

  useEffect(() => {
    console.log(
      'useEffect runs! audioBufferRef.current: ',
      audioBufferRef.current
    );
    if (audioBufferRef.current) {
      durationMsRef.current = audioBufferRef.current.duration * 1000;
      // endPointRef.current = audioBufferRef.current?.duration || 0;
      setEndPoint(initEndTrimMs(durationMsRef.current));
      setStartPoint(0);
    }
  }, [audioBufferRef.current]);

  function handleStartPointFinalChange(value: number) {
    setStartPoint(value);
  }

  function handleEndPointFinalChange(value: number) {
    setEndPoint(value);
  }

  function slice(): void {
    if (audioBufferRef.current) {
      const slicedBuffer = sliceAudioBuffer(
        audioBufferRef.current,
        startPoint * 1000,
        endPoint * 1000
      );
      console.log('slicedBuffer: ', slicedBuffer);
      setNewAudioSrc(slicedBuffer);
    } else {
      console.error('Audio buffer not available from slice()');
    }
  }

  return (
    durationMsRef.current && (
      <div>
        <h1>Sample Edit</h1>
        <div>
          <button onClick={slice}>Slice</button>
        </div>
        <BasicSlider
          label='Start Point'
          min={0}
          max={endPoint - 1}
          value={startPoint}
          onChange={() => {}} // Empty onChange to allow the slider to move without updating the state
          onFinalChange={handleStartPointFinalChange}
        />
        <BasicSlider
          label='End Point'
          min={startPoint + 1}
          max={durationMsRef.current}
          value={endPoint}
          onChange={() => {}} // Empty onChange to allow the slider to move without updating the state
          onFinalChange={handleEndPointFinalChange}
        />
      </div>
    )
  );
};

export default SampleSlicer;
