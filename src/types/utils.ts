import { MAX_SAMPLE_FILE_SIZE_FREE } from './constants/constants';
import {
  SUPPORTED_IMPORT_TYPE_ENUM,
  // AUDIO_TYPE_ENUM,
  // AUDIO_TYPE_EXT_ENUM,
} from './constants/enums';
import { APP_FORMATS, AudioFormat, FormatKey } from './constants/mimeTypes';
import { Sample_file, Sample_settings, Time_settings } from './types';

export function getDefaultSampleSettings(
  bufferDuration: number,
  initTimePoints?: Time_settings
): Sample_settings {
  const defaultSettings: Sample_settings = {
    time: {
      startPoint: initTimePoints.startPoint ?? 0,
      endPoint: initTimePoints.endPoint ?? bufferDuration,
      loopStart: initTimePoints.loopStart ?? 0,
      loopEnd: initTimePoints.loopEnd ?? bufferDuration,
    },
    volume: {
      sampleVolume: 1,
      loopVolume: 0.8,
    },
    ampEnv: {
      attackTime: 0.02,
      releaseTime: 0.2,
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
      loop: false,
    },
  };

  return defaultSettings;
}

export async function blobToString(blob: Blob): Promise<string> {
  return await blob.text();
}

export async function stringToBlob(string: string): Promise<Blob> {
  return new Blob([string]);
}

export function blobToSampleFile(
  blob: Blob | File,
  name: string,
  formatKey: FormatKey
): Sample_file | null {
  if (!(blob && blob.size > 0 && blob.type)) {
    console.error('Blob is empty or missing data (type, size)');
    return null;
  }
  console.log('blob type:', blob.type, 'blob size:', blob.size);

  if (!isFileSizeValid(blob)) {
    console.error('File size exceeds maximum allowed size');
    return null;
  }

  const mimeType = APP_FORMATS[formatKey].mimeType;
  const fileExtension = APP_FORMATS[formatKey].extension;

  const fileName =
    name && name.length > 0
      ? `${name}.${fileExtension}`
      : `unnamed_sample_file.${fileExtension}`;

  const sampleFile = new File([blob], fileName, {
    type: mimeType,
  }) as Sample_file;

  return sampleFile;
}

// _____________________ Type guards ________________________________

export function isSampleFile(file: File): file is Sample_file {
  const formatKey = file.type
    .split('/')[1]
    ?.split(';')[0]
    .toUpperCase() as FormatKey;

  return (
    formatKey in APP_FORMATS &&
    file.name.endsWith(APP_FORMATS[formatKey].extension) &&
    isFileSizeValid(file)
  );
}

// if (!(key && key in AUDIO_TYPE_ENUM)) {
//   console.error('Unsupported file type');
//   return null;
// }

// if (!(key && key in AUDIO_TYPE_EXT_ENUM)) {
//   console.error('Unsupported file extension');
//   return null;
// }

// _____________________ File validation ________________________________

/**
 * Validates file size
 * @param file - File or Blob object to validate
 * @param maxSize - Maximum allowed size in bytes
 * @returns boolean indicating if file size is valid
 */
export function isFileSizeValid(
  file: File | Blob,
  maxSize: number = MAX_SAMPLE_FILE_SIZE_FREE
): boolean {
  return file.size <= maxSize;
}

/**
 * Checks if file extension is supported
 * @param fileName - Name of the file
 * DB_SUPPORTED_MIME_TYPES - Array of currently supported extensions
 * @returns boolean indicating if extension is supported
 */
export function isExtensionSupported(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toUpperCase();
  return ext ? ext in SUPPORTED_IMPORT_TYPE_ENUM : false;
}

/**
 * Gets validated file name
 * @param file - File to validate
 * @returns Validated file name or null if invalid
 */
export function getValidatedFileName(file: File): string | null {
  if (!file.name || !file.type) return null;

  const nameParts = file.name.split('.');
  const originalExt = nameParts.pop()?.toLowerCase();
  const baseName = nameParts.join('.');
  const typeExt = file.type.split('/').pop();

  if (!originalExt || !typeExt || !isExtensionSupported(file.name)) {
    return null;
  }

  return `${baseName}.${typeExt}`;
}

/**
 * Validates file
 * @param file - File to validate
 * @returns boolean indicating if file is valid
 */
export function validateFile(
  file: File,
  maxSize: number = MAX_SAMPLE_FILE_SIZE_FREE
): boolean {
  if (!file || !file.name || !file.type) return false;

  const validatedName = getValidatedFileName(file); // Refactor considering blobToSamplerFile
  if (!validatedName) return false;

  return isFileSizeValid(file, maxSize);
}

// const sample_file = new File([unsaved.sample_file], unsaved.name + '.webm', { // do this when creating a sample!
//   type: 'audio/webm',
// }); // name + '.webm' (what if already dropped e.g .wav) ?

// _____________________ Fetch Blob from URL (remove?) ________________________________

export async function fetchBlobFromUrl(url: string): Promise<Blob> {
  if (url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw error;
    }
  } else {
    throw new Error('URL is empty');
  }
}

// is this useful ? moveToFile : throw away
// export function assert(condition: any, msg?: string): asserts condition {
//   if (!condition) {
//     console.error(msg);
//     throw new Error(msg);
//   }
// }
