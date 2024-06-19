import { Sample } from '../types';

export function createSampleFromBlob(
  blob: Blob,
  id: number | string,
  name: string = 'new-sample'
): Sample {
  const newSample: Sample = {
    id: id + '',
    name: name,
    sample_file: blob,
  };
  return newSample;
}
