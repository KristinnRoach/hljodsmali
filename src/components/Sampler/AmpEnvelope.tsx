// src/components/Sampler/AmpEnvelope.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSamplerEngine } from '../../contexts/EngineContext';
import BasicSlider from '../UI/Basic/BasicSlider';
import { Sample_settings, Volume_settings } from '../../types/samples';
import { SettingsManager } from '@src/lib/engine/SettingsManager';

const AmpEnvelopeControls = () => {
  const {
    selectedForSettings,
    getSampleSettings,
    updateEnvelopeSettings,
    getBufferDuration,
  } = useSamplerEngine();

  const [setMan, setSetMan] = useState<SettingsManager | null>(null);

  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [bufferDuration, setBufferDuration] = useState(0);

  const [attackTime, setAttackTime] = useState(0);
  const [releaseTime, setReleaseTime] = useState(0);

  const [startPoint, setStartPoint] = useState(0);
  const [endPoint, setEndPoint] = useState(bufferDuration ?? 1);

  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(endPoint ?? 1);

  useEffect(() => {
    const manager = SettingsManager.getInstance();
    setSetMan(manager);
  }, []);

  useEffect(() => {
    setSelectedSampleId(selectedForSettings[0]);

    const sampleId = selectedForSettings[0]; // We know there's at least one selected sample
    const settings = getSampleSettings(sampleId, 'All') as Sample_settings;
    const duration = getBufferDuration(sampleId);

    setBufferDuration(duration);
    setStartPoint(settings.time.startPoint);
    setEndPoint(settings.time.endPoint);
    setLoopStart(settings.time.loopStart);
    setLoopEnd(settings.time.loopEnd);
    setAttackTime(settings.volume.attackTime);
    setReleaseTime(settings.volume.releaseTime);
  }, [selectedForSettings, setMan]);

  const handleAttackTimeChange = (newValue: number) => {
    setAttackTime(newValue);
    const sampleId = selectedForSettings[0];
    updateEnvelopeSettings(sampleId, { attackTime: newValue });
  };

  const handleReleaseTimeChange = (newValue: number) => {
    setReleaseTime(newValue);
    const sampleId = selectedForSettings[0];
    updateEnvelopeSettings(sampleId, { releaseTime: newValue });
  };

  const handleStartPointChange = (newValue: number) => {
    if (!setMan) return;
    setStartPoint(newValue);
    setMan.updateParam(selectedForSettings[0], {
      param: 'startPoint',
      value: newValue,
    });
  };

  return (
    <>
      <BasicSlider
        label='Attack'
        value={attackTime}
        min={0}
        max={bufferDuration}
        step={0.0001}
        onChange={(value) => handleAttackTimeChange(value)}
        ceiling={bufferDuration - releaseTime}
      />
      <BasicSlider
        label='Release'
        value={releaseTime}
        min={0.01}
        max={bufferDuration}
        step={0.0001}
        onChange={(value) => handleReleaseTimeChange(value)}
        ceiling={bufferDuration - attackTime}
      />
      {/* <BasicSlider
        label='Start'
        value={startPoint}
        min={0}
        max={bufferDuration}
        step={0.0001}
        onChange={(value) => handleStartPointChange(value)}
        // ceiling={endPoint}
      /> */}
    </>
  );
};

export default AmpEnvelopeControls;

// const [sampleId, setSampleId] = useState('');
// const [settings, setSettings] = useState<Volume_settings | null>(null);

// // get selected sample
// useEffect(() => {
//   const selectedSamples = getSelectedForSettings();
//   if (selectedSamples.length > 0) {
//     const sampleId = selectedSamples[0];
//     setSampleId(sampleId);
//   }
// }, [getSelectedForSettings]);

// // get settings for selected sample
// useEffect(() => {
//   const settings = getSampleSettings(sampleId, 'Volume');
//   if (settings) {
//     setSettings(settings);
//   }
// }, [getSampleSettings, sampleId]);

// useEffect(() => {
//   if (sampleId && settings) {
//     setAttackTime(settings.attackTime);
//     setReleaseTime(settings.releaseTime);
//   }
// }, [settings, sampleId]);

// const handleAttackTimeChange = (newValue: number) => {
//   setAttackTime(newValue);
//   updateEnvelopeSettings(sampleId, { attackTime: newValue });
// };

// const handleReleaseTimeChange = (newValue: number) => {
//   setReleaseTime(newValue);
//   updateEnvelopeSettings(sampleId, { releaseTime: newValue });
// };

// label='Attack'
// value={attackTime}
// min={0}
// max={2} // bufferDuration && releaseTime ? bufferDuration - releaseTime : 2.0}
// step={0.0001}

// label='Release'
// value={releaseTime}
// min={0.01}
// max={2} // bufferDuration && attackTime ? bufferDuration - attackTime : 2.0}

/*
{sample && isSampleLoaded(sample.id) && isSampleSelected(sample.id) && (
  <section className={styles.sample_settings}>
    <div key={sample.id} title={sample.name}>

    </div>
        </section>
      )}

      */

// const [startPoint, setStartPoint] = useState(0);
// const [endPoint, setEndPoint] = useState(1);

// const handleVolumeChange = (newValue: number[]) => {
//   setVolume(newValue);
//   updateEnvelopeSettings(sampleId, { sampleVolume: newValue });
// };

// const handleStartPointChange = (newValue: number[]) => {
//   setStartPoint(newValue);
//   updateTimeSettings(sampleId, { startPoint: newValue });
// };

// const handleEndPointChange = (newValue: number[]) => {
//   setEndPoint(newValue);
//   updateTimeSettings(sampleId, { endPoint: newValue });
// };
