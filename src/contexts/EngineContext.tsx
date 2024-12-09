// src/contexts/SamplerEngineContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';

import { SettingsManager } from '../lib/engine/SettingsManager';
import { LoopHoldManager } from '../lib/engine/LoopHoldManager';
import { SingleUseVoice } from '../lib/engine/SingleUseVoice';
import {
  findZeroCrossings,
  snapToNearestZeroCrossing,
} from '../lib/audio-utils/zeroCrossingUtils';
import {
  SampleNodes,
  SampleRecord,
  Sample_settings,
  Time_settings,
  Pitch_settings,
  Volume_settings,
  Filter_settings,
  //   FormatKey,
} from '../types/samples';

import * as auCtxUtils from '../lib/audio-utils/audioCtx-utils';
import * as auNodeUtils from '../lib/audio-utils/node-utils';

interface SamplerEngineContextValue {
  audioCtx: AudioContext | null;
  connectToExternalOutput: (destination: AudioNode) => void;
  disconnectExternalOutput: (destination: AudioNode) => void;
  loadSample: (record: SampleRecord, buffer: AudioBuffer) => void;
  unloadSample: (id: string) => void;
  setSampleVolume: (sampleId: string, volume: number) => void;
  selectForPlayback: (id: string, replaceOrAdd?: 'replace' | 'add') => void;
  deselectForPlayback: (id: string) => void;
  selectForSettings: (id: string, replaceOrAdd?: 'replace' | 'add') => void;
  deselectForSettings: (id: string) => void;
  selectedForPlayback: string[];
  selectedForSettings: string[];
  getSelectedBuffers: (
    playbackOrSettings: 'playback' | 'settings'
  ) => AudioBuffer[];
  getBufferDuration: (id: string) => number;
  getSampleSettings: (
    id: string,
    type?: 'Time' | 'Volume' | 'Pitch' | 'Filter' | 'Lock' | 'All'
  ) => any;
  updateTimeSettings: (id: string, settings: Partial<Time_settings>) => void;
  updatePitchSettings: (id: string, settings: Partial<Pitch_settings>) => void;
  updateEnvelopeSettings: (
    id: string,
    settings: Partial<Volume_settings>
  ) => void;
  updateFilterSettings: (
    id: string,
    settings: Partial<Filter_settings>
  ) => void;
  playNote: (midiNote: number) => void;
  releaseNote: (midiNote: number) => void;
  stopAllVoices: () => void;
  setMasterVolume: (volume: number) => void;
  getMasterVolume: () => number;
  toggleLoop: () => boolean;
  isLooping: () => boolean;
  toggleHold: () => boolean;
  isHolding: () => boolean;
  isPlaying: () => boolean;
  getCurrentPlayheadPosition: () => number;
}

const SamplerEngineContext = createContext<SamplerEngineContextValue | null>(
  null
);

