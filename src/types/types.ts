// src/types/types.ts

import { FormatKey, AudioFormat, APP_FORMATS } from './constants/mimeTypes';

export type Time_settings = {
  startPoint: number;
  endPoint: number;
  loopStart: number;
  loopEnd: number;
};

export type AmpEnv = {
  attackTime: number;
  releaseTime: number;
};

export type Volume_settings = {
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
  loop: boolean;
};

export type Sample_settings = {
  time: Time_settings;
  volume: Volume_settings;
  ampEnv: AmpEnv;
  pitch: Pitch_settings;
  filters: Filter_settings;
  locks: Lock_settings;
};

export type SettingsType = keyof Sample_settings;

export type TimeParam = keyof Time_settings;
export type EnvParam = keyof AmpEnv; // | FilterEnv if implemented
export type VolumeParam = keyof Volume_settings;
export type PitchParam = keyof Pitch_settings;
export type FilterParam = keyof Filter_settings;
export type LockParam = keyof Lock_settings;

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

// ____________________________ VOICE _____________________________________________

export type Voice = {
  connect: (destination: AudioNode) => void;
  start: (midiNoteValue: number) => void;
  stop: () => void;
  triggerAttack: () => void;
  triggerRelease: () => void;
  updateLoopPoints: (
    param: keyof Time_settings,
    newValue: number,
    prevSettings: Time_settings
  ) => void;
  updateTuning: (
    newPitchSettings: Pitch_settings,
    prevPitchSettings: Pitch_settings
  ) => void;
  toggleLoop: () => void;

  sampleId: string;
  volume: number;
  startPoint: number;
  endPoint: number;
  loopStart: number;
  loopEnd: number;
  loop: boolean;
  hold: boolean;
};

// ________________________________ TYPE GUARDS ______________________________________

export function isTimeSettings(settings: any): settings is Time_settings {
  return (
    'startPoint' in settings &&
    'endPoint' in settings &&
    'loopStart' in settings &&
    'loopEnd' in settings
  );
}

export function isAmpEnvelopeSettings(settings: any): settings is AmpEnv {
  return 'attackTime' in settings && 'releaseTime' in settings;
}

export function isVolumeSettings(settings: any): settings is Volume_settings {
  return 'sampleVolume' in settings && 'loopVolume' in settings;
}

export function isPitchSettings(settings: any): settings is Pitch_settings {
  return 'transposition' in settings && 'tuneOffset' in settings;
}

export function isFilterSettings(settings: any): settings is Filter_settings {
  return 'lowCutoff' in settings && 'highCutoff' in settings;
}

export function isLockSettings(settings: any): settings is Lock_settings {
  return 'loop' in settings;
}

export function isSampleSettings(settings: any): settings is Sample_settings {
  return (
    isTimeSettings(settings.time) &&
    isAmpEnvelopeSettings(settings.amp_env) &&
    isVolumeSettings(settings.volume) &&
    isPitchSettings(settings.pitch) &&
    isFilterSettings(settings.filters) &&
    isLockSettings(settings.locks)
  );
}

export function isSampleRecord(record: any): record is SampleRecord {
  return (
    'id' in record &&
    'name' in record &&
    'slug' in record &&
    'sample_file' in record &&
    'sample_settings' in record
  );
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
