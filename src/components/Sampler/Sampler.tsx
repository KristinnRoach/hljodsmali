'use client';

import React, { useCallback, useEffect, useState } from 'react';

// import Auth from '../Auth/Auth';

// import List from '../UI/List';
// import { useAudioCtxUtils } from '../../contexts/AudioCtxContext';
import { useSamplerEngine } from '../../contexts/EngineContext';
import useKeyboard from '../../hooks/useKeyboard';
import useKeyToggle from '../../hooks/utility/useKeyToggle';
import useKeyMomentary from '../../hooks/utility/useKeyMomentary';

import AudioDeviceSelector from './AudioDeviceSelector';
import Recorder from './Recorder';
import Tuner from './Tuner';
import AmpEnvelopeControls from './AmpEnvelope';

// import WaveformEditor from '../UI/WaveForms/WaveformEditor';

// import Waveform from '../UI/Waveform';
// import KeyboardGUI from '../UI/Keyboard/spline/KeyboardGUISpline';
// import Shapes from '../UI/Shapes/Shapes'; // TODO: Resolve "Multiple instances of Three.js being imported" warning (if persists)

import Toggle, { ToggleMenu } from '../UI/Basic/Toggle';
// import * as constants from '../../types/constants/constants';

import { Time_settings, Sample_settings } from '../../types/types';

import { DndContext } from '@dnd-kit/core';

import styles from './Sampler.module.scss';
// import WaveformWithMarkers from '../UI/Waveform/WaveAndMarkers';

export default function Sampler() {
  // const { isAudioReady, resumeAudioContext } = useAudioCtx();
  // const { ensureAudioContext } = useAudioCtxUtils();

  const {
    selectedSamples,
    focusedSettings,

    getSelectedBuffers,
    getBufferDuration,

    isLooping,
    toggleLoop,
    isHolding,
    toggleHold,

    updateTimeParam,
  } = useSamplerEngine();

  useKeyboard(); // adds event listeners for computer keyboard for playing notes

  /* TODO: move all this to useLoopHold hook ?  */

  const [loopState, setLoopState] = useState(false);
  const [holdState, setHoldState] = useState(false);

  type MomentaryMode = 'toggle-loop' | 'toggle-hold'; // could be more stuff :P // move to types.ts

  const [momentaryMode, setMomentaryMode] =
    useState<MomentaryMode>('toggle-loop'); // for spacebar when on computer keyboard

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
      if (momentaryMode === 'toggle-loop') {
        const newLoopState = toggleLoop();
        setLoopState(newLoopState);
      } else if (momentaryMode === 'toggle-hold') {
        const newHoldState = toggleHold();
        setHoldState(newHoldState);
      }
    },
    onRelease: () => {
      if (momentaryMode === 'toggle-loop') {
        const newLoopState = toggleLoop();
        setLoopState(newLoopState);
      } else if (momentaryMode === 'toggle-hold') {
        const newHoldState = toggleHold();
        setHoldState(newHoldState);
      }
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

  // const selectedTimeSettings = getSampleSettings(
  //   selectedForSettings[0],
  //   'time'
  // ) as Time_settings;

  // const bufferDuration = getBufferDuration(selectedForSettings[0]);

  // let markerConfigs = [];

  // if (selectedTimeSettings && bufferDuration > 0) {
  //   markerConfigs = [
  //     // MarkerConfig[] = [
  //     {
  //       initialPosition: selectedTimeSettings.startPoint / bufferDuration,
  //       min: 0,
  //       max: bufferDuration,
  //     },
  //     {
  //       initialPosition: selectedTimeSettings.loopStart / bufferDuration,
  //       min: 0,
  //       max: bufferDuration,
  //     },
  //     {
  //       initialPosition: selectedTimeSettings.loopEnd / bufferDuration,
  //       min: 0,
  //       max: bufferDuration,
  //     },
  //     {
  //       initialPosition: selectedTimeSettings.endPoint / bufferDuration,
  //       min: 0,
  //       max: bufferDuration,
  //     },
  //   ];
  // }

  // const onMarkersChange = useCallback(
  //   (index: number, newPosition: number) => {
  //     let settingKey: 'startPoint' | 'loopStart' | 'loopEnd' | 'endPoint';

  //     switch (index) {
  //       case 0:
  //         settingKey = 'startPoint';
  //         break;
  //       case 1:
  //         settingKey = 'loopStart';
  //         break;
  //       case 2:
  //         settingKey = 'loopEnd';
  //         break;
  //       case 3:
  //         settingKey = 'endPoint';
  //         break;
  //       default:
  //         console.error(`Invalid marker index: ${index}`);
  //         return;
  //     }

  //     updateTimeParam(settingKey, newPosition);
  //   },
  //   [updateTimeParam, selectedForSettings]
  // );

  //     <DndContext>
  return (
    <div className={styles.sampler}>
      <section className={styles.topBar}>
        {/* <Auth className={styles.loginContainer} />
        <Shapes className={styles.shapesContainer} /> */}
        <AudioDeviceSelector className={styles.deviceSelectorContainer} />
      </section>

      <section className={styles.controlsContainer}>
        <Tuner className={styles.tuner} />

        <Recorder resamplerMode={true} />
        <Recorder />

        <Toggle
          label='Loop'
          isOn={isSpacebarPressed ? !loopState : loopState}
          onToggle={handleToggleLoop}
          type='loop'
        />
        <Toggle
          label='Hold'
          isOn={isSpacebarPressed ? !holdState : holdState}
          onToggle={handleToggleHold}
          type='hold'
        />
      </section>

      {focusedSettings.size &&
        getBufferDuration(focusedSettings.keys().next().value) > 0 && (
          <>
            {/* <section className={styles.waveformContainer}>
              <ToggleMenu label='Waveform'>
                <WaveformWithMarkers
                  audioBuffer={getSelectedBuffers('settings')[0]}
                  vertical={false}
                  onMarkersChange={onMarkersChange}
                  markerConfigs={markerConfigs}
                />
                {/* <Waveform
                  sampleId={selectedForSettings[0]}
                  buffer={getSelectedBuffers('settings')[0]}
                  className={styles.waveform}
                  showCenterLine={true}
                /> */}
            {/* <WaveformEditor sampleId={selectedForSettings[0]} />  */}
            {/* </ToggleMenu>
            </section> */}

            <section className={styles.envelopeContainer}>
              <ToggleMenu label='Envelope'>
                <AmpEnvelopeControls />
              </ToggleMenu>
            </section>
          </>
        )}
    </div>
  );
}
// </DndContext>

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
