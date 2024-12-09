'use client';

import React, { useEffect, useState } from 'react';

import Knob from '../UI/Basic/Knob';
import TestTone from './TestTone';
import { useSamplerEngine } from '../../contexts/EngineContext';
import { getFrequency } from '../../types/constants/note-utils';
import { Pitch_settings } from '../../types/samples';

type TunerProps = {
  className?: string;
};

function Tuner(props: TunerProps) {
  const { selectedForSettings, getSampleSettings, updatePitchSettings } =
    useSamplerEngine();

  const [transposition, setTransposition] = useState<number>(0);
  const [tuneOffset, setTuneOffset] = useState<number>(0);
  const [oscFrequency, setOscFrequency] = useState(getFrequency('C4'));

  useEffect(() => {
    if (selectedForSettings.length === 0) return;

    const sampleId = selectedForSettings[0]; // We know there's at least one selected sample because of conditional rendering in parent component
    const settings = getSampleSettings(sampleId, 'Pitch') as Pitch_settings;

    setTransposition(settings.transposition ?? 0);
    setTuneOffset(settings.tuneOffset ?? 0);
  }, [selectedForSettings, getSampleSettings]);

  const handleTransposition = (newValue: number) => {
    setTransposition(newValue);
    const sampleId = selectedForSettings[0];
    if (!sampleId) return;
    updatePitchSettings(sampleId, { transposition: newValue });
  };

  const handleTuneOffset = (newValue: number) => {
    setTuneOffset(newValue);
    const sampleId = selectedForSettings[0];
    if (!sampleId) return;
    updatePitchSettings(sampleId, { tuneOffset: newValue });
  };

  return (
    <>
      {selectedForSettings.length > 0 && (
        <div className={props.className || ''}>
          <Knob
            label={'Transpose'}
            value={transposition ?? 0}
            min={-24}
            max={24}
            step={1}
            onChange={(value) => handleTransposition(value)}
            size='m'
          />

          <TestTone
            frequency={oscFrequency || 261.626}
            className={'styles.testTone'}
          />

          <Knob
            label={'Detune'}
            value={tuneOffset ?? 0}
            min={-1.0}
            max={1.0}
            step={0.01}
            onChange={(value) => handleTuneOffset(value)}
            size='m'
          />
        </div>
      )}
    </>
  );
}

export default Tuner;

/* <input
          type='range'
          min={-24}
          max={24}
          // defaultValue={transposition ?? 0}
          step={1}
          value={transposition ?? 0}
          onChange={(e) =>
            handleSettingChange('transposition', parseFloat(e.target.value))
          }
        />

        <input
          type='range'
          min={-1}
          max={1}
          //   defaultValue={tuneOffset ?? 0}
          step={0.01}
          value={tuneOffset ?? 0}
          onChange={(e) =>
            handleSettingChange('tuneOffset', parseFloat(e.target.value))
          }
        /> */
/* </div> */

/* 
      fadeInMs={200} fadeOutMs={250}


      <BasicSlider
        label='Transpose'
        value={transposition ?? 0}
        min={-36}
        max={36}
        step={1}
        onChange={(value) => handleSettingChange('transposition', value)}
      />
      <BasicSlider
        label='Tune'
        value={tuneOffset ?? 0}
        min={-1.0}
        max={1.0}
        step={0.0001}
        onChange={(value) => handleSettingChange('tuneOffset', value)}
      /> */

/* <Knob
          label='Transpose'
          defaultValue={0}
          value={transposition ?? 0}
          min={-24}
          max={24}
          step={1}
          onChange={(value) => handleSettingChange('transposition', value)}
        />
        <Knob
          label='Tune'
          defaultValue={0}
          value={tuneOffset ?? 0}
          min={-1.0}
          max={1.0}
          step={0.01}
          onChange={(value) => handleSettingChange('tuneOffset', value)}
        /> */
