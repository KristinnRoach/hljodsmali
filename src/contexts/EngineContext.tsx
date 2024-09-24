// src/contexts/SamplerEngineContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';

import createSingleUseVoice from '../hooks/createSingleUseVoice';
import * as VoiceUtils from './voiceUtils';

import useSampleSettings from '../hooks/useSampleSettings';
import useLoopHold from '../hooks/useLoopHold';
import useZeroCrossings from '../hooks/useZeroCrossings';

import {
  SampleNodes,
  SampleRecord,
  Sample_settings,
  Time_settings,
  Pitch_settings,
  AmpEnv,
  Filter_settings,
  Lock_settings,
  SettingsType,
  isTimeSettings,
  Volume_settings,
  Voice,
} from '../types/types';

import * as auCtxUtils from '../lib/audio-utils/audioCtx-utils';
import * as auNodeUtils from '../lib/audio-utils/node-utils';

interface SamplerEngineContextValue {
  audioCtx: AudioContext | null;
  connectToExternalOutput: (destination: AudioNode) => void;
  disconnectExternalOutput: (destination: AudioNode) => void;
  loadSample: (record: SampleRecord, buffer: AudioBuffer) => void;
  unloadSample: (id: string) => void;

  selectedSamples: Map<string, Sample_settings>;
  focusedSettings: Map<string, Sample_settings>;
  selectSample: (id: string, replaceOrAdd?: 'replace' | 'add') => void;
  selectFocusedSettings: (id: string, replaceOrAdd?: 'replace' | 'add') => void;

  getSelectedBuffers: (
    playbackOrSettings: 'playback' | 'settings'
  ) => AudioBuffer[];
  getBufferDuration: (id: string) => number;

  getSampleSettings: (
    id: string,
    type?: keyof Sample_settings
  ) => Sample_settings | Sample_settings[keyof Sample_settings] | null;

  setSampleVolume: (sampleId: string, volume: number) => void;

  updateTimeParam: (
    param: keyof Time_settings,
    newValue: number,
    sampleId?: string
  ) => void;
  updatePitchParam: (
    param: keyof Pitch_settings,
    newValue: number,
    sampleId?: string
  ) => void;
  updateAmpEnvParam: (
    param: keyof AmpEnv,
    newValue: number,
    sampleId?: string
  ) => void;
  updateFilterParam: (
    param: keyof Filter_settings,
    newValue: number,
    sampleId?: string
  ) => void;
  updateToggleLock: (param: keyof Lock_settings, sampleId?: string) => void;

  setMasterVolume: (volume: number) => void;
  getMasterVolume: () => number;
  toggleLoop: () => boolean;
  isLooping: () => boolean;
  toggleHold: () => boolean;
  isHolding: () => boolean;
  isPlaying: () => boolean;

  playNote: (midiNote: number) => void;

  // Voice-related methods // TODO: should there be a separate context for voices? pros and cons?
  addVoice: (voice: Voice) => void;
  removeVoice: (voice: Voice) => void;
  getVoicesForSample: (sampleId: string) => Voice[];
  releaseNote: (midiNote: number) => void;
  hasPlayingVoices: () => boolean;
  numberOfPlayingVoices: () => number;
  getCurrentPlayheadPosition: () => number;
  releaseAllVoices: () => void;
  stopAllVoices: () => void;
  // updateLoopPoints
  // updateTuning
}

const SamplerEngineContext = createContext<SamplerEngineContextValue | null>(
  null
);

