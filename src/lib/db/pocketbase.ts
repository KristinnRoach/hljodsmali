// src/lib/db/pocketbase.ts

import PocketBase from 'pocketbase';
import {
  SampleRecord,
  Sample_file,
  Sample_settings,
  Time_settings,
  getDefaultSampleSettings,
} from '../../types/samples';
// import { getHoursMinSec } from '../utils/time-utils';
// import { blobToSampleFile, isSampleFile } from '../../types/utils';
// import { FormatKey, APP_FORMATS, AudioFormat } from '../../types/mimeTypes';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'https://hljodsmali.pockethost.io/'
);
pb.autoCancellation(false);

export default pb;

// Create a new SampleRecord object from a Blob
export async function createNewSampleRecord(
  name: string,
  sample_file: Sample_file,
  bufferDuration: number,
  initTimeSettings?: Time_settings
): Promise<SampleRecord> {
  const sampleSettings = getDefaultSampleSettings(
    bufferDuration,
    initTimeSettings // undefined if not provided
  );

  const record: SampleRecord = {
    id: name,
    name: name,
    slug: generateSlug(name),
    sample_file: sample_file,
    bufferDuration: bufferDuration,
    sample_settings: sampleSettings,
    user: pb.authStore.model?.id,
    // created: timeNow,
    // updated: timeNow,
  };

  return record;
}

// const url = pb.files.getUrl(record, firstFilename, {'thumb': '100x250'});
// Additionally, to instruct the browser to always download the file instead of showing a preview when accessed directly, you can append the ?download=1 query parameter to the file url.

export async function saveNewSampleRecord(
  unsaved: SampleRecord
): Promise<SampleRecord> {
  const formData = new FormData();
  formData.append('name', unsaved.name);
  formData.append('slug', unsaved.slug);
  formData.append('sample_file', unsaved.sample_file);
  formData.append('bufferDuration', unsaved.bufferDuration);
  formData.append('sample_settings', unsaved.sample_settings); // JSON.stringify(unsaved.sample_settings));

  if (pb.authStore.model?.id) {
    formData.append('user', pb.authStore.model.id);
  }

  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, ':', value);
  }

  try {
    const saved = await pb.collection('samples').create<SampleRecord>(formData);
    return saved;
  } catch (error) {
    console.error('Error saving new sample:', error);
    throw error;
  }
}

export async function getSampleFileAsBlob(sample: SampleRecord): Promise<Blob> {
  const url = pb.files.getUrl(sample, sample.name);
  return await fetch(url).then((response) => response.blob());
}

