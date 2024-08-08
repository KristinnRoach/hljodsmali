// hooks/useSampleSettings.ts
import { useCallback } from 'react';
import { useSamplerCtx } from '../contexts/sampler-context';
import { Sample_settings } from '../types/samples';

export const useSampleSettings = () => {
  const { latestSelectedSample, updateSampleSettings } = useSamplerCtx();

  const handleSettingChange = useCallback(
    (settingKey: keyof Sample_settings, value: number) => {
      if (!latestSelectedSample) throw new Error('No sample selected');

      if (settingKey === 'loopStart') {
        console.log(
          'HANDLER: ',
          settingKey,
          ' loop length: ',
          latestSelectedSample.sample_settings.loopEnd - value
        );
      }

      if (settingKey === 'loopEnd') {
        console.log(
          'HANDLER: ',
          settingKey,
          ' loop length: ',
          value - latestSelectedSample.sample_settings.loopStart
        );
      }

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
