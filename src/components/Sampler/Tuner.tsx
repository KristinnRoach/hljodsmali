'use client';

import React, { useEffect, useState } from 'react';
// import { useSampleSettings } from '../../hooks/useSampleSettings';

import { useSamplerEngine } from '../../contexts/EngineContext';
import Knob from '../UI/Basic/Knob';
import TestTone from './TestTone';

import { getFrequency } from '../../types/constants/note-utils';
import { Pitch_settings } from '../../types/types';

import { useDraggable } from '@dnd-kit/core';

type TunerProps = {
  className?: string;
};

function Tuner(props: TunerProps) {
  // const { handleSettingChange } = useSampleSettings();
  // const { transposition, tuneOffset } = props;
  const {
    focusedSettings: selectedForSettings,
    getSampleSettings,
    updatePitchParam,
  } = useSamplerEngine();

  const [transposition, setTransposition] = useState<number>(0);
  const [tuneOffset, setTuneOffset] = useState<number>(0);
  const [oscFrequency, setOscFrequency] = useState(getFrequency('C4'));

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  useEffect(() => {
    const sampleId = selectedForSettings[0]; // We know there's at least one selected sample because of conditional rendering in parent component
    if (!sampleId) return;

    const settings = getSampleSettings(sampleId, 'pitch') as Pitch_settings;
    if (!(settings && settings.transposition && settings.tuneOffset)) return;

    setTransposition(settings.transposition ?? 0);
    setTuneOffset(settings.tuneOffset ?? 0);
  }, [selectedForSettings, getSampleSettings]); // updatePitchSettings

  const handleTransposition = (newValue: number) => {
    setTransposition(newValue);
    updatePitchParam('transposition', newValue || 0);
  };

  const handleTuneOffset = (newValue: number) => {
    setTuneOffset(newValue);
    const sampleId = selectedForSettings[0];
    if (!sampleId) return;
    updatePitchParam('tuneOffset', newValue || 0);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className={props.className || ''}>
        {selectedForSettings.length > 0 && (
          <Knob
            label={'Transpose'}
            value={transposition ?? 0}
            min={-24}
            max={24}
            step={1}
            onChange={(value) => handleTransposition(value)}
            size='m'
          />
        )}

        <TestTone
          frequency={oscFrequency || 261.626}
          className={'styles.testTone'}
        />

        {selectedForSettings.length > 0 && (
          <Knob
            label={'Detune'}
            value={tuneOffset ?? 0}
            min={-1.0}
            max={1.0}
            step={0.01}
            onChange={(value) => handleTuneOffset(value)}
            size='m'
          />
        )}
      </div>
    </div>
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
