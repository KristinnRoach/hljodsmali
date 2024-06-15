export type Sample = {
  id: string;
  name: string;
  sample_file: Blob;
  audioUrl?: string;
};

export type SingleUseVoice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  key?: string;
  rate?: number;
  isLooping?: boolean;
  triggerTime?: number;
  startOffset?: number;
  endOffset?: number;
};

// export type Voice = {
//   audioEl: HTMLAudioElement;
//   pauseTime?: number;
//   isLooping?: boolean;
// };

export type KeyMap = {
  [key: string]: number;
};
