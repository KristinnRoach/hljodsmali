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
};

/* The Sample type should be the same as in the database schema. */

export type Sample_db = {
  id: string;
  name: string;
  slug: string;
  user?: string | null;
  sample_file: File | string; // is this ok?
  bufferDuration: number;
  created: string;
  updated: string;
  sample_settings: Sample_settings;
};

// export type newSample = Omit<Sample_db, 'id' | 'created' | 'updated'>;

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
  };
}

// Moved from engine to sample type file, localize creation of sample_db objects to one place for consistency

export function createNewSampleObject(
  tempId: string,
  name: string,
  blob: Blob,
  duration: number = 0,
  user: string = ''
): Sample_db {
  const file = new File([blob], name + '.webm', { type: 'audio/webm' }); // check for consistency
  const slug = name.toLowerCase().replace(/ /g, '-');

  const defaultSettings = getDefaultSampleSettings(duration);

  const sample: Sample_db = {
    id: tempId,
    name: name,
    slug: slug,
    user: user, // Add user ID
    sample_file: file,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    bufferDuration: duration,
    sample_settings: defaultSettings,
  };
  return sample;
}
