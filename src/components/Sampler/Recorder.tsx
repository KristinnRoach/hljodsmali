'use client';

import { useState, useContext } from 'react';
import { AudioSrcCtx } from '../../contexts/ctx';
import ConditionClassButton from '../Button/ConditionClassButton';

import styles from './Sampler.module.scss';

const Recorder: React.FC = ({}) => {
  const { startRecording, stopRecording } = useContext(AudioSrcCtx);

  const [isRecording, setIsRecording] = useState<boolean>(false);

  /* RECORDING OPTIONS */

  const [maxDuration, setMaxDuration] = useState<number>(5000); // Default max recording length is 5 seconds

  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [audioFormat, setAudioFormat] = useState<string | null>(null);

  /* RECORDING FUNCTIONS */

  async function start() {
    setIsRecording(true);
    startRecording(); // durationMs || maxDuration
    setTimeout(() => stop(), durationMs || maxDuration);
  }

  const stop = () => {
    stopRecording();
    setIsRecording(false);
  };

  const countdownAndRecord = async () => {
    const countdownSteps = [3, 2, 1];

    const renderCountdownStep = (step: number) => {
      const recordButton = document.getElementById('record-button'); // gera state í staðinn
      if (recordButton && recordButton.textContent) {
        recordButton.textContent = step.toString();
      }
    };

    const performCountdown = async () => {
      for (const step of countdownSteps) {
        renderCountdownStep(step);

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setIsRecording(true);
      start(); // await?
    };
    performCountdown();
  };

  return (
    <ConditionClassButton
      id='record-button'
      condition={!isRecording}
      baseClassName={styles.samplerButton}
      trueClassName={styles.recordingOff}
      falseClassName={styles.recordingOn}
      trueContent='&#x23FA;'
      falseContent='&#x23F9;'
      trueClick={countdownAndRecord}
      falseClick={stop}
    />
  );
};

export default Recorder;
