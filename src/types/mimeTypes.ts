// src/types/audioFormats.ts

// ____________________ AUDIO FORMAT / MIME TYPES ______________________________

export const APP_FORMATS = {
  OGG: {
    mimeType: 'application/ogg; codecs=vorbis',
    extension: '.ogg',
    canContainVideo: true,
  },
  OGA: {
    mimeType: 'audio/ogg; codecs=vorbis',
    extension: '.oga',
    canContainVideo: false,
  },
  FLAC: { mimeType: 'audio/flac', extension: '.flac', canContainVideo: false },
  WAV: { mimeType: 'audio/wav', extension: '.wav', canContainVideo: false },
  AIFF: { mimeType: 'audio/aiff', extension: '.aiff', canContainVideo: false },
  MP3: { mimeType: 'audio/mpeg', extension: '.mp3', canContainVideo: false },
  MP4: { mimeType: 'audio/mp4', extension: '.mp4', canContainVideo: true },
  M4A: { mimeType: 'audio/x-m4a', extension: '.m4a', canContainVideo: false },
  AAC: { mimeType: 'audio/aac', extension: '.aac', canContainVideo: false },
  WEBM_VIDEO: {
    mimeType: 'video/webm',
    extension: '.webm',
    canContainVideo: true,
  },
  WEBM: { mimeType: 'audio/webm', extension: '.webm', canContainVideo: false },
} as const;

export type FormatKey = keyof typeof APP_FORMATS;
export type AudioFormat = (typeof APP_FORMATS)[FormatKey];
// export type FormatKey_FREE = Omit<FormatKey, 'FLAC' | 'WAV' | 'AIFF'>;
// export type AudioFormat_FREE = (typeof MIME_TYPES)[FormatKey_FREE];
