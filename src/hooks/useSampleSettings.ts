// hooks/useSampleSettings.ts
import { useCallback } from 'react';
import { useSamplerCtx } from '../contexts/SamplerCtx';
import { Sample_settings } from '../types/samples';

export const useSampleSettings = () => {
  const { latestSelectedSample, updateSampleSettings } = useSamplerCtx();

  const handleSettingChange = useCallback(
    (settingKey: keyof Sample_settings, value: number) => {
      if (!latestSelectedSample) return; // throw new Error('No sample selected');

      try {
        updateSampleSettings(latestSelectedSample.id, { [settingKey]: value });
      } catch (error) {
        console.error('Error updating sample settings:', error);
      }
    },
    [latestSelectedSample, updateSampleSettings]
  );

  return { handleSettingChange };
};

// const C5_DURATION_SEC = 0.00191117077819399; // just a constant for now

// const { sample_settings: settings } = latestSelectedSample; // deconstruct or not??

// ____________ MOVE THIS TO MORE APPROPRIATE PLACE ____________
// let newloopstart: number = 0;
// let newloopend: number = 0;
// let newlooplength: number = 0;
// if (settingKey === 'loopStart' || settingKey === 'loopEnd') {
//   newloopstart = settingKey === 'loopStart' ? value : settings.loopStart;
//   newloopstart = settingKey === 'loopEnd' ? value : settings.loopEnd;

//   newlooplength =
//     newloopend > newloopstart ? newloopend - newloopstart : 0;

//   if (newlooplength < 0.0019) {
//     // 0.0019 is the minimum loop length (around C5)
//     return;
//   }
// }
// ____________ MOVE THIS TO MORE APPROPRIATE PLACE ____________
