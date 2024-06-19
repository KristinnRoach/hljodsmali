export type Sample = {
  id: string;
  name: string;
  sample_file: Blob;
  buffer?: AudioBuffer;
  isLooping?: boolean;
  // audioUrl?: string;
  addBufferToSample?: (buffer: AudioBuffer) => void;
};

export type SingleUseVoice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  key?: string;
  triggerTime?: number;
  rate?: number;
  midiNote?: number;
  isLooping?: boolean;
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
