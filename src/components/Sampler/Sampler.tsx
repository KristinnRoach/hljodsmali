'use client';

import React, { useCallback, useEffect } from 'react';

import SampleSettings from './SampleSettings';
import LinkList from '../UI/LinkList';
import Toggle from '../UI/Basic/Toggle';
import MenuToggle from '../UI/Basic/MenuToggle';

import Recorder from './Recorder';

import useKeyboard from '../../hooks/useKeyboard';
import { useSamplerCtx } from '../../contexts/sampler-context';
import { SAMPLES_PER_PAGE } from '../../types/constants';
import { AudioFormat, FormatKey, APP_FORMATS } from '../../types/mimeTypes';

import styles from './Sampler.module.scss';
import { blobToSampleFile } from '@src/types/utils';

export default function Sampler_cli() {
  useKeyboard();
  const {
    samplerEngine,
    // handleNewRecording,
    sampleRecords,
    isLoading,
    saveAll,
    updateSample,
    deleteSample,
    hasUnsavedSamples,
    isLooping,
    toggleLoop,
    isHolding,
    toggleHold,
  } = useSamplerCtx();

  if (!samplerEngine) {
    console.error('SamplerEngine not initialized in Sampler component');
    return null;
  }

  return (
    <>
      {/* <AudioDeviceSelector /> */}
      <div className={styles.sampler}>
        <button onClick={saveAll} disabled={!hasUnsavedSamples}>
          Save All
        </button>
        {/* <button onClick={reSample} disabled={!hasUnsavedSamples}>
          ReSample!
        </button> */}
        <Toggle
          label='Loop'
          isOn={isLooping}
          onToggle={toggleLoop}
          type='loop'
        />
        <Toggle
          label='Hold'
          isOn={isHolding}
          onToggle={toggleHold}
          type='hold'
        />

        <Recorder />

        <section className={styles.samples}>
          <MenuToggle label={isLoading ? 'Loading...' : 'Samples'}>
            {!isLoading && sampleRecords.length > 0 && (
              <LinkList
                items={sampleRecords}
                title='Samples'
                paramName='samples'
                itemsPerPage={SAMPLES_PER_PAGE}
                onDelete={(id) => deleteSample(id)}
                onSave={(id) => updateSample(id)}
              />
            )}
            <MenuToggle label='Settings'>
              <SampleSettings />
            </MenuToggle>
          </MenuToggle>
        </section>
      </div>
    </>
  );
}

// // import { useAudioRecorder } from '../../hooks/useAudioRecorder';

// // const {
// //   startRecording,
// //   stopRecording,
// //   isRecording,
// //   audioBlob,
// //   requestPermission,
// //   permissionGranted,
// // } = useAudioRecorder();

// // useEffect(() => {
// //   requestPermission();
// // }, [requestPermission]);

// // const toggleRecording = useCallback(async () => {
// //   if (!permissionGranted) {
// //     await requestPermission();
// //     return;
// //   }

//   if (isRecording) {
//     const blob = await stopRecording();
//     if (!blob) throw new Error('Failed to process recording');
//     handleNewRecording(blob);
//   } else {
//     await startRecording();
//   }
// }, [
//   isRecording,
//   startRecording,
//   stopRecording,
//   permissionGranted,
//   requestPermission,
// ]);

//   <div className='recorder'>
//   <Toggle
//     isOn={isRecording}
//     onToggle={toggleRecording}
//     label={
//       isRecording
//         ? 'Stop'
//         : permissionGranted
//         ? 'Record'
//         : 'Grant Permission'
//     }
//     type='record'
//   />
// </div>

// load new recording when recording stops

// const stopRecording = useCallback(async (blob) => {
//   if (!(samplerEngine && audioCtx)) return;

//   const recordedBlob = await samplerEngine.stopRecording();
//   if (recordedBlob) {
//     //const mimeTypeKey: keyof typeof AUDIO_TYPE_ENUM

//     /* FIND A NON-CONVOLUTED WAY TO GET THE KEYS, SIMPLIFY ENUMS SINCE THEY USE SAME KEYS */

