'use client';

import { useEffect, useRef, useState } from 'react';

import { Sample, Voice, KeyMap } from '../../types';
import { keyMap } from '../../utils/keymap';
import Samples from '../Samples/Samples';
import styles from './Sampler.module.scss';

const Sampler: React.FC<{
  setSampleUrl?: any
}> = ({ setSampleUrl }) => {


  return (
    <>
     {/* <div className={styles.wrapper}>
        <div className={styles.controlsBox}>
          <ConditionClassButton
            id="record-button"
            condition={!isRecording}
            baseClassName={styles.samplerButton}
            trueClassName={styles.recordingOff}
            falseClassName={styles.recordingOn}
            trueContent="&#x23FA;"
            falseContent="&#x23F9;"
            trueClick={countdownAndRecord}
            falseClick={stopRecording}
          />

          { <ConditionClassButton
            condition={loopState}
            baseClassName={styles.samplerButton}
            trueClassName={styles.loopOn}
            falseClassName={styles.loopOff}
            trueClick={toggleLoop}
            falseClick={toggleLoop}
            trueContent="∞: on" // "&#x1F501;"
            falseContent="∞: off" // "&#x1F502;"
          /> }
        </div>

        <div>
         <Samples
            handleChooseSample={chooseSample}
            currentSampleUrl={audioElementRef.current?.src || ''}
          /> 
        </div>
      </div>  */}
    </>
  );
};

export default Sampler;
