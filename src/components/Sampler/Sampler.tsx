'use client';

import React from 'react';

import useKeyboard from '../../hooks/useKeyboard';
import Recorder from './Recorder';
import SampleSettings from './SampleSettings';
import LinkList from '../UI/LinkList';
import Shapes from '../UI/Shapes/Shapes';
import KeyboardGUI from '../UI/Keyboard/spline/KeyboardGUISpline';

import styles from './Sampler.module.scss';
import { useSamplerCtx } from '../../contexts/sampler-context';
import Toggle from '../UI/Basic/Toggle';
import MenuToggle from '../UI/Basic/MenuToggle';

export default function Sampler_cli() {
  const {
    samplerEngine,
    allSamples,
    isLoading,
    updateSample,
    deleteSample,
    isLooping,
    toggleLoop,
    isHolding,
    toggleHold,
  } = useSamplerCtx();

  useKeyboard();

  const [visualizer, setVisualizer] = React.useState<'shapes' | 'keyboard'>(
    'shapes'
  );

  function switchVisualizer(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    setVisualizer((prev) => (prev === 'shapes' ? 'keyboard' : 'shapes'));
  }

  return (
    <>
      <div className={styles.sampler}>
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

          <Recorder />
        </div>
        <section className={`${styles.sampleMenuBox} ${styles.clickable}`}>
          <MenuToggle label={isLoading ? 'Loading...' : 'Samples'}>
            {allSamples.length < 1 && (
              <p style={{ padding: '2rem' }}>
                No samples yet. Record something!
              </p>
            )}
            {!isLoading && allSamples.length > 0 && (
              <>
                <div className={`${styles.sampleListBox} ${styles.clickable}`}>
                  <LinkList
                    items={allSamples}
                    title='Samples'
                    paramName='samples'
                    itemsPerPage={10}
                    onDelete={(id) => deleteSample(id)}
                    onSave={(id) => updateSample(id)}
                  />
                </div>

                <div className={styles.settingsBox}>
                  <MenuToggle label='Settings'>
                    <div className={styles.paramsBox}>
                      <SampleSettings />
                    </div>
                  </MenuToggle>
                </div>
              </>
            )}
          </MenuToggle>
        </section>
      </div>
      <section className={styles.graphics}>
        {visualizer === 'shapes' && (
          <div className={styles.shapes}>
            <Shapes />
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
