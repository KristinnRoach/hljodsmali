import PocketBase from 'pocketbase';

import pb from './pb';
import { Sample } from '../types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

pb.autoCancellation(false);

export function getPocketBase(): PocketBase {
  if (!pb) {
    console.error('PocketBase is not initialized.');
  }
  return pb;
}

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

export const createSampleRecord = async (
  name: string,
  sample_file: Blob
): Promise<void> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('sample_file', sample_file);
  try {
    const createdSampleRecord = await pb.collection('samples').create(formData);
    console.log('Uploaded audio:', createdSampleRecord);
  } catch (error) {
    console.error('Error uploading audio:', error);
  }
};

export async function deleteSample(sampleId: string): Promise<void> {
  await pb.collection('samples').delete(sampleId);
}
