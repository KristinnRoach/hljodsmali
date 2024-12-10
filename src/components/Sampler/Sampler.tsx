'use client';

import React from 'react';

import useKeyboard from '../../hooks/useKeyboard';
import Recorder_CSR from './Recorder';
import SampleSettings from './SampleSettings';
import LinkList from '../UI/LinkList';
import Shapes from '../UI/Shapes/Shapes';
import KeyboardGUI from '../UI/Keyboard/spline/KeyboardGUISpline';

import styles from './Sampler.module.scss';
import { useSamplerCtx } from '../../contexts/sampler-context';
import Toggle from '../UI/Basic/Toggle';
import MenuToggle from '../UI/Basic/MenuToggle';

export default function Sampler_cli() {
  useKeyboard();
  const {
    samplerEngine,
    allSamples,
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

  const [loopState, setLoopState] = React.useState(isLooping || false);

  const [visualizer, setVisualizer] = React.useState<'shapes' | 'keyboard'>(
    'shapes'
  );

  if (!samplerEngine) {
    console.error('SamplerEngine not initialized in Sampler component');
    return null;
  }

  function switchVisualizer(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setVisualizer((prev) => (prev === 'shapes' ? 'keyboard' : 'shapes'));
  }

  return (
    <>
      <div className={styles.sampler}>
        {/* <button onClick={saveAll} disabled={!hasUnsavedSamples}>
          Save All
        </button> */}
        <div className={`${styles.sampler} ${styles.clickable}`}>
          <button
            style={{ backgroundColor: '#65F0C8' }}
            onClick={switchVisualizer}
          >
            Switch Visualizer
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
        </div>
        <section className={`${styles.samples} ${styles.clickable}`}>
          <MenuToggle label={isLoading ? 'Loading...' : 'Samples'}>
            {allSamples.length < 1 && (
              <p style={{ padding: '2rem' }}>
                No samples yet. Record something!
              </p>
            )}
            {!isLoading && allSamples.length > 0 && (
              <div className={styles.clickable}>
                <LinkList
                  items={allSamples}
                  title='Samples'
                  paramName='samples'
                  itemsPerPage={10}
                  onDelete={(id) => deleteSample(id)}
                  onSave={(id) => updateSample(id)}
                />

                <MenuToggle label='Settings'>
                  <SampleSettings />
                </MenuToggle>
              </div>
            )}
          </MenuToggle>
        </section>
      </div>
      <section className={styles.graphics}>
        {visualizer === 'shapes' && (
          <div className={styles.shapes}>
            <Shapes />{' '}
          </div>
        )}
        {visualizer === 'keyboard' && (
          <div className={styles.keyboardBoxWrapper}>
            <div className={styles.keyboardBox}>
              <KeyboardGUI />
            </div>
          </div>
        )}
      </section>
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