const SamplerProvider = ({ children }: { children: React.ReactNode }) => {
  const settingsManager = useMemo(() => SettingsManager.getInstance(), []);
  const globalAudioState = useMemo(() => LoopHoldManager.getInstance(), []);

  // const sampleIdsRef = useRef<Set<string>>(new Set());
  const externalOutputs = useRef<Set<AudioNode>>(new Set());
  const masterGainRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const sampleNodesRef = useRef<Map<string, SampleNodes>>(new Map());

  /* State */
  const [audioCtx] = useState(window ? new window.AudioContext() : null);

  useEffect(() => {
    if (!audioCtx || !(audioCtx.state === 'suspended')) return;
    audioCtx.resume().catch(console.error);
  }, [audioCtx]);

  const { createGainNode, createBiquadFilter, connectNodeToAudioCtx } =
    auCtxUtils;

  // const selectedRef = useRef<Map<string, string>>(new Map());

  const selectedForPlaybackRef = useRef<string[]>([]);
  const [selectedForPlayback, setSelectedForPlayback] = useState<string[]>([]);
  const [selectedForSettings, setSelectedForSettings] = useState<string[]>([]);

  const initMasterGain = () => {
    if (masterGainRef.current) return;

    try {
      const gain = createGainNode(audioCtx, 0.8);
      if (!gain) throw new Error('Failed to create gain node');

      masterGainRef.current = gain;
      connectNodeToAudioCtx(masterGainRef.current, audioCtx);
      // setIsEngineReady(true);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  // Initialize masterGain when audioCtx is ready
  useEffect(() => {
    initMasterGain();
    // return () => { // cleanup necessary?
    //   sampleNodesRef.current.forEach((nodes) => {
    //     nodes.sampleGain.disconnect();
    //     nodes.lowCut.disconnect();
    //     nodes.highCut.disconnect();
    //   });
    //   sampleNodesRef.current.clear();
    //   buffersRef.current.clear();
    //   if (masterGainRef.current) {
    //     masterGainRef.current.disconnect();
    //     masterGainRef.current = null;
    //   }
    //   externalOutputs.current.clear();
    //   setIsEngineReady(false);
    // };
  }, [audioCtx]);

  /* EXTERNAL OUTPUTS */

  const connectToExternalOutput = useCallback(
    (destination: AudioNode) => {
      if (!audioCtx || !masterGainRef.current) {
        console.warn(
          'Audio context or master gain not ready in connectToExternalOutput'
        );
        return;
      }

      if (!externalOutputs.current.has(destination)) {
        masterGainRef.current.connect(destination);
        externalOutputs.current.add(destination);
      }
    },
    [audioCtx]
  );

  const disconnectExternalOutput = useCallback(
    (destination: AudioNode) => {
      if (!audioCtx || !masterGainRef.current) {
        console.warn(
          'Audio context or master gain not ready in disconnectExternalOutput'
        );
        return;
      }

      if (externalOutputs.current.has(destination)) {
        masterGainRef.current.disconnect(destination);
        externalOutputs.current.delete(destination);
      }
    },
    [audioCtx]
  );

  const loadSample = (record: SampleRecord, buffer: AudioBuffer) => {
    if (!audioCtx) {
      console.error('Audio context not ready in loadSample');
      return;
    }

    const { id, sample_settings } = record;
    const zeroCrossings = findZeroCrossings(buffer);

    console.log('Loading sample settings:', id, sample_settings);

    settingsManager.setSampleSettings(id, sample_settings);
    settingsManager.setZeroCrossings(id, zeroCrossings);

    try {
      const sampleGain = createGainNode(
        audioCtx,
        sample_settings.volume.sampleVolume
      );
      const lowCut = createBiquadFilter(
        audioCtx,
        'highpass',
        sample_settings.filters.lowCutoff
      );
      const highCut = createBiquadFilter(
        audioCtx,
        'lowpass',
        sample_settings.filters.highCutoff
      );

      if (!masterGainRef.current || !sampleGain || !lowCut || !highCut) {
        throw new Error('Failed to create audio nodes');
      }

      auNodeUtils.connectNodeChain([
        sampleGain,
        lowCut,
        highCut,
        masterGainRef.current,
      ]);

      // auCtxUtils.connectNodeToAudioCtx(masterGainRef.current, audioCtx);

      if (!masterGainRef.current || !sampleGain || !lowCut || !highCut) {
        console.error('Node not created');
        return;
      }

      const sampleNodes = { sampleGain, lowCut, highCut };

      // sampleIdsRef.current.add(id);
      buffersRef.current.set(id, buffer);
      sampleNodesRef.current.set(id, sampleNodes);

      console.log('Loaded sample:', id);
    } catch (error) {
      console.error('Error loading sample:', error);
    }
  };

  const unloadSample = useCallback(
    (id: string) => {
      settingsManager.removeSampleSettings(id);
      settingsManager.removeZeroCrossings(id);

      buffersRef.current.delete(id);
      sampleNodesRef.current.delete(id);
      // sampleIdsRef.current.delete(id);

      console.log('Unloaded sample:', id);
    },
    [settingsManager]
  );

  const selectForPlayback = useCallback(
    (id: string, replaceOrAdd: 'replace' | 'add' = 'replace') => {
      console.log('selectForPlayback called with:', id, replaceOrAdd);

      setSelectedForPlayback((prev) => {
        const newSelected = replaceOrAdd === 'replace' ? [id] : [...prev, id];
        selectedForPlaybackRef.current = newSelected;
        return newSelected;
      });
    },
    []
  );

  const deselectForPlayback = useCallback((id: string) => {
    setSelectedForPlayback((prev) =>
      prev.filter((sampleId) => sampleId !== id)
    );
  }, []);

  const selectForSettings = (
    id: string,
    replaceOrAdd: 'replace' | 'add' = 'replace'
  ) => {
    setSelectedForSettings((prev) =>
      replaceOrAdd === 'replace' ? [id] : [...prev, id]
    );
  };

  const deselectForSettings = useCallback((id: string) => {
    setSelectedForSettings((prev) =>
      prev.filter((sampleId) => sampleId !== id)
    );
  }, []);

  const getSelectedBuffers = (playbackOrSettings: 'playback' | 'settings') => {
    const selectedIds =
      playbackOrSettings === 'playback'
        ? selectedForPlayback
        : selectedForSettings;

    const selectedBuffers: AudioBuffer[] = [];
    selectedIds.forEach((id) => {
      const buffer = buffersRef.current.get(id);
      if (buffer) selectedBuffers.push(buffer);
    });
    return selectedBuffers;
  };

  const getBufferDuration = (id: string) => {
    const buffer = buffersRef.current.get(id);
    return buffer ? buffer.duration : 0;
  };

  const getSampleSettings = (
    id: string,
    type: 'Time' | 'Volume' | 'Pitch' | 'Filter' | 'Lock' | 'All' = 'All'
  ) => {
    const settings = settingsManager.getSampleSettings(id);

    if (!settings) {
      console.error(`Sample ${id} not loaded`);
      return null;
    }

    switch (type) {
      case 'Time':
        return settings.time;
      case 'Volume':
        return settings.volume;
      case 'Pitch':
        return settings.pitch;
      case 'Filter':
        return settings.filters;
      case 'Lock':
        return settings.locks;
      case 'All':
      default:
        return settings;
    }
  };

  const updateTimeSettings = useCallback(
    (id: string, settings: Partial<Time_settings>) => {
      if (
        !(selectedForSettings.length === 1 && selectedForSettings[0] === id)
      ) {
        console.warn('Invalid sample selection for updating time settings');
        return;
      }

      const currentSettings = settingsManager.getSampleSettings(id);
      if (!currentSettings) return;

      let updated = settingsManager.updateTimeSettings(id, settings);

      // const updatedSettings = { ...currentSettings.time, ...settings };
      // settingsManager.updateSampleSettings(id, { time: updatedSettings });

      // console.log('Updated time settings:', id, updatedSettings);
    },
    [settingsManager, selectedForSettings]
  );

  const updateEnvelopeSettings = useCallback(
    (id: string, settings: Partial<Volume_settings>) => {
      if (
        !(selectedForSettings.length === 1 && selectedForSettings[0] === id)
      ) {
        console.log(
          'SELECTED FOR SETTINGS: ',
          selectedForSettings[0],
          'ID: ',
          id
        );
        console.warn('Invalid sample selection for updating envelope settings');
        return;
      }

      const currentSettings = settingsManager.getSampleSettings(id);
      if (!currentSettings) return;

      const updatedSettings = { ...currentSettings.volume, ...settings };
      settingsManager.updateSampleSettings(id, { volume: updatedSettings });
    },
    [settingsManager, selectedForSettings]
  );

  const updatePitchSettings = useCallback(
    (id: string, settings: Partial<Pitch_settings>) => {
      if (
        !(selectedForSettings.length === 1 && selectedForSettings[0] === id)
      ) {
        throw new Error('Invalid sample selection for updating pitch settings');
      }

      const currentSettings = settingsManager.getSampleSettings(id);
      if (!currentSettings) throw new Error('Sample not loaded');

      const updatedSettings = { ...currentSettings.pitch, ...settings };
      settingsManager.updateSampleSettings(id, { pitch: updatedSettings });

      console.log('Updated pitch settings:', id, updatedSettings);
    },
    [settingsManager, selectedForSettings]
  );

  const updateFilterSettings = (
    id: string,
    settings: Partial<Filter_settings>
  ) => {
    if (!(selectedForSettings.length === 1 && selectedForSettings[0] === id)) {
      throw new Error('Invalid sample selection for updating filter settings');
    }

    const currentSettings = settingsManager.getSampleSettings(id);
    if (!currentSettings) throw new Error('Sample not loaded');

    const updatedSettings = { ...currentSettings.filters, ...settings };
    settingsManager.updateSampleSettings(id, { filters: updatedSettings });

    // console.log('Updated filter settings:', id, updatedSettings);
  };

  const setSampleVolume = useCallback(
    async (sampleId: string, volume: number) => {
      if (!volume || volume < 0 || volume > 1) {
        throw new Error('Invalid volume value');
      }

      if (!audioCtx) {
        console.error('Audio context not ready in setSampleVolume');
        return;
      }

      const sampleNodes = sampleNodesRef.current.get(sampleId);
      const settings = settingsManager.getSampleSettings(sampleId);

      if (!sampleNodes || !settings) throw new Error('Sample not loaded');

      sampleNodes.sampleGain.gain.setTargetAtTime(
        volume,
        audioCtx.currentTime,
        0.1
      );
      settings.volume.sampleVolume = volume;

      settingsManager.updateSampleSettings(sampleId, {
        volume: settings.volume,
      });

      console.log('Updated sample volume:', sampleId, volume);
    },
    [audioCtx, settingsManager]
  );

  const playNote = (midiNote: number) => {
    if (audioCtx.state !== 'running') {
      audioCtx
        .resume()
        .then(() => playNote(midiNote))
        .catch(console.error);
      return;
    }

    selectedForPlaybackRef.current.forEach((id) => {
      const buffer = buffersRef.current.get(id);
      const sampleNodes = sampleNodesRef.current.get(id);

      if (buffer && sampleNodes) {
        const voice = new SingleUseVoice(audioCtx, buffer, id);
        voice.getVoiceGain().connect(sampleNodes.sampleGain);
        voice.start(midiNote);
      }
    });
  };
  //   [audioCtx] // , selectedForPlayback]
  // );

  const releaseNote = useCallback((midiNote: number) => {
    SingleUseVoice.releaseNote(midiNote);
  }, []);

  const stopAllVoices = useCallback(() => {
    SingleUseVoice.panic();
  }, []);

  const toggleLoop = useCallback((): boolean => {
    return globalAudioState.toggleLoop();
  }, [globalAudioState]);

  const isLooping = useCallback(() => {
    return globalAudioState.globalLoop;
  }, [globalAudioState]);

  const toggleHold = useCallback((): boolean => {
    return globalAudioState.toggleHold();
  }, [globalAudioState]);

  const isHolding = useCallback(() => {
    return globalAudioState.hold;
  }, [globalAudioState]);

  const isPlaying = useCallback(() => {
    return SingleUseVoice.isPlaying();
  }, []);

  const getCurrentPlayheadPosition = useCallback(() => {
    return SingleUseVoice.getCurrentPlayheadPosition();
  }, []);

  const setMasterVolume = useCallback(
    async (volume: number) => {
      if (!audioCtx || !masterGainRef.current) {
        console.error(
          'Audio context or master gain not ready in setMasterVolume'
        );
        return;
      }
      masterGainRef.current.gain.setTargetAtTime(
        volume,
        audioCtx.currentTime + 0.01,
        0.5
      );
    },
    [audioCtx]
  );

  const getMasterVolume = useCallback(() => {
    return masterGainRef.current ? masterGainRef.current.gain.value : 0;
  }, []);

  // const contextValue = useMemo(
  //   () => ({

  const contextValue = {
    audioCtx,
    connectToExternalOutput,
    disconnectExternalOutput,
    loadSample,
    unloadSample,
    setSampleVolume,
    selectForPlayback,
    deselectForPlayback,
    selectForSettings,
    deselectForSettings,
    selectedForPlayback,
    selectedForSettings,
    getSelectedBuffers,
    getBufferDuration,
    getSampleSettings,
    updateTimeSettings,
    updatePitchSettings,
    updateEnvelopeSettings,
    updateFilterSettings,
    playNote,
    releaseNote,
    stopAllVoices,
    setMasterVolume,
    getMasterVolume,
    toggleLoop,
    isLooping,
    toggleHold,
    isHolding,
    isPlaying,
    getCurrentPlayheadPosition,
  };

  return (
    <SamplerEngineContext.Provider value={contextValue}>
      {children}
    </SamplerEngineContext.Provider>
  );
};

export default SamplerProvider;

export const useSamplerEngine = () => {
  const context = useContext(SamplerEngineContext);
  if (!context) {
    throw new Error(
      'useSamplerEngine must be used within a SamplerEngineProvider'
    );
  }
  return context;
};

// useEffect(() => {
//   const initAudio = async () => {
//     if (!audioCtx) {
//       const newAudioCtx = auCtxUtils.initializeAudioContext();
//       if (newAudioCtx) {
//         // setAudioCtx(newAudioCtx);
//         await newAudioCtx.resume();
//       } else {
//         console.error('Failed to initialize audio context');
//         return;
//       }
//     }
//   };

//   initAudio();
// }, [audioCtx]);

// useEffect(() => {
//   if (audioCtx) {
//     setIsAudioContextReady(true);
//     return;
//   }

//   const newAudioCtx = auCtxUtils.initializeAudioContext();

//   if (newAudioCtx) {
//     setAudioCtx(newAudioCtx);
//     setIsAudioContextReady(true);
//   } else {
//     console.error('Failed to initialize audio context');
//   }
// }, []);

// // Usage in App:
// // src/pages/_app.tsx
// import type { AppProps } from 'next/app';
// import { SamplerEngineProvider } from '../contexts/SamplerEngineContext';

// function MyApp({ Component, pageProps }: AppProps) {
//   return (
//     <SamplerEngineProvider>
//       <Component {...pageProps} />
//     </SamplerEngineProvider>
//   );
// }

// export default MyApp;

// // Usage in components:
// // src/components/SamplePlayer.tsx
// import React from 'react';
// import { useSamplerEngine } from '../contexts/SamplerEngineContext';

// export const SamplePlayer: React.FC = () => {
//   const { playNote, releaseNote, getSelectedForPlayback } = useSamplerEngine();

//   // Component logic...
// };

// const { audioCtx, isAudioReady } = useReactAudioCtx();
//   const { createGainNode, createBufferSource } = useAudioCtxUtils();

// const selectedForPlaybackRef = useRef<Set<string>>(new Set());
// const selectedForSettingsRef = useRef<Set<string>>(new Set());
// const zeroCrossingsRef = useRef<Map<string, number[]>>(new Map());
// const sampleSettingsRef = useRef<Map<string, Sample_settings>>(new Map());
