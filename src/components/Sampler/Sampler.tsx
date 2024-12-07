'use client';

import React, { useCallback, useEffect, useState } from 'react';

// import Auth from '../Auth/Auth';

// import List from '../UI/List';
// import { useAudioCtxUtils } from '../../contexts/AudioCtxContext';
import { useSamplerEngine } from '../../contexts/EngineContext';
import useKeyboard from '../../hooks/useKeyboard';
import useKeyToggle from '../../hooks/useKeyToggle';
import useKeyMomentary from '../../hooks/useKeyMomentary';

import AudioDeviceSelector from './AudioDeviceSelector';
import Recorder from './Recorder';
import Tuner from './Tuner';
import AmpEnvelopeControls from './AmpEnvelope';

// import WaveformEditor from '../UI/WaveForms/WaveformEditor';

import Waveform from '../UI/WaveForms/Waveform';
import KeyboardGUI from '../UI/Keyboard/spline/KeyboardGUISpline';
// import Shapes from '../UI/Shapes/Shapes'; // TODO: Resolve "Multiple instances of Three.js being imported" warning (if persists)

import Toggle, { ToggleMenu } from '../UI/Basic/Toggle';
// import * as constants from '../../types/constants/constants';

import styles from './Sampler.module.scss';
import BasicSlider from '../UI/Basic/BasicSlider';

export default function Sampler() {
  // const { isAudioReady, resumeAudioContext } = useAudioCtx();
  // const { ensureAudioContext } = useAudioCtxUtils();

  const {
    selectedForSettings,
    getSelectedBuffers,
    getBufferDuration,
    isLooping,
    toggleLoop,
    isHolding,
    toggleHold,
    updateFilterSettings,
    getSampleSettings,
  } = useSamplerEngine();

  useKeyboard(); // adds event listeners for computer keyboard for playing notes

  const [loopState, setLoopState] = useState(false);
  const [holdState, setHoldState] = useState(false);

  const [capsLockToggle] = useKeyToggle({
    key: 'CapsLock',
    initialState: loopState, // currently always false
  });

  const [tabToggle] = useKeyToggle({
    key: 'Tab',
    initialState: holdState, // currently always false
  });

  const isSpacebarPressed = useKeyMomentary({
    key: ' ', // Space key
    onPress: () => {
      const newLoopState = toggleLoop();
      setLoopState(newLoopState);
      const newHoldState = toggleHold();
      setHoldState(newHoldState);
    },
    onRelease: () => {
      const newLoopState = toggleLoop();
      setLoopState(newLoopState);
      const newHoldState = toggleHold();
      setHoldState(newHoldState);
    },
  });

  const handleToggleLoop = useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      console.log('handleToggleLoop');
      const newState = toggleLoop();
      setLoopState(newState);
    },
    [toggleLoop, capsLockToggle, loopState]
  );

  const handleToggleHold = useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      console.log('handleToggleHold');
      const newState = toggleHold();
      setHoldState(newState);
    },
    [toggleHold]
  );

  useEffect(() => {
    if (capsLockToggle !== loopState) {
      const newState = toggleLoop();
      setLoopState(newState);
    }
  }, [capsLockToggle, toggleLoop]);

  useEffect(() => {
    if (tabToggle !== holdState) {
      const newState = toggleHold();
      setHoldState(newState);
    }
  }, [tabToggle, toggleHold]);

  return (
    <div className={styles.sampler}>
      <section className={styles.topBar}>
        {/* <Auth className={styles.loginContainer} />
        <Shapes className={styles.shapesContainer} /> */}
        <AudioDeviceSelector className={styles.deviceSelectorContainer} />
      </section>

      <section className={styles.recorder}>
        <Tuner className={styles.tuner} />
        <Recorder />
      </section>

      {selectedForSettings[0] &&
        getBufferDuration(selectedForSettings[0]) > 0 && (
          <div className={styles.flexRow}>
            <section className={styles.waveform}>
              <Waveform
                sampleId={selectedForSettings[0]}
                buffer={getSelectedBuffers('settings')[0]}
                className={styles.waveform}
                showCenterLine={true}
              />
              {/* <WaveformEditor sampleId={selectedForSettings[0]} />  */}
            </section>

            <section className={styles.controlsBox}>
              <Toggle
                label='Loop: CapsLock'
                isOn={isSpacebarPressed ? !loopState : loopState}
                onToggle={handleToggleLoop}
                type='loop'
              />
              {/* <p>
                Capslock on to lock loop. Spacebar to momentary switch loop
                mode.
              </p> */}
              <Toggle
                label='Hold: Tab'
                isOn={isSpacebarPressed ? !holdState : holdState}
                onToggle={handleToggleHold}
                type='hold'
              />
              {/* <p>Tab to toggle hold on / off. Disables release. </p> */}
              <Recorder resamplerMode={true} />
              {/* <p>Arm resample and play a note to re-sample. </p> */}
              <div className={styles.envelope}>
                <AmpEnvelopeControls />
                <BasicSlider
                  label='filterCutOff'
                  min={0}
                  max={22000}
                  step={1}
                  value={
                    getSampleSettings(selectedForSettings[0], 'Filter')
                      ?.lowCutoff
                  }
                  onChange={(value) =>
                    updateFilterSettings(selectedForSettings[0], {
                      highCutoff: value,
                    })
                  }
                />
              </div>
            </section>
          </div>
        )}

      <section className={styles.keyboardContainer}>
        <KeyboardGUI />
      </section>
    </div>
  );
}

/*
      <section className={styles.keyboardContainer}>
        <ToggleMenu label='Keyboard'>
          <KeyboardGUI />
        </ToggleMenu>
      </section>

      <section className={styles.samplesContainer}>
        <ToggleMenu label={isLoading ? 'Loading...' : 'Samples'}>
          {!isLoading && sampleRecords.length > 0 && (
            <List
              items={sampleRecords}
              title='Samples'
              paramName='samples'
              itemsPerPage={constants.SAMPLES_PER_PAGE}
              onDelete={(id: string) => deleteSample(id)}
              onSave={(id: string) => updateSample(id)}
            />
          )}
           <ToggleMenu label='Settings'>
            <SampleSettings />
          </ToggleMenu> 
        </ToggleMenu>  */

// useEffect(() => {
//   if (!isAudioReady) {
//     resumeAudioContext();
//   }
// }, [isAudioReady, resumeAudioContext]);

// const {
//   latestSelectedSample,

//   samplerEngine,
//   sampleRecords,
//   isLoading,
//   // saveAll,
//   updateSample,
//   deleteSample,
//   hasUnsavedSamples,
//   isLooping,
//   toggleLoop,
//   isHolding,
//   toggleHold,
// } = useSamplerCtx();

// if (!samplerEngine) {
//   console.error('SamplerEngine not initialized in Sampler component');
//   return null;
// }

// const { transposition, tuneOffset } =
//   latestSelectedSample?.sample_settings || {};