export async function updateDB_SampleRecord(
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

// NO NEED TO PASS THE SAMPLE_FILE AROUND?
// unsaved Blobs map before saving new samples
// get rid of sample_file in SampleRecord type to save memory
// limit the amount of AudioBuffers in memory as they are ca 10 times bigger than the Blob
// webm is super small compared to wav.. quality comparison!

// const urls = samples.map((sample) => pb.getFileUrl(sample, 'sample_file'));
// const blobs = await Promise.all(
//   urls.map((url) => fetch(url).then((r) => r.blob()))
// );

async function updateBlobFilenames() {
  const records = await pb.collection('samples').getFullList();

  for (const record of records) {
    if (
      typeof record.sample_file === 'string' &&
      record.sample_file.includes('blob_')
    ) {
      const fileExtension = record.sample_file.split('.').pop();
      const newFilename = `${record.slug}.${fileExtension}`;

      await pb.collection('samples').update(record.id, {
        sample_file: newFilename,
      });
    }
  }
}

export async function fetchSamples(): Promise<SampleRecord[]> {
  try {
    const samples = await pb.collection('samples').getFullList<SampleRecord>({
      sort: '-created',
    });
    console.log('Fetched samples:', samples);

    return await Promise.all(
      samples.map(async (s) => {
        // const url = pb.getFileUrl(s, 'sample_file');
        // const blob = await fetch(url).then((r) => r.blob().then((b) => b));

        // const blobFormatKey = blob.type.split('.').pop() as FormatKey;

        // const sampleRecord: SampleRecord = await blobToSampleRecord(
        //   audioCtx,
        //   blob,
        //   blobFormatKey,
        //   s.name,
        //   s.bufferDuration
        // );

        // const sfileAsString = s.sample_file as unknown as string;
        // const extParts = sfileAsString.split('.');
        // const ext = extParts.pop();
        // const mimeType =
        //   AUDIO_TYPE_ENUM[ext?.toUpperCase() as keyof typeof AUDIO_TYPE_ENUM];

        // const file = new File([blob], s.slug, {
        //   type: blob.type, // mimeType,
        // }) as Sample_file;

        // console.log('FILE???: ', file);

        // // TODO: update all sample records to have Sample_file type instead of Blob
        // let sample_file: Sample_file | null = null;
        // if (isSampleFile(file)) {
        //   sample_file = file as Sample_file;
        // } else {
        //   /* REMOVE HARDCODED MIME TYPE */

        //   sample_file = blobToSampleFile(blob, s.slug, 'OGG'); // ext?.toUpperCase());
        // }

        // if (!sample_file || !isSampleFile(sample_file)) {
        //   throw new Error('Error creating sample file from blob');
        // }

        // console.log('sample_file:', sample_file);

        //  await pb.collection('samples').update(s.id, { sample_file });
        // const newS = await updateSampleRecord(s.id, { sample_file });

        return {
          ...s,
          // sample_file: sample_file,
          // sample_settings: s.sample_settings as Sample_settings, // check if this is enough!
          sample_settings: JSON.parse(
            s.sample_settings as unknown as string
          ) as Sample_settings,
        };
      })
    );
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

// async function fetchAsSampleFile(
//   url: string,
//   filename: string
// ): Promise<Sample_file> {
//   const response = await fetch(url);
//   const blob = await response.blob();

//   // Extract extension more safely
//   const parts = filename.split('.');
//   const ext = parts.pop() as keyof typeof AUDIO_TYPE_EXT_ENUM;

//   if (!AUDIO_TYPE_ENUM[blob.type as keyof typeof AUDIO_TYPE_ENUM]) {
//     throw new Error('Invalid audio type');
//   }

//   if (!AUDIO_TYPE_EXT_ENUM[ext]) {
//     throw new Error('Invalid file extension');
//   }

//   const file = new File([blob], filename, { type: blob.type }) as Sample_file;
//   return file;
// }

// export async function getSampleBufferFromDB(
//   sample: SampleRecord, // just use the id?
//   audioCtx: AudioContext
// ): Promise<AudioBuffer> {
//   'use client'; // ??

//   try {
//     // TODO: what is the correct way to handle sample_file type?
//     const url = pb.files.getUrl(
//       sample,
//       sample.sample_file as unknown as string
//     );
//     const response = await fetch(url);
//     const arrayBuffer = await response.arrayBuffer();
//     return await audioCtx.decodeAudioData(arrayBuffer);
//   } catch (error) {
//     console.error('Error loading audio buffer:', error);
//     throw error;
//   }
// }

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

// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile, toBlobURL } from '@ffmpeg/util';

// async function convertWebmToOgg(
//   webmBlob: Blob,
//   bitrate = '256k'
// ): Promise<Blob> {
//   const ffmpeg = new FFmpeg();

//   await ffmpeg.load({
//     coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
//     wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
//   });

//   const inputFileName = 'input.webm';
//   const outputFileName = 'output.ogg';

//   await ffmpeg.writeFile(inputFileName, await fetchFile(webmBlob));

//   await ffmpeg.exec([
//     '-i',
//     inputFileName,
//     '-c:a',
//     'libvorbis',
//     '-b:a',
//     bitrate,
//     outputFileName,
//   ]);

//   const data = await ffmpeg.readFile(outputFileName);

//   return new Blob([data], { type: 'audio/ogg' });
// }

// for (let record of samples as any[]) {
//   if (record.sample_file.includes('blob_')) {
//     const url = pb.files.getUrl(record, record.sample_file);
//     const response = await fetch(url);
//     // const blob = await response.blob();
//     const file = await fetchAsSampleFile(url, record.sample_file);
//     if (isSampleFile(file)) {
//       console.error('Invalid sample file:', file);
//       continue;
//     }
//     // const blob = await fetch(
//     //   pb.files.getUrl(record, storedFile)
//     // ).then((r) => r.blob());
//     // const validSampleFile = blobToSampleFile(storedFile, record.slug);
//     // console.log('sampleFile: ', validSampleFile);
//   }
// }
