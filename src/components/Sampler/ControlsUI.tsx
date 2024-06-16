'use client';

import { useControlsCtx } from '../../contexts/controls-context';
import BasicSlider from '../Slider/BasicSlider';

function ControlsUI() {
  const {
    attackRatio,
    releaseRatio,
    masterVolume,
    setAttackRatio,
    setReleaseRatio,
    setMasterVolume,
  } = useControlsCtx();

  return (
    <div>
      <BasicSlider
        label='Attack'
        value={attackRatio}
        min={0}
        max={1}
        step={0.01}
        onChange={setAttackRatio}
      />
      <BasicSlider
        label='Release'
        value={releaseRatio}
        min={0}
        max={1}
        step={0.01}
        onChange={setReleaseRatio}
      />
      <BasicSlider
        label='Master Volume'
        value={masterVolume}
        min={0}
        max={1}
        step={0.01}
        onChange={setMasterVolume}
      />
    </div>
  );
}

export default ControlsUI;
