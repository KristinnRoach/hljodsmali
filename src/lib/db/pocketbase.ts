import PocketBase from 'pocketbase';
import { SampleRecord, Sample_settings } from '../../types/sample';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'https://hljodsmali.pockethost.io/'
);
pb.autoCancellation(false);

export default pb;

export async function saveNewSampleRecord(
  name: string,
  audioData: File | Blob, // string or file or blob?
  sample_settings: Sample_settings
): Promise<SampleRecord> {
  if (audioData instanceof Blob) {
    audioData = new File([audioData], name + '.webm', { type: 'audio/webm' }); // check audio type for consistency
  }
  // const slug = name.toLowerCase().replace(/ /g, '-');
  const slug = generateSlug(name);
  const formData = new FormData();
  formData.append('name', name);
  formData.append('slug', slug);
  formData.append('sample_file', audioData); //  as File);
  formData.append('sample_settings', JSON.stringify(sample_settings));

  if (pb.authStore.model?.id) {
    formData.append('user', pb.authStore.model.id);
  }

  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, ':', value);
  }

  try {
    const record = await pb
      .collection('samples')
      .create<SampleRecord>(formData);
    return record;
  } catch (error) {
    console.error('Error saving new sample:', error);
    throw error;
  }
}

export async function updateSampleRecord(
  sampleId: string,
  data: Partial<SampleRecord>
): Promise<SampleRecord> {
  try {
    return await pb.collection('samples').update<SampleRecord>(sampleId, data);
  } catch (error) {
    console.error('Error updating sample:', error);
    throw error;
  }
}

export async function deleteSampleRecord(sampleId: string): Promise<void> {
  try {
    await pb.collection('samples').delete(sampleId);
  } catch (error) {
    console.error('Error deleting sample:', error);
    throw error;
  }
}

export async function renameSampleRecord(
  sampleId: string,
  name: string
): Promise<SampleRecord> {
  try {
    return await pb
      .collection('samples')
      .update<SampleRecord>(sampleId, { name });
  } catch (error) {
    console.error('Error renaming sample:', error);
    throw error;
  }
}

export async function fetchSamples(): Promise<SampleRecord[]> {
  try {
    const samples = await pb.collection('samples').getFullList<SampleRecord>({
      sort: '-created',
    });
    console.log('Fetched samples:', samples);
    return samples.map((s) => ({
      ...s,
      // zeroCrossings: Array.isArray(s.zeroCrossings)
      //   ? // if there is a possibility of zeroCrossings or sampleSettings being already in memory, if not then just parse the json
      //     s.zeroCrossings
      //   : JSON.parse(s.zeroCrossings as unknown as string),
      sample_settings:
        typeof s.sample_settings === 'string'
          ? JSON.parse(s.sample_settings)
          : s.sample_settings,
    }));
  } catch (error) {
    console.error('Error fetching sample records:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export async function fetchSampleByID(sampleId: string): Promise<SampleRecord> {
  try {
    return await pb.collection('samples').getOne<SampleRecord>(sampleId);
  } catch (error) {
    console.error('Error fetching sample record by id:', error);
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

export async function getSampleAudioBuffer(
  sample: SampleRecord,
  audioCtx: AudioContext
): Promise<AudioBuffer> {
  'use client'; // ??

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

// export const createSampleRecord = async (
//   name: string,
//   file: File
// ): Promise<Sample_db> => {
//   // const file = new File([blob], name + '.webm', { type: 'audio/webm' });
//   const slug = generateSlug(name);
//   const formData = new FormData();
//   formData.append('name', name);
//   formData.append('slug', slug);
//   formData.append('sample_file', file);

//   if (pb.authStore.model?.id && pb.authStore.isValid) {
//     formData.append('user', pb.authStore.model.id);
//   }

//   try {
//     const record = await pb.collection('samples').create<Sample_db>(formData);
//     return record;
//   } catch (error) {
//     console.error('Error uploading audio:', error);
//     throw error;
//   }
// };
