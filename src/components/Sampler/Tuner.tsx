'use client';

import React, { useState } from 'react';
import { useSampleSettings } from '../../hooks/useSampleSettings';
import Knob from '../UI/Basic/Knob';
import TestTone from './TestTone';

import { getFrequency } from '../../types/constants/note-utils';

type TunerProps = {
  className?: string;
  transposition: number;
  tuneOffset: number;
};

function Tuner(props: TunerProps) {
  const { handleSettingChange } = useSampleSettings();
  const { transposition, tuneOffset } = props;

  const [oscFrequency, setOscFrequency] = useState(getFrequency('C4'));

  return (
    <div className={props.className || ''}>
      <Knob
        label={'Transpose'}
        value={transposition ?? 0}
        min={-24}
        max={24}
        step={1}
        onChange={(value) => handleSettingChange('transposition', value)}
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
        onChange={(value) => handleSettingChange('tuneOffset', value)}
        size='m'
      />
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
