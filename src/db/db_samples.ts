import PocketBase from 'pocketbase';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pb = new PocketBase('http://127.0.0.1:8090');

export async function fetchSamples() {
  const data = await pb.collection('samples').getFullList({
    sort: '-created',
  });

  const samplesWithSrcURL = data?.map((sample: any) => {
    const audioUrl = pb.files.getUrl(sample, sample.sample_file, {});

    // Object with audio elements for each sample
    return {
      ...sample,
      audioUrl: audioUrl,
    };
  });

  return samplesWithSrcURL;
}

export const createSample = async (name: string, sample_file: Blob) => {
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