const SamplerProvider = ({ children }: { children: React.ReactNode }) => {
  const settingsManager = useSampleSettings();
  const loopHoldManager = useLoopHold();
  const zeroCrossingManager = useZeroCrossings();

  const { createGainNode, createBiquadFilter, connectNodeToAudioCtx } =
    auCtxUtils;

  const externalOutputsRef = useRef<Set<AudioNode>>(new Set());
  const masterGainRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const sampleNodesRef = useRef<Map<string, SampleNodes>>(new Map());

  /* State */
  const [audioCtx] = useState(window ? new window.AudioContext() : null);

  const [voices, setVoices] = useState<Voice[]>([]);

  const selectedSamplesRef = useRef<Map<string, Sample_settings>>(new Map());
  const focusedSettingsRef = useRef<Map<string, Sample_settings>>(new Map());
  // dummy state for sample selection updates
  const [selectionUpdated, setSelectionUpdated] = useState(0);

  useEffect(() => {
    if (!audioCtx || !(audioCtx.state === 'suspended')) return;
    audioCtx.resume().catch(console.error);
  }, [audioCtx]);

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
    if (audioCtx && audioCtx.state === 'running') initMasterGain();
    // return () => { // todo: possibly clean up audio context / nodes here
  }, [audioCtx]);

  useEffect(() => {
    console.log('All settings:', settingsManager.getAllSettings());
  }, [settingsManager]);

  /* VOICE METHODS - (move?) */
  const addVoice = useCallback((voice: Voice) => {
    setVoices((prevVoices) => [...prevVoices, voice]);
  }, []);

  const removeVoice = useCallback((voice: Voice) => {
    setVoices((prevVoices) => prevVoices.filter((v) => v !== voice));
  }, []);

  const getVoicesForSample = useCallback(
    (sampleId: string) => {
      return VoiceUtils.getVoicesForSample(voices, sampleId);
    },
    [voices]
  );

  const releaseNote = useCallback(
    (midiNote: number) => {
      VoiceUtils.releaseNote(voices, midiNote, loopHoldManager.isHolding);
    },
    [voices, loopHoldManager]
  );

  const hasPlayingVoices = useCallback(() => {
    return VoiceUtils.hasPlayingVoices(voices);
  }, [voices]);

  const numberOfPlayingVoices = useCallback(() => {
    return VoiceUtils.numberOfPlayingVoices(voices);
  }, [voices]);

  const getCurrentPlayheadPosition = useCallback(() => {
    return VoiceUtils.getCurrentPlayheadPosition(voices);
  }, [voices]);

  const releaseAllVoices = useCallback(() => {
    VoiceUtils.releaseAllVoices(voices);
    setVoices([]);
  }, [voices]);

  const stopAllVoices = useCallback(() => {
    VoiceUtils.stopAllVoices(voices);
    setVoices([]);
  }, [voices]);

  /* EXTERNAL OUTPUTS */

  const connectToExternalOutput = useCallback(
    (destination: AudioNode) => {
      if (!audioCtx || !masterGainRef.current) {
        console.warn(
          'Audio context or master gain not ready in connectToExternalOutput'
        );
        return;
      }

      if (!externalOutputsRef.current.has(destination)) {
        masterGainRef.current.connect(destination);
        externalOutputsRef.current.add(destination);
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

      if (externalOutputsRef.current.has(destination)) {
        masterGainRef.current.disconnect(destination);
        externalOutputsRef.current.delete(destination);
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
    console.log('Loading sample settings:', id, sample_settings.time);

    const zeroCrossings = zeroCrossingManager.findZeroCrossings(buffer);
    zeroCrossingManager.setZeroCrossings(id, zeroCrossings);
    settingsManager.setSampleSettings(id, sample_settings);

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

      if (!masterGainRef.current || !sampleGain || !lowCut || !highCut) {
        console.error('Node not created');
        return;
      }

      const sampleNodes = { sampleGain, lowCut, highCut };

      buffersRef.current.set(id, buffer);
      sampleNodesRef.current.set(id, sampleNodes);
    } catch (error) {
      console.error(`Error loading sample, id: ${id}`, error);
    }

    console.log(`Sample loaded: ${id}`, {
      buffer: buffersRef.current.get(id),
      nodes: sampleNodesRef.current.get(id),
    });
  };

  const unloadSample = useCallback(
    (id: string) => {
      settingsManager.removeSampleSettings(id);
      zeroCrossingManager.removeZeroCrossings(id);

      buffersRef.current.delete(id);
      sampleNodesRef.current.delete(id);
      // sampleIdsRef.current.delete(id);

      console.log('Unloaded sample:', id);
    },
    [settingsManager]
  );

  const updateMap = (
    mapRef: React.MutableRefObject<Map<string, Sample_settings>>,
    id: string,
    replaceOrAdd: 'replace' | 'add' = 'add'
  ) => {
    const settings = settingsManager.getSampleSettings(id) as Sample_settings;
    if (!settings) {
      console.error(`Settings not found for id: ${id}`);
      return false;
    }

    if (replaceOrAdd === 'replace') {
      mapRef.current.clear();
    }

    mapRef.current.set(id, settings);
    return true;
  };

  const selectSample = useCallback(
    (id: string, replaceOrAdd: 'replace' | 'add' = 'replace') => {
      if (updateMap(selectedSamplesRef, id, replaceOrAdd)) {
        setSelectionUpdated((prev) => prev + 1);
      }
    },
    [settingsManager]
  );

  const selectFocusedSettings = useCallback(
    (sampleId: string, replaceOrAdd: 'replace' | 'add' = 'add') => {
      if (updateMap(focusedSettingsRef, sampleId, replaceOrAdd)) {
        setSelectionUpdated((prev) => prev + 1);
      }
    },
    [settingsManager]
  );

  const deselectForPlayback = useCallback((id: string) => {
    selectedSamplesRef.current.delete(id);
  }, []);

  useEffect(() => {
    console.log(
      'sample selection updated:',
      selectedSamplesRef.current,
      focusedSettingsRef.current
    );
  }, [selectionUpdated]);

  const getSelectedBuffers = (playbackOrSettings: 'playback' | 'settings') => {
    const selectedIds =
      playbackOrSettings === 'playback'
        ? Array.from(selectedSamplesRef.current.keys())
        : Array.from(focusedSettingsRef.current.keys());

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

  // _________________ SAMPLE SETTINGS HANDLERS ____________________________

  const getSampleSettings = useCallback(
    (
      id: string,
      type?: keyof Sample_settings
    ): Sample_settings | Sample_settings[keyof Sample_settings] | null => {
      if (!settingsManager) return null;

      const settings = settingsManager.getSampleSettings(id, type);

      if (!settings) {
        console.error(`Sample ${id} not loaded`);
        return null;
      }

      return type ? settings[type] : settings;
    },
    [settingsManager]
  );

  const setSampleVolume = useCallback(
    async (sampleId: string, volume: number) => {
      //     if (!volume || volume < 0 || volume > 1) {
      //       throw new Error('Invalid volume value');
      //     }
      //     if (!audioCtx) {
      //       console.error('Audio context not ready in setSampleVolume');
      //       return;
      //     }
      //     const sampleNodes = sampleNodesRef.current.get(sampleId);
      //     const settings = settingsManager.getSampleSettings(sampleId);
      //     if (!sampleNodes || !settings) throw new Error('Sample not loaded');
      //     sampleNodes.sampleGain.gain.setTargetAtTime(
      //       volume,
      //       audioCtx.currentTime,
      //       0.1
      //     );
      //     settings.volume.sampleVolume = volume;
      //     settingsManager.updateSampleSettings(sampleId, {
      //       volume: settings.volume,
      //     });
      //     console.log('Updated sample volume:', sampleId, volume);
    },
    [audioCtx, settingsManager]
  );

  const updateTimeParam = useCallback(
    (param: keyof Time_settings, newValue: number) => {
      const sampleId = focusedSettingsRef.current.keys().next().value; // get first key // move to useSampleSettings
      const settings = focusedSettingsRef.current.get(sampleId);
      const prevSettings = settings.time as Time_settings;
      if (!sampleId || !settings || !prevSettings) return;

      // TODO: startPoint <= loopStart < loopEnd <= endPoint

      // first update currently active voices for the selectedForSettings sample if needed
      if (param === 'loopStart' || param === 'loopEnd') {
        // || ef param er
        const activeVoices = voices.filter(
          (voice) => voice.sampleId === sampleId
        );

        activeVoices.forEach((voice) => {
          voice.updateLoopPoints(param, newValue, prevSettings);
        });
      }
      // update sample settings for subsequently created voices
      settingsManager.updateTimeParam(sampleId, param, newValue);
    },
    [settingsManager, selectionUpdated]
  );

  const updatePitchParam = useCallback(
    (param: keyof Pitch_settings, newValue: number) => {
      const sampleId = focusedSettingsRef.current.keys().next().value; // get first key // move to useSampleSettings
      if (!sampleId) return;

      // first update currently active voices for the selectedForSettings sample if needed
      if (voices && voices.length > 0) {
        const prevPichSettings = settingsManager.getSampleSettings(
          sampleId,
          'pitch'
        ) as Pitch_settings;

        let newPitchSettings = {
          ...prevPichSettings,
          [param]: newValue,
        } as Pitch_settings;

        const activeVoices = voices.filter(
          (voice) => voice.sampleId === sampleId
        );

        activeVoices.forEach((voice) => {
          voice.updateTuning(newPitchSettings, prevPichSettings);
        });
      }

      settingsManager.updatePitchParam(sampleId, param, newValue);
    },
    [settingsManager, selectionUpdated]
  );

  const updateAmpEnvParam = useCallback(
    (param: keyof AmpEnv, newValue: number) => {
      const sampleId = focusedSettingsRef.current.keys().next().value; // get first key // move to useSampleSettings
      if (!sampleId) return;

      settingsManager.updateAmpEnvParam(sampleId, param, newValue);
    },
    [settingsManager, selectionUpdated]
  );

  // export function updateActiveVoicesPitchSettings(
  //   voices: Voice[],
  //   sampleId: string,
  //   transposition: number,
  //   tuneOffset: number
  // ): void {
  //   voices.forEach((voice) => {
  //     if (voice.getSampleId() === sampleId) {
  //       voice.updatePitchSettings(transposition, tuneOffset);
  //     }
  //   });
  // }

  const updateFilterParam = useCallback(
    (param: keyof Filter_settings, newValue: number) => {
      const sampleId = focusedSettingsRef.current.keys().next().value; // get first key // move to useSampleSettings
      if (!sampleId) return;

      settingsManager.updateFilterParam(sampleId, param, newValue);
    },
    [settingsManager, selectionUpdated]
  );

  const updateToggleLock = useCallback(
    (param: keyof Lock_settings) => {
      const sampleId = focusedSettingsRef.current.keys().next().value; // get first key // move to useSampleSettings
      if (!sampleId) return;

      settingsManager.toggleLock(sampleId, param);
    },
    [settingsManager, selectionUpdated]
  );

  // _________________ PLAYBACK HANDLERS ____________________________

  const playNote = useCallback(
    (midiNote: number) => {
      if (audioCtx.state !== 'running') {
        audioCtx
          .resume()
          .then(() => playNote(midiNote))
          .catch(console.error);
        return;
      }

      console.log('selectedSamplesRef.current:', selectedSamplesRef.current);

      selectedSamplesRef.current.forEach(
        (settings: Sample_settings, id: string) => {
          console.log('playNote:', id, settings);

          const buffer = buffersRef.current.get(id);
          const sampleNodes = sampleNodesRef.current.get(id);
          if (buffer && sampleNodes && settings) {
            const voice = createSingleUseVoice(
              audioCtx,
              buffer,
              id,
              settings,
              loopHoldManager.isLooping, // Todo: FIX
              loopHoldManager.isHolding // Todo: FIX
            );

            voice.connect(sampleNodes.sampleGain);
            setVoices((prevVoices) => [...prevVoices, voice]);
            voice.start(midiNote);
          } else {
            console.error(`Buffer or sampleNodes not found for id: ${id}`);
          }
        }
      );
    },
    [
      audioCtx,
      loopHoldManager.isLooping,
      loopHoldManager.isHolding,
      setVoices,
      selectionUpdated,
    ]
  );

  const isPlaying = useCallback(() => {
    return voices.length > 0;
  }, [voices]);

  const toggleLoop = useCallback((): boolean => {
    return loopHoldManager.toggleLoop();
  }, [loopHoldManager]);

  const isLooping = useCallback(() => {
    return loopHoldManager.isLooping;
  }, [loopHoldManager]);

  const toggleHold = useCallback((): boolean => {
    return loopHoldManager.toggleHold();
  }, [loopHoldManager]);

  const isHolding = useCallback(() => {
    return loopHoldManager.isHolding;
  }, [loopHoldManager]);

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

  const contextValue = {
    // useMemo ?
    audioCtx,
    connectToExternalOutput,
    disconnectExternalOutput,
    loadSample,
    unloadSample,

    selectedSamples: selectedSamplesRef.current,
    focusedSettings: focusedSettingsRef.current,
    selectSample,
    selectFocusedSettings,

    getSelectedBuffers,
    getBufferDuration,
    setMasterVolume,
    getMasterVolume,

    toggleLoop,
    isLooping,
    toggleHold,
    isHolding,

    setSampleVolume,
    getSampleSettings,

    updateTimeParam,
    updatePitchParam,
    updateAmpEnvParam,
    updateFilterParam,
    updateToggleLock,

    isPlaying,
    playNote,

    // Voice-related methods
    addVoice,
    removeVoice,
    getVoicesForSample,
    releaseNote,
    hasPlayingVoices,
    numberOfPlayingVoices,
    getCurrentPlayheadPosition,
    releaseAllVoices,
    stopAllVoices,
    // updateActiveVoicesLoopPoints,
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

// const updateActiveVoicesLoopPoints = useCallback(
//   (
//     sampleId: string,
//     newStart: number,
//     newEnd: number,
//     prevStart: number,
//     prevEnd: number
//   ) => {
//     if (!voices || voices.length === 0) return;

//     voices.forEach((voice) => {
//       if (voice.getSampleId() === sampleId) {
//         voice.updateLoopPoints(
//           newStart,
//           newEnd,
//           prevStart, // get prevStart from the voice ?
//           prevEnd
//         );
//       }
//     });
//   },
//   [voices]
// );

// const updateTimeSettings = useCallback(
//   (sampleId: string, paramToUpdate: keyof Time_settings, value: number) => {
//     if (
//       !(
//         selectedForSettings.length === 1 &&
//         selectedForSettings[0] === sampleId
//       )
//     ) {
//       console.warn('Invalid sample selection for updating time settings');
//       return;
//     }

//     const prevSettings = settingsManager.getSampleSettings(
//       sampleId,
//       'time'
//     ) as Time_settings;
//     if (!prevSettings) return;

//     const zeroCrossingManager = ZeroCrossingManager.getInstance();
//     const snappedValue = zeroCrossingManager.snapToZeroCrossing(
//       value,
//       sampleId
//     );

//     const newSettings = { ...prevSettings, [paramToUpdate]: snappedValue };

//     if (paramToUpdate === 'loopStart' || paramToUpdate === 'loopEnd') {
//       const voiceMan = VoiceManager.getInstance();
//       if (voiceMan.hasPlayingVoices()) {
//         voiceMan.getVoicesForSample(sampleId).forEach((voice) => {
//           voice.updateLoopPoints(
//             prevSettings.loopStart,
//             prevSettings.loopEnd,
//             newSettings.loopStart,
//             newSettings.loopEnd
//           );
//         });
//       }
//     }

//     settingsManager.updateSampleParam(sampleId, paramToUpdate, snappedValue);
//   },
//   [settingsManager, selectedForSettings]
// );

// const updateVolumeSettings = useCallback(
//   (sampleId: string, property: keyof Volume_settings, value: number) => {
//     if (
//       !(
//         selectedForSettings.length === 1 &&
//         selectedForSettings[0] === sampleId
//       )
//     ) {
//       console.warn('Invalid sample selection for updating volume settings');
//       return;
//     }

//     settingsManager.updateSampleParam(sampleId, 'volume', {
//       [property]: value,
//     });
//   },
//   [settingsManager, selectedForSettings]
// );

// const updatePitchSettings = useCallback(
//   (sampleId: string, property: keyof Pitch_settings, value: number) => {
//     if (
//       !(
//         selectedForSettings.length === 1 &&
//         selectedForSettings[0] === sampleId
//       )
//     ) {
//       console.warn('Invalid sample selection for updating pitch settings');
//       return;
//     }

//     settingsManager.updateSampleParam(sampleId, 'pitch', {
//       [property]: value,
//     });
//   },
//   [settingsManager, selectedForSettings]
// );

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
