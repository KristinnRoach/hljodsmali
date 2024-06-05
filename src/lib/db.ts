import pb from './pb';
import { Sample } from '../types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createSampleRecord = async (
  // hax, laga eftir próf
  name: string,
  blob: Blob
): Promise<void> => {
  let data;

  if (pb.authStore.model?.id && pb.authStore.isValid) {
    data = {
      name: name,
      sample_file: blob,
      user: pb.authStore.model.id,
    };
  } else {
    data = {
      name: name,
      sample_file: blob,
    };
  }

  try {
    const createdSampleRecord = await pb.collection('samples').create(data);
    console.log('Uploaded audio:', createdSampleRecord);
  } catch (error) {
    console.error('Error uploading audio:', error);
  }
};

export async function deleteSample(sampleId: string): Promise<void> {
  await pb.collection('samples').delete(sampleId); // anybody can delete public samples
}

export async function fetchUserSamples(): Promise<Sample[]> {
  // no need for url since using audiobuffer?
  const data = await pb.collection('samples').getFullList({
    sort: '-created',
  });

  const samplesWithSrcURL = data?.map((sample: any) => {
    const audioUrl = pb.files.getUrl(sample, sample.sample_file, {
      // token: fileToken, líklega óþarfi en get notað token
    });
    // Object with audioUrl for each sample
    return {
      ...sample,
      audioUrl: audioUrl,
    };
  });

  return samplesWithSrcURL || [];
}
