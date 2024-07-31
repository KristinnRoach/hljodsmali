'use client';

import React from 'react';

import useKeyboard from '../../hooks/useKeyboard';
import Recorder_CSR from './Recorder';
import SampleSettings from './SampleSettings';
import LinkList from '../UI/LinkList';

import styles from './Sampler.module.scss';
import { useSamplerCtx } from '../../contexts/sampler-context';
import Toggle from '../UI/Basic/Toggle';
import MenuToggle from '../UI/Basic/MenuToggle';

export default function Sampler_cli() {
  useKeyboard();
  const {
    samplerEngine,
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
      <div className={styles.sampler}>
        <button onClick={saveAll} disabled={!hasUnsavedSamples}>
          Save All
        </button>
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

        <Recorder_CSR />
        <section className={styles.samples}>
          <MenuToggle label={isLoading ? 'Loading...' : 'Samples'}>
            {!isLoading && sampleRecords.length > 0 && (
              <LinkList
                items={sampleRecords}
                title='Samples'
                paramName='samples'
                itemsPerPage={10}
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
