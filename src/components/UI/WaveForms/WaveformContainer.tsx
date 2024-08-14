// src/components/UI/WaveformContainer.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Waveform from './Waveform';
import { useSamplerCtx } from '../../../contexts/SamplerCtx';
import { SampleRecord } from '../../../types/samples';
import styles from '../../../styles/Waveform.module.scss';

function WaveformContainer() {
  const { latestSelectedSample, latestSelectedBuffer } = useSamplerCtx();

  const [sample, setSample] = useState<SampleRecord | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (!latestSelectedSample || !latestSelectedBuffer) return;

    setSample(latestSelectedSample);
    setBuffer(latestSelectedBuffer);
  }, [latestSelectedSample, latestSelectedBuffer]);

  const memoizedWaveDynamic = useMemo(() => {
    if (!sample || !buffer || buffer.length === 0) return null;
    const { startPoint, endPoint, loopStart, loopEnd } = sample.sample_settings;

    // Calculate width based on buffer duration
    const pixelsPerSecond = 200; // Adjust this value to change the scaling
    const calculatedWidth = Math.max(
      800,
      Math.ceil(buffer.duration * pixelsPerSecond)
    );

    console.log('Visualizer_cli: memoizedWaveDynamic', sample.name);

    return (
      <Waveform
        // key={sample.id} // Forces re-render when buffer changes
        buffer={buffer}
        width={calculatedWidth}
        height={200}
        loopStart={loopStart}
        loopEnd={loopEnd}
        startPoint={startPoint}
        endPoint={endPoint}
        color={'#676767'}
        showCenterLine={false}
      />
    );
  }, [
    sample,
    buffer,
    // sampleSwitchFlag,
    // latestSelectedSample,
    // latestSelectedBuffer,
  ]); // why need all this for reliable re-render when switching samples?

  return (
    <div className={styles.container}>
      <div className={styles.waveformScroller}>
        {sample && buffer && <div key={sample.id}>{memoizedWaveDynamic}</div>}
      </div>
    </div>
  );
}

export default WaveformContainer;

// Convert time values to normalized values if necessary
// const normalizePoint = (point: number) =>
//   buffer ? point / buffer.duration : 0;
