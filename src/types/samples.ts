// src/types/samples.ts

import { FormatKey, AudioFormat, APP_FORMATS } from './constants/mimeTypes';

export type Time_settings = {
  startPoint: number;
  endPoint: number;
  loopStart: number;
  loopEnd: number;
};

export type Volume_settings = {
  attackTime: number;
  releaseTime: number;

  sampleVolume: number;
  loopVolume: number;
};

export type Pitch_settings = {
  transposition: number;
  tuneOffset: number;
};

export type Filter_settings = {
  lowCutoff: number;
  highCutoff: number;

  resonance_low?: number;
  resonance_high?: number;
};

export type Lock_settings = {
  loopLock: boolean;
};

export type Sample_settings = {
  time: Time_settings;
  volume: Volume_settings;
  pitch: Pitch_settings;
  filters: Filter_settings;
  locks: Lock_settings;
};

// Todo: add all params explicitly
export type SettingsParam = {
  param: string;
  value: number | boolean;
};

export type Sample_file = File & {
  type: (typeof APP_FORMATS)[FormatKey];
  name: `${string}${(typeof APP_FORMATS)[FormatKey]['extension']}`;
  size: number;
};

export type SampleNodes = {
  sampleGain: GainNode;
  lowCut: BiquadFilterNode;
  highCut: BiquadFilterNode;
};

export type SampleRecord = {
  id: string;
  name: string;
  slug: string;
  user?: string | null;
  sample_file: Sample_file;
  bufferDuration?: number;
  created?: string;
  updated?: string;
  sample_settings: Sample_settings;
};

export function getDefaultSampleSettings(
  bufferDuration: number,
  initTimeSettings?: Time_settings
): Sample_settings {
  const defaultSettings: Sample_settings = {
    time: {
      startPoint: 0,
      endPoint: bufferDuration,
      loopStart: 0,
      loopEnd: bufferDuration,
    },
    volume: {
      attackTime: 0.02,
      releaseTime: 0.2,
      sampleVolume: 1,
      loopVolume: 0.8,
    },
    pitch: {
      transposition: 0,
      tuneOffset: 0,
    },
    filters: {
      lowCutoff: 40,
      highCutoff: 20000,
    },
    locks: {
      loopLock: false,
    },
  };

  return { ...defaultSettings, ...initTimeSettings };
}

// export type Sample_settings = {
//   transposition: number;
//   tuneOffset: number;
//   startPoint: number;
//   endPoint: number;
//   loopStart: number;
//   loopEnd: number;
//   attackTime: number;
//   releaseTime: number;
//   sampleVolume: number;
//   loopVolume: number;
//   loopLocked: boolean;
//   lowCutoff: number;
//   highCutoff: number;
// };

// export type Sample_settings = Time_settings &
//   Volume_settings &
//   Tuning_settings &
//   Filter_settings &
//   Lock_settings;

// endPoint: bufferDuration, // - 0.5 * bufferDuration, // TEMPFIX! test: 0.1 vs 0.5 vs 0.8 results dont make sense, must be scaled somewhere.  LONGER BUFFER DURATIONS MAKE END MARKERS OUT OF VIEW IN WAVEFORM
// loopStart: 0, // 0.1 > bufferDuration ? 0.1 : 0,
// loopEnd: bufferDuration, // - 0.5 * bufferDuration, // bufferDuration - 0.1 > 0.1 ? bufferDuration - 0.1 : bufferDuration,

/* 
validate sample settings - type guard ? :
    startPoint: 0.1 > bufferDuration ? 0.1 : 0,
    endPoint: (bufferDuration - 0.2 > 0.1) ? bufferDuration - 0.2 : bufferDuration,
    loopStart: 0.1 > bufferDuration ? 0.1 : 0,
    loopEnd: (bufferDuration - 0.2 > 0.1) ? bufferDuration - 0.2 : bufferDuration,
    
    Do loopStart and loopEnd need to be (or should they be) within startPoint and endPoint ?

    add edge case check for envelope, looping and non-looping, (probly in SingleUseVoice)
    */

// Moved from engine to sample type file, localize creation of sample_db objects to one place for consistency

// export function initializeSampleRecord(
//   tempId: string,
//   name: string,
//   blob: Blob,
//   duration: number = 0,
//   user: string = '',
//   audioBuffer?: AudioBuffer
// ): SampleRecord {
//   const file = new File([blob], name + '.webm', { type: 'audio/webm' }); // check for consistency
//   const slug = name.toLowerCase().replace(/ /g, '-');

//   const defaultSettings = getDefaultSampleSettings(duration || audioBuffer?.duration || 0);

//   const sample: SampleRecord = {
//     id: tempId,
//     name: name,
//     slug: slug,
//     user: user, // Add user ID ? remove?
//     sample_file: file,
//     created: new Date().toISOString(), // remove?
//     updated: new Date().toISOString(), // remove?
//     // bufferDuration: duration,
//     // zeroCrossings: zeroCrossings,
//     sample_settings: defaultSettings,
//   };
//   return sample;
// }
