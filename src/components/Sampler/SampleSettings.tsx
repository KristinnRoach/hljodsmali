// components/SampleSettings.tsx
'use client';
import React, { useState } from 'react';
import { Sample_db, Sample_settings } from '../../types/sample';
import { useSamplerCtx } from '../../contexts/sampler-context';
import { useSampleSettings } from '../../hooks/useSampleSettings';
import BasicSlider from '../UI/Basic/BasicSlider';
import styles from './Sampler.module.scss';

const SampleSettings: React.FC = () => {
  const { latestSelectedSample, isSampleLoaded, isSampleSelected } =
    useSamplerCtx();
  const { handleSettingChange } = useSampleSettings();

  const C5_DURATION_SEC = 0.00191117077819399; // 0.0595 seconds

  const sample = latestSelectedSample as Sample_db;
  const settings = sample?.sample_settings as Sample_settings;

  const {
    startPoint,
    endPoint,
    loopStart,
    loopEnd,

    attackTime,
    releaseTime,
    lowCutoff,
    highCutoff,
  } = settings;

  const [durationHasChanged, setDurationHasChanged] = useState(false);
  const [loopDurationHasChanged, setLoopDurationHasChanged] = useState(false);

  const handleStartChange = (value: number) => {
    handleSettingChange('startPoint', value);
    setDurationHasChanged(true);
    if (!loopDurationHasChanged) {
      handleSettingChange('loopStart', value);
    }
  };

  const handleEndChange = (value: number) => {
    handleSettingChange('endPoint', value);
    setDurationHasChanged(true);
    if (!loopDurationHasChanged) {
      handleSettingChange('loopEnd', value);
    }
  };

  const handleLoopStartChange = (value: number) => {
    if (loopEnd - value < C5_DURATION_SEC - 0.0001) return;

    handleSettingChange('loopStart', value);
    setLoopDurationHasChanged(true);
    if (!durationHasChanged) {
      handleSettingChange('startPoint', value);
    }
  };

  const handleLoopEndChange = (value: number) => {
    if (value - loopStart < C5_DURATION_SEC - 0.0001) return;

    handleSettingChange('loopEnd', value);
    setLoopDurationHasChanged(true);
    if (!durationHasChanged) {
      handleSettingChange('endPoint', value);
    }
  };

  return (
    <>
      {sample && isSampleLoaded(sample.id) && isSampleSelected(sample.id) && (
        <section className={styles.sample_settings}>
          <div key={sample.id} title={sample.name}>
            <h2>{sample.name}</h2>
            <BasicSlider
              label='Start'
              value={startPoint}
              min={0}
              max={sample.bufferDuration}
              step={0.001}
              onChange={handleStartChange}
              maxDynamic={endPoint - 0.0001}
            />
            <BasicSlider
              label='End'
              value={endPoint}
              min={0}
              max={sample.bufferDuration}
              step={0.001}
              onChange={handleEndChange}
              minDynamic={startPoint + 0.0001}
            />
            <BasicSlider
              label='Loop Start'
              value={loopStart ?? 0}
              min={0}
              max={sample.bufferDuration}
              step={0.0001}
              onChange={handleLoopStartChange}
              maxDynamic={loopEnd - 0.0001}
            />
            <BasicSlider
              label='Loop End'
              value={loopEnd ?? sample.bufferDuration}
              min={0}
              max={sample.bufferDuration}
              step={0.001}
              onChange={handleLoopEndChange}
              minDynamic={loopStart + 0.0001}
            />
            <BasicSlider
              label='Attack'
              value={attackTime}
              min={0}
              max={sample.bufferDuration}
              step={0.0001}
              onChange={(value) => handleSettingChange('attackTime', value)}
            />
            <BasicSlider
              label='Release'
              value={releaseTime}
              min={0.01}
              max={sample.bufferDuration}
              step={0.0001}
              onChange={(value) => handleSettingChange('releaseTime', value)}
            />
            <BasicSlider
              label='LowCut'
              value={lowCutoff ?? 40}
              min={20}
              max={20000}
              step={0.0001}
              onChange={(value) => handleSettingChange('lowCutoff', value)}
              isLogarithmic={true}
            />
            <BasicSlider
              label='HighCut'
              value={highCutoff ?? 20000}
              min={20}
              max={20000}
              step={0.0001}
              onChange={(value) => handleSettingChange('highCutoff', value)}
              isLogarithmic={true}
            />
          </div>
        </section>
      )}
    </>
  );
};

export default SampleSettings;
