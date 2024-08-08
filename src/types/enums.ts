// ____________________ AUDIO FORMAT / MIME TYPES __________________________________________

// export enum AUDIO_TYPE_ENUM {
//   OGG = 'audio/ogg; codecs=vorbis',
//   FLAC = 'audio/flac',
//   WAV = 'audio/wav',
//   MP3 = 'audio/mpeg',
//   WEBM = 'video/webm', // TEMPORARY WHILE FIXING OLD RECORDS
// }

// export enum AUDIO_TYPE_EXT_ENUM {
//   OGG = '.ogg',
//   FLAC = '.flac',
//   WAV = '.wav',
//   MP3 = '.mp3',
//   WEBM = '.webm', // TEMPORARY WHILE FIXING OLD RECORDS
// }

// use HIGHEST unless affecting performance
export enum BITRATE_OGG_MP3 {
  HIGHEST = 320, // kbps
  HIGH = 256,
  MEDIUM = 192,
  LOW = 128,
}

// Check for pocketbase for updates. Change if DB changes.
// TODO: implement conversion to SAMPLER_MIME_TYPES in order to accept these when importing
export enum SUPPORTED_IMPORT_TYPE_ENUM { // NOT YET IMPLEMENTED
  MP3 = 'audio/mpeg',
  AAC = 'audio/aac',
  M4A = 'audio/m4a',
  WAV = 'audio/wav',
  OGG = 'audio/ogg',
  OPUS = 'audio/opus',
  OGA = 'audio/oga',
  FLAC = 'audio/flac',
  WEBM = 'video/webm', // they currently don't support audio/webm, it still works though
  MIDI = 'audio/midi',
  AIFF = 'audio/.aiff',
  X_M4A = 'audio/x-m4a',
  APE = 'audio/ape',
  AMR = 'audio/amr',
  MUSEPACK = 'audio/musepack',
  BASIC = 'audio/basic',
  QCELP = 'audio/qcelp',
  X_UNKNOWN = 'audio/x-unknown',
}
