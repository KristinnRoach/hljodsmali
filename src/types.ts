export type Sample = {
  id: string;
  name: string;
  sample_file: Blob;
  audioUrl?: string;
};

export type Voice = {
  audioEl: HTMLAudioElement;
  url: audioEl.src;
  preservesPitch: audioEl.preservesPitch;
  startTime?: number;
  pauseTime?: number;
  isLooping?: boolean;
};

export type KeyMap = {
  [key: string]: number;
};
