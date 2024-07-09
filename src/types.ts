export type Sample = {
  id: string;
  name: string;
  slug: string;
  sample_file: string;
  user?: string | null;
  created: string;
  updated: string;

  buffer?: AudioBuffer;

  startPoint: number;
  endPoint?: number;
  attackTime: number;
  releaseTime: number;
};

export type KeyMap = {
  [key: string]: number;
};
