// src/components/UI/Visualizer_cli.tsx
'use client';
import React, { useMemo } from 'react';
import WaveDynamic from './WaveForms/WaveDynamic';
import { useSamplerCtx } from '../../contexts/sampler-context';
import styles from './Visualizer_cli.module.scss';

function Visualizer_cli() {
  const { latestSelectedSample, latestSelectedBuffer } = useSamplerCtx();

  const sample = latestSelectedSample;
  const buffer = latestSelectedBuffer;

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
        loopStart={normalizePoint(loopStart)}
        loopEnd={normalizePoint(loopEnd)}
        startPoint={normalizePoint(startPoint)}
        endPoint={normalizePoint(endPoint)}
        color={'#676767'}
        showCenterLine={false}
      />
    );
  }, [sample, buffer]);

  return <div className={styles.container}>{memoizedWaveDynamic}</div>;
}

export default Visualizer_cli;
