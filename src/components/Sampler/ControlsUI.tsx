'use client';

import { useMediaSourceCtx } from '@components/contexts/media-source-context';
import { useControlsCtx } from '../../contexts/controls-context';
import BasicSlider from '../UI/BasicSlider';
import { useState } from 'react';
import AudioDeviceSelector from './AudioDeviceSelector';
// import { useSearchParams } from 'next/navigation';
// import Link from 'next/link';

function ControlsUI() {
  const {
    attackRatio,
    releaseRatio,
    masterVolume,
    setAttackRatio,
    setReleaseRatio,
    setMasterVolume,
  } = useControlsCtx();

  // const searchParams = useSearchParams();
  // const attack = searchParams.get('attack');
  // const revOn = searchParams.get('rev');

  const { theSample } = useMediaSourceCtx();

  const [reverbEnabled, setReverbEnabled] = useState(false);

  const toggleReverb = () => {
    setReverbEnabled((prev) => !prev);
  };

  return (
    <>
      <AudioDeviceSelector />
      {theSample.current?.buffer && (
        <div>
          <BasicSlider
            label='Attack'
            value={attackRatio}
            min={0.001}
            max={1}
            step={0.001}
            onChange={setAttackRatio}
          />
          <BasicSlider
            label='Release'
            value={releaseRatio}
            min={0.001}
            max={1}
            step={0.001}
            onChange={setReleaseRatio}
          />
          <BasicSlider
            label='Volume'
            value={masterVolume}
            min={0}
            max={1}
            step={0.001}
            onChange={setMasterVolume}
          />
          <button onClick={toggleReverb}>
            {reverbEnabled ? 'Disable Reverb' : 'Enable Reverb'}
          </button>
        </div>
      )}
    </>
  );
}

export default ControlsUI;
