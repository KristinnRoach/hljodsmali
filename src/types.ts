export type Sample = {
  id: string;
  name: string;
  sample_file: Blob;
  audioUrl?: string;
};

export type KeyMap = {
  [key: string]: number;
};
