// src/hooks/useSampleSettings.ts

import { useCallback, useRef, useState } from 'react';
import {
  Sample_settings,
  Filter_settings,
  Lock_settings,
  Pitch_settings,
  Time_settings,
  AmpEnv,
  Volume_settings,
  SettingsType,
  TimeParam,
  EnvParam,
  FilterParam,
  LockParam,
  PitchParam,
  VolumeParam,
} from '../types/types';

import useZeroCrossingManager from './useZeroCrossings';

export default function useSampleSettings() {
  const sampleSettingsRef = useRef<Map<string, Sample_settings>>(new Map());
  // selected settings here ?
  const [triggerRender, setTriggerRender] = useState(0);

  const forceRender = useCallback(() => {
    setTriggerRender((prev) => prev + 1);
  }, []);

  const zeroCrossingManager = useZeroCrossingManager();

  const getAllSettings = useCallback(() => {
    return new Map(sampleSettingsRef.current);
  }, []);

  const setSampleSettingsForId = useCallback(
    (sampleId: string, settings: Sample_settings) => {
      sampleSettingsRef.current.set(sampleId, settings);

      console.log(
        `sampleSettingsRef ${sampleSettingsRef.current} settingsState`
      );

      forceRender();
    },
    []
  );

  const removeSampleSettings = useCallback((sampleId: string) => {
    sampleSettingsRef.current.delete(sampleId);
    forceRender();
  }, []);

  const hasSampleSettings = useCallback((sampleId: string) => {
    return sampleSettingsRef.current.has(sampleId);
  }, []);

  const getSampleSettings = useCallback(
    (
      id: string,
      type?: keyof Sample_settings
    ): Sample_settings | Sample_settings[keyof Sample_settings] | null => {
      const settings = sampleSettingsRef.current.get(id);

      if (!settings) {
        console.error(`Sample ${id} not loaded`);
        return null;
      }

      if (type) {
        console.log(`getting ${type ? type : ''} settings:`, settings[type]);
        return settings[type];
      }

      return settings;
    },
    []
  );

  const updateTimeParam = useCallback(
    (sampleId: string, param: TimeParam, newValue: number) => {
      const settings = sampleSettingsRef.current.get(sampleId);
      if (!settings) return;

      const snappedValue = zeroCrossingManager.snapToZeroCrossing(
        newValue,
        sampleId
      );
      if (!snappedValue) return;

      settings.time = { ...settings.time, [param]: snappedValue };
      sampleSettingsRef.current.set(sampleId, settings);

      forceRender();
    },
    [zeroCrossingManager]
  );

  const updateAmpEnvParam = useCallback(
    // add settingType as arg to avoid duplicates
    (sampleId: string, param: EnvParam, newValue: number) => {
      const settings = sampleSettingsRef.current.get(sampleId);
      if (!settings) return;

      settings.ampEnv = { ...settings.ampEnv, [param]: newValue };
      sampleSettingsRef.current.set(sampleId, settings);

      forceRender();
    },
    []
  );

  const updateVolumeParam = useCallback(
    (sampleId: string, param: VolumeParam, newValue: number) => {
      const settings = sampleSettingsRef.current.get(sampleId);
      if (!settings) return;

      settings.volume = { ...settings.volume, [param]: newValue };
      sampleSettingsRef.current.set(sampleId, settings);

      forceRender();
    },
    []
  );

  const updatePitchParam = useCallback(
    (sampleId: string, param: PitchParam, newValue: number) => {
      const settings = sampleSettingsRef.current.get(sampleId);
      if (!settings) return;

      settings.pitch = { ...settings.pitch, [param]: newValue };
      sampleSettingsRef.current.set(sampleId, settings);

      forceRender();
    },
    []
  );

  const updateFilterParam = useCallback(
    (sampleId: string, param: FilterParam, newValue: number) => {
      const settings = sampleSettingsRef.current.get(sampleId);
      if (!settings) return;

      settings.filters = { ...settings.filters, [param]: newValue };
      sampleSettingsRef.current.set(sampleId, settings);

      forceRender();
    },
    []
  );

  const toggleLock = useCallback((sampleId: string, param: LockParam) => {
    const settings = sampleSettingsRef.current.get(sampleId);
    if (!settings) return;

    settings.locks = { ...settings.locks, [param]: !settings.locks[param] };
    sampleSettingsRef.current.set(sampleId, settings);

    forceRender();
  }, []);

  return {
    setSampleSettings: setSampleSettingsForId,
    removeSampleSettings,
    hasSampleSettings,
    getSampleSettings,
    updateTimeParam,
    updateAmpEnvParam,
    updateVolumeParam,
    updatePitchParam,
    updateFilterParam,
    toggleLock,
    getAllSettings,
  };
}