//     console.log('AUDIOTYPE: ', audioType);
//     const record = await blobToSampleRecord(audioCtx, recordedBlob, 'OGG'); // REMOVE HARDCODED MIME TYPE

//     const sampleName = prompt('Save sample now? Enter a name:');

//     if (sampleName) {
//       saveNewSampleRecord(record).then((savedRecord) => {
//         setSampleRecords((prev) => [...prev, savedRecord]);
//         router.replace(`?samples=${savedRecord.slug}`, { scroll: false });
//       });
//     } else {
//       // samplerEngine.loadSample(savedRecord, buffer);
//       // unsavedSampleIds.current.add(sample.id);
//       setSampleRecords((prev) => [...prev, record]); // triggers loadSamples useEffect
//       router.replace(`?samples=${record.slug}`, { scroll: false }); // FIX: triggers loadSamples useEffect again ?
//     }
//   }
// }, [samplerEngine, router, audioCtx]);

// const {
//   latestSelectedLoadedSample, // REMOVE
//   latestSelectedSample,

//   .....

// } = useSamplerCtx();

// const { renderToFileOffline, isProcessing, error } = useResample();

// const reSample = async () => {
//   const loadedSample = latestSelectedLoadedSample;
//   const record = latestSelectedSample;
//   if (!loadedSample || !record) {
//     console.error('No sample selected');
//     return;
//   }

//   if (loadedSample.id !== record.id) {
//     console.error('Loaded sample and record do not match');
//     return;
//   }

//   const settings = record.sample_settings;
//   const offsetDuration = 0;
//   const shouldLoop = false;

//   const reSampledBuffer = await renderToFileOffline(
//     1,
//     loadedSample,
//     settings,
//     offsetDuration,
//     shouldLoop
//   );

//   console.log('reSampled buffer: ', reSampledBuffer);
// };

// import { notes } from '../UI/Keyboard/basic/note';
// import Octave from '../UI/Keyboard/basic/Octave';

// const onPianoClick = (e) => {
//   console.log('Piano key clicked:', e.target.value);
//   console.log(notes);
// };

/*       <section className={styles.piano}>
<Octave notes={notes} clickHandler={onPianoClick} />
      <Octave notes={notes} clickHandler={onPianoClick} /> */

// import { handleDrop, handleDragOver } from '../../utils/dragNdrop';

/* onDragOver={handleDragOver} onDrop={handleDrop} className={''} */

// const [chosenBuffers, setChosenBuffers] = useState<AudioBuffer[]>([]);

// const decodeAudio = useAudioDecoder();

// const [initialBuffer, setInitialBuffer] = useState<AudioBuffer | null>(null);

// const selectedIds =
//   searchParams.get('samples')?.split(',').filter(Boolean) || [];

// useEffect(() => {
//   const loadInitialSample = async () => {
//     try {
//       const response = await fetch('/audio/C-kid1.wav');
//       const arrayBuffer = await response.arrayBuffer();
//       const audioBuffer = await decodeAudio(arrayBuffer);
//       setChosenBuffers([audioBuffer]);
//       setInitialBuffer(audioBuffer);

//       // Update URL to include the initial sample
//       // if (!selectedIds.includes('initial')) {
//       //   router.push('/?samples=initial', { scroll: false });
//       // }
//     } catch (error) {
//       console.error('Failed to load initial sample:', error);
//     }
//   };

// if (selectedIds.length === 0) {
// loadInitialSample();
// } else {
//   // Load samples from URL
//   const loadSamples = async () => {
//     const buffers = await Promise.all(
//       selectedIds.map(async (id) => {
//         if (id === 'initial') {
//           const response = await fetch('/audio/C-kid1.wav');
//           const arrayBuffer = await response.arrayBuffer();
//           return await decodeAudio(arrayBuffer);
//         } else {
//           const arrayBuffer = await fetchSampleAudio(id);
//           return await decodeAudio(arrayBuffer);
//         }
//       })
//     );
//     setChosenBuffers(buffers);
//   };
//   loadSamples();
// }

//   console.log('initialBuffer: ', initialBuffer);
// }, [selectedIds, decodeAudio, router]);
