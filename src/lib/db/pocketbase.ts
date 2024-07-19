import PocketBase from 'pocketbase';
import { Sample_db, Sample_settings } from '../../types/sample';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'https://hljodsmali.pockethost.io/'
);
pb.autoCancellation(false);

export default pb;

export const createSampleRecord = async (
  name: string,
  file: File
): Promise<Sample_db> => {
  // const file = new File([blob], name + '.webm', { type: 'audio/webm' });
  const slug = generateSlug(name);
  const formData = new FormData();
  formData.append('name', name);
  formData.append('slug', slug);
  formData.append('sample_file', file);

  if (pb.authStore.model?.id && pb.authStore.isValid) {
    formData.append('user', pb.authStore.model.id);
  }

  try {
    const record = await pb.collection('samples').create<Sample_db>(formData);
    return record;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
};

export async function saveNewSample(
  sample: Partial<Sample_db>
): Promise<Sample_db> {
  const formData = new FormData();
  formData.append('name', sample.name);
  formData.append('slug', sample.slug);
  formData.append('sample_file', sample.sample_file as File); // as File ??
  formData.append('bufferDuration', sample.bufferDuration.toString());
  formData.append('sample_settings', JSON.stringify(sample.sample_settings));

  if (pb.authStore.model?.id) {
    formData.append('user', pb.authStore.model.id);
  }

  console.log(
    'formData:',
    formData.get('name'),
    formData.get('slug'),
    formData.get('sample_file'),
    formData.get('bufferDuration'),
    formData.get('sample_settings')
  );

  try {
    const record = await pb.collection('samples').create<Sample_db>(formData);
    return record;
  } catch (error) {
    console.error('Error saving new sample:', error);
    throw error;
  }
}

export async function updateSampleRecord(
  sampleId: string,
  data: Partial<Sample_db>
): Promise<Sample_db> {
  try {
    return await pb.collection('samples').update<Sample_db>(sampleId, data);
  } catch (error) {
    console.error('Error updating sample:', error);
    throw error;
  }
}

export async function deleteSample(sampleId: string): Promise<void> {
  try {
    await pb.collection('samples').delete(sampleId);
  } catch (error) {
    console.error('Error deleting sample:', error);
    throw error;
  }
}

export async function fetchSamples(): Promise<Sample_db[]> {
  try {
    const samples = await pb.collection('samples').getFullList<Sample_db>({
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

export async function fetchSampleByID(sampleId: string): Promise<Sample_db> {
  try {
    return await pb.collection('samples').getOne<Sample_db>(sampleId);
  } catch (error) {
    console.error('Error fetching sample record by id:', error);
    throw error;
  }
}

export async function getSampleAudioBuffer(
  sample: Sample_db,
  audioCtx: AudioContext
): Promise<AudioBuffer> {
  'use client'; // ?

  try {
    const url = pb.files.getUrl(sample, sample.sample_file as string);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error loading audio buffer:', error);
    throw error;
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
