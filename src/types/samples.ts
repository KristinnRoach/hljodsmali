// src/types/samples.ts

import { FormatKey, AudioFormat, APP_FORMATS } from './mimeTypes';

export type Sample_settings = {
  startPoint: number;
  endPoint: number;
  loopStart: number;
  loopEnd: number;
  attackTime: number;
  releaseTime: number;
  sampleVolume: number;
  loopVolume: number;
  loopLocked: boolean;
  lowCutoff: number;
  highCutoff: number;
};

export type Sample_file = File & {
  type: (typeof APP_FORMATS)[FormatKey];
  name: `${string}${(typeof APP_FORMATS)[FormatKey]['extension']}`;
  size: number;
};

export type SampleRecord = {
  id: string;
  name: string;
  slug: string;
  user?: string | null;
  sample_file: Sample_file; // File | Blob | string; // is this ok?
  bufferDuration?: number;
  created?: string;
  updated?: string;
  // zeroCrossings?: number[]; // REMOVE, ONLY IN SamplerEngine
  sample_settings: Sample_settings;
};

/* 
validate sample settings - type guard ? :
    startPoint: 0.1 > bufferDuration ? 0.1 : 0,
    endPoint: (bufferDuration - 0.2 > 0.1) ? bufferDuration - 0.2 : bufferDuration,
    loopStart: 0.1 > bufferDuration ? 0.1 : 0,
    loopEnd: (bufferDuration - 0.2 > 0.1) ? bufferDuration - 0.2 : bufferDuration,
    
    Do loopStart and loopEnd need to be (or should they be) within startPoint and endPoint ?

    add edge case check for envelope, looping and non-looping, (probly in SingleUseVoice)
    */

export function getDefaultSampleSettings(
  bufferDuration: number,
  existingSettings?: Partial<Sample_settings>
): Sample_settings {
  return {
    ...existingSettings,

    startPoint: 0.1 > bufferDuration ? 0.1 : 0,
    endPoint:
      bufferDuration - 0.2 > 0.1 ? bufferDuration - 0.2 : bufferDuration,
    loopStart: 0.1 > bufferDuration ? 0.1 : 0,
    loopEnd: bufferDuration - 0.2 > 0.1 ? bufferDuration - 0.2 : bufferDuration,
    attackTime: 0.02,
    releaseTime: 0.2,
    sampleVolume: 0.8,
    loopVolume: 0.7,
    loopLocked: false,
    lowCutoff: 40,
    highCutoff: 20000,
  };
}

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
