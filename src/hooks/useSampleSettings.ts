// hooks/useSampleSettings.ts
import { useCallback } from 'react';
import { useSamplerCtx } from '../contexts/sampler-context';
import { Sample_settings } from '../types/sample';

export const useSampleSettings = () => {
  const { selectedSamples, updateSampleSettings } = useSamplerCtx();

  const handleSettingChange = useCallback(
    (settingKey: keyof Sample_settings, value: number) => {
      try {
        selectedSamples.forEach((sample) => {
          updateSampleSettings(sample.id, { [settingKey]: value });
        });
      } catch (error) {
        console.error('Error updating sample settings:', error);
      }
    },
    [selectedSamples, updateSampleSettings]
  );

  return { handleSettingChange };
};
