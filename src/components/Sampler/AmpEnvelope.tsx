// src/components/Sampler/AmpEnvelope.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSamplerEngine } from '../../contexts/EngineContext';
import BasicSlider from '../UI/Basic/BasicSlider';
import { AmpEnv } from '../../types/types';
import styles from './Sampler.module.scss';

const AmpEnvelopeControls = () => {
  const {
    focusedSettings: selectedForSettings,
    getSampleSettings,
    updateAmpEnvParam,
    getBufferDuration,
  } = useSamplerEngine();

  const [attackTime, setAttackTime] = useState<number | null>(null);
  const [releaseTime, setReleaseTime] = useState<number | null>(null);
  const [bufferDuration, setBufferDuration] = useState(0);

  useEffect(() => {
    const sampleId = selectedForSettings[0];
    console.log('Selected sample ID:', sampleId);

    if (!sampleId) {
      console.log('No sample selected');
      return;
    }

    const allSettings = getSampleSettings(sampleId);
    console.log('All settings:', allSettings);

    const ampEnvSettings = getSampleSettings(sampleId, 'ampEnv');
    console.log('Raw ampEnv settings:', ampEnvSettings);

    if (
      ampEnvSettings &&
      typeof ampEnvSettings === 'object' &&
      'attackTime' in ampEnvSettings &&
      'releaseTime' in ampEnvSettings
    ) {
      const typedAmpEnvSettings = ampEnvSettings as AmpEnv;
      console.log('Typed ampEnv settings:', typedAmpEnvSettings);

      setAttackTime(typedAmpEnvSettings.attackTime);
      setReleaseTime(typedAmpEnvSettings.releaseTime);
    } else {
      console.error('Invalid ampEnv settings:', ampEnvSettings);
      console.error('All settings:', allSettings);
    }

    const duration = getBufferDuration(sampleId);
    console.log('Buffer duration:', duration);

    if (duration) {
      setBufferDuration(duration);
    }
  }, [selectedForSettings, getSampleSettings, getBufferDuration]);

  // useEffect(() => {
  //   const sampleId = selectedForSettings[0];
  //   console.log('Selected sample ID:', sampleId);

  //   if (!sampleId) {
  //     console.log('No sample selected');
  //     return;
  //   }

  //   const ampEnvSettings = getSampleSettings(sampleId, 'ampEnv');
  //   console.log('Raw ampEnv settings:', ampEnvSettings);

  //   if (
  //     ampEnvSettings &&
  //     typeof ampEnvSettings === 'object' &&
  //     'attackTime' in ampEnvSettings &&
  //     'releaseTime' in ampEnvSettings
  //   ) {
  //     const typedAmpEnvSettings = ampEnvSettings as AmpEnv;
  //     console.log('Typed ampEnv settings:', typedAmpEnvSettings);

  //     setAttackTime(typedAmpEnvSettings.attackTime);
  //     setReleaseTime(typedAmpEnvSettings.releaseTime);
  //   } else {
  //     console.error('Invalid ampEnv settings:', ampEnvSettings);
  //   }

  //   const duration = getBufferDuration(sampleId);
  //   console.log('Buffer duration:', duration);

  //   if (duration) {
  //     setBufferDuration(duration);
  //   }
  // }, [selectedForSettings, getSampleSettings, getBufferDuration]);

  console.log('Render values:', { attackTime, releaseTime, bufferDuration });

  // useEffect(() => {
  //   const sampleId = selectedForSettings[0];

  //   console.log('ampEnv sample id: ', sampleId);

  //   if (!sampleId) return;

  //   const settings = getSampleSettings(sampleId, 'ampEnv') as AmpEnv | null;

  //   console.log('ampEnv settings: ', settings);

  //   const duration = getBufferDuration(sampleId);

  //   console.log('ampEnv buffer duration: ', duration);

  //   if (!settings || !duration) return;

  //   setAttackTime(settings.attackTime);
  //   setReleaseTime(settings.releaseTime);
  //   setBufferDuration(duration);
  // }, [selectedForSettings, getSampleSettings, getBufferDuration]);

  const handleAttackTimeChange = (newValue: number) => {
    setAttackTime(newValue);
    updateAmpEnvParam('attackTime', newValue); // accepts optional sampleId if needed
  };

  const handleReleaseTimeChange = (newValue: number) => {
    setReleaseTime(newValue);
    updateAmpEnvParam('releaseTime', newValue);
  };

  return attackTime !== null && releaseTime !== null && bufferDuration > 0 ? (
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
    </>
  ) : (
    <p>Loading...</p>
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
