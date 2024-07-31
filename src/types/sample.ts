// src/types/sample.ts

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

export type SampleRecord = {
  id: string;
  name: string;
  slug: string;
  user?: string | null;
  sample_file: File | string; // is this ok?
  bufferDuration?: number; // REMOVE, make a function to get for clarity
  created: string;
  updated: string;
  // zeroCrossings?: number[]; // REMOVE, ONLY IN LOADEDSAMPLE
  sample_settings: Sample_settings;
};

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

// Moved from engine to sample type file, localize creation of sample_db objects to one place for consistency

// export function createNewSampleObject(
//   tempId: string,
//   name: string,
//   blob: Blob,
//   duration: number = 0,
//   user: string = '',
//   audioBuffer?: AudioBuffer
// ): SampleRecord {
//   const file = new File([blob], name + '.webm', { type: 'audio/webm' }); // check for consistency
//   const slug = name.toLowerCase().replace(/ /g, '-');

//   const defaultSettings = getDefaultSampleSettings(duration);

//   // Find zero crossings // óþarfi hér?
//   const zeroCrossings: number[] = audioBuffer
//     ? findZeroCrossings(audioBuffer)
//     : [];

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
