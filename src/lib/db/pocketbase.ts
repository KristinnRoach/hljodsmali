import PocketBase from 'pocketbase';
import { Sample } from '../../types';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'https://hljodsmali.pockethost.io/'
);
pb.autoCancellation(false);

export default pb;

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// async function updateSampleSlugs() { // only run if needed
//   try {
//     // // Authenticate as an admin (replace with your admin email and password)
//     // await pb.admins.authWithPassword('YOUR_ADMIN_EMAIL', 'YOUR_ADMIN_PASSWORD');

//     const samples = await pb.collection('samples').getFullList();

//     for (const sample of samples) {
//       const slug = generateSlug(sample.name);
//       await pb.collection('samples').update(sample.id, { slug });
//       console.log(`Updated ${sample.name} with slug: ${slug}`);
//     }

//     console.log('All samples updated with slugs');
//   } catch (error) {
//     console.error('Error updating samples:', error);
//   }
// }

// updateSampleSlugs();

export const createSampleRecord = async (
  name: string,
  blob: Blob
): Promise<Sample> => {
  const file = new File([blob], name + '.webm', { type: 'audio/webm' });
  const slug = generateSlug(name);
  const formData = new FormData();
  formData.append('name', name);
  formData.append('slug', slug);
  formData.append('sample_file', file);
  formData.append('isLooping', 'false');

  if (pb.authStore.model?.id && pb.authStore.isValid) {
    formData.append('user', pb.authStore.model.id);
  }

  try {
    const record = await pb.collection('samples').create<Sample>(formData);
    return record;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
};

export async function deleteSample(sampleId: string): Promise<void> {
  try {
    await pb.collection('samples').delete(sampleId);
  } catch (error) {
    console.error('Error deleting sample:', error);
    throw error;
  }
}

export async function fetchSamples(): Promise<Sample[]> {
  try {
    const samples = await pb.collection('samples').getFullList<Sample>({
      sort: '-created',
    });
    console.log('Fetched samples:', samples);
    return samples;
  } catch (error) {
    console.error('Error fetching sample records:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export async function fetchSampleByID(sampleId: string): Promise<Sample> {
  try {
    return await pb.collection('samples').getOne<Sample>(sampleId);
  } catch (error) {
    console.error('Error fetching sample record by id:', error);
    throw error;
  }
}

export async function getSampleAudioBuffer(
  sample: Sample,
  audioCtx: AudioContext
): Promise<AudioBuffer> {
  'use client'; // ?

  try {
    const url = pb.files.getUrl(sample, sample.sample_file);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error loading audio buffer:', error);
    throw error;
  }
}
