// src/lib/constants.ts

// ____________________ MEMORY MANAGEMENT _______________________________

// bind to pocketbase values, get variables from there?

export const MAX_SAMPLE_FILE_SIZE_FREE = 7 * 1024 * 1024; // 7MB, (7340032 bytes) // add PAID if monatised

export const MAX_SAMPLE_DURATION_FREE = 20; // seconds

export const MAX_USER_SAMPLES_FREE = 10; // add PAID if monatised, FREE is default for now

export const MAX_PUBLIC_SAMPLES = 50; // limit for now, just for safety // add prompt to delete old ones

export const HARD_LIMIT_MAX_SAMPLES_IN_DB = 1000; // limit for now, approximately 385MB if sample_file is 'audio/ogg; codecs=vorbis', 320 kbps.

export const SAMPLES_PER_PAGE = 10;

export const MAX_LOADED_AUDIOBUFFERS = 10;

export const INIT_FETCHED_SAMPLE_RECORDS = 10;

export const MAX_FETCHED_BLOBS = 20; // should be more?

// ____________________ HARDWARE _______________________________

//most computer keyboards only support 6 keys pressed at once
// TODO: research for different devices / OS's / browsers
export const MAX_KEYS_PRESSED = () => {
  if (navigator.userAgent.includes('Macintosh')) {
    return 10;
  } else {
    return 24;
  }
};

export const MAX_KEYS_PRESSED_MIDI = 36; // 3 octaves for now
