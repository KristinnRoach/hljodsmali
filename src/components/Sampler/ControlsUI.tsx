'use client';

import { useMediaSourceCtx } from '../../contexts/media-source-context';
import { useControlsCtx } from '../../contexts/controls-context';
import BasicSlider from '../UI/BasicSlider';

function ControlsUI() {
  const {
    attackRatio,
    releaseRatio,
    masterVolume,
    setAttackRatio,
    setReleaseRatio,
    setMasterVolume,
  } = useControlsCtx();

  const { theSample } = useMediaSourceCtx();

  return (
    <>
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
        </div>
      )}
    </>
  );
}

export default ControlsUI;
