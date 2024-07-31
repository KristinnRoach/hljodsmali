// src/components/UI/Visualizer_cli.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import WaveDynamic from './WaveForms/WaveDynamic';
import { useSamplerCtx } from '../../contexts/sampler-context';
import { Sample_db, Sample_settings } from '../../types/sample';
import styles from './Visualizer_cli.module.scss';
import { set } from 'react-hook-form';

function Visualizer_cli() {
  const { latestSelectedSample, latestSelectedBuffer } = useSamplerCtx();

  const [sample, setSample] = useState<Sample_db | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (!latestSelectedSample || !latestSelectedBuffer) return;

    setSample(latestSelectedSample);
    setBuffer(latestSelectedBuffer);
  }, [latestSelectedSample, latestSelectedBuffer]);

  // Convert time values to normalized values if necessary
  const normalizePoint = (point: number) =>
    buffer ? point / buffer.duration : 0;

  const memoizedWaveDynamic = useMemo(() => {
    if (!sample || !buffer || buffer.length === 0) return null;
    const { startPoint, endPoint, loopStart, loopEnd } = sample.sample_settings;

    return (
      <WaveDynamic
        key={buffer.length} // Forces re-render when buffer changes
        buffer={buffer}
        width={800}
        height={200}
        loopStart={loopStart}
        loopEnd={loopEnd}
        startPoint={startPoint}
        endPoint={endPoint}
        color={'#676767'}
        showCenterLine={false}
      />
    );
  }, [sample, buffer]);

  return <div className={styles.container}>{memoizedWaveDynamic}</div>;
}

export default Visualizer_cli;
