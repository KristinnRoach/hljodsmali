'use server';
// import 'server-only';

import { revalidatePath } from 'next/cache';
import pb from '../lib/db/pocketbase';
import { Sample_db } from '../types/sample';

export async function saveSample(name: string, file: File): Promise<Sample_db> {
  // currentPath: string ?
  const formData = new FormData();
  formData.append('name', name);
  formData.append('sample_file', file);
  formData.append('user', pb.authStore.model?.id);

  const record = await pb.collection('samples').create<Sample_db>(formData);
  revalidatePath('/');
  return record;
}

export async function deleteSample(id: string): Promise<void> {
  await pb.collection('samples').delete(id);
  revalidatePath('/');
}

export async function fetchSamples(): Promise<Sample_db[]> {
  return await pb
    .collection('samples')
    .getFullList<Sample_db>({ sort: '-created' });
}

export async function fetchSample(sampleId: string): Promise<Sample_db> {
  return await pb.collection('samples').getOne<Sample_db>(sampleId);
}

export async function fetchSampleAudio(sampleId: string): Promise<ArrayBuffer> {
  try {
    const record = await pb.collection('samples').getOne(sampleId);
    const audioFileUrl = pb.files.getUrl(record, record.audio_file);

    const response = await fetch(audioFileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch audio file');
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Failed to fetch sample audio:', error);
    throw new Error('Failed to fetch sample audio');
  }
}

// fix string vs file if this is needed

// export async function getSampleUrl(sample: Sample_db): Promise<string> {
//   return pb.files.getUrl(sample, sample.sample_file);
// }

// export async function fetchSampleAudio(sample: Sample): Promise<AudioBuffer> {
//   const url = await pb.files.getUrl(sample, sample.sample_file);
//     const response = await fetch(url);
//     const arrayBuffer = await response.arrayBuffer();
//     const audioCtx = new AudioContext();
//     const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
//     return audioBuffer;
//   }

// export async function getSampleArrayBuffer(
//   sample: Sample
// ): Promise<ArrayBuffer> {
//   const url = await getSampleUrl(sample);
//   const response = await fetch(url);
//   const arrayBuffer = await response.arrayBuffer();
//   return arrayBuffer;
// }

// // default sample.name = 'soft piano c5'

// // export async function createSample(name: string, blob: Blob): Promise<void> {
// //   await createSampleRecord(name, blob);
// // }

// // export async function removeSample(sampleId: string): Promise<void> {
// //   await deleteSample(sampleId);
// // }

// // export async function fetchSamples(): Promise<RecordModel[]> {
// //   return await fetchSampleRecords();
// // }
