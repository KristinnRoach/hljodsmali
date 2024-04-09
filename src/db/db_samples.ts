import PocketBase from 'pocketbase';

import { Sample } from '../types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pb = new PocketBase('https://hljodsmali.pockethost.io/');
pb.autoCancellation(false);

export async function fetchSamples(): Promise<Sample[]> {
  const data = await pb.collection('samples').getFullList({
    sort: '-created',
  });

  const samplesWithSrcURL = data?.map((sample: any) => {
    const audioUrl = pb.files.getUrl(sample, sample.sample_file, {});

    // Object with audioUrl for each sample
    return {
      ...sample,
      audioUrl: audioUrl,
    };
  });

  return samplesWithSrcURL || [];
}

export const createSample = async (
  name: string,
  sample_file: Blob
): Promise<void> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('sample_file', sample_file);
  try {
    const record = await pb.collection('samples').create(formData);
    console.log('Uploaded audio:', record);
  } catch (error) {
    console.error('Error uploading audio:', error);
  }
};

export async function deleteSample(sampleId: string): Promise<void> {
  await pb.collection('samples').delete(sampleId);
}
