// src/types/sample.ts

import { findZeroCrossings } from '../lib/DSP/zeroCrossingUtils';

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

export type LoadedSample = {
  id: string;
  name: string;
  slug: string;

  buffer: AudioBuffer;
  zeroCrossings: number[];
  sample_settings: Sample_settings;
};

export type Sample_db = {
  id: string;
  name: string;
  slug: string;
  user?: string | null;
  sample_file: File | string;
  bufferDuration: number;
  created: string;
  updated: string;
  zeroCrossings?: number[];
  sample_settings: Sample_settings;
};

// TODO: Move below to sample utils!

export function getDefaultSampleSettings(
  bufferDuration: number
): Sample_settings {
  return {
    startPoint: 0,
    endPoint: bufferDuration,
    loopStart: 0,
    loopEnd: bufferDuration,
    attackTime: 0.02,
    releaseTime: 0.2,
    sampleVolume: 0.8,
    loopVolume: 0.7,
    loopLocked: false,
    lowCutoff: 40,
    highCutoff: 20000,
  };
}

export function createNewSampleObject(
  tempId: string,
  name: string,
  blob: Blob,
  duration: number = 0,
  user: string = '',
  audioBuffer?: AudioBuffer
): Sample_db {
  const file = new File([blob], name + '.webm', { type: 'audio/webm' });
  const slug = name.toLowerCase().replace(/ /g, '-');

  const defaultSettings = getDefaultSampleSettings(duration);

  const zeroCrossings: number[] = audioBuffer
    ? findZeroCrossings(audioBuffer)
    : [];

  const sample: Sample_db = {
    id: tempId,
    name: name,
    slug: slug,
    user: user,
    sample_file: file,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    bufferDuration: duration,
    zeroCrossings: zeroCrossings,
    sample_settings: defaultSettings,
  };
  return sample;
}
