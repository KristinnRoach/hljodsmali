'use client'; // gæti virkað á server?

import { useState, useContext } from 'react';

import { AudioSrcCtx } from '@components/contexts/ctx';
import ConditionClassButton from '../Button/ConditionClassButton';

import styles from './Sampler.module.scss';
import {
  blobToAudioBuffer,
  recordAudioBlob,
} from '@components/contexts/record';
import { playAudioBuffer } from '@components/contexts/play';

const Recorder: React.FC = ({}) => {
  const {
    ogAudioElement,
    audioSrcUrl,
    setAudioSrcUrl,
    globalLoopState,
    setGlobalLoopState,
  } = useContext(AudioSrcCtx);

  const [blob, setBlob] = useState<Blob>();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  async function startRecording() {
    const newBlob = await recordAudioBlob();
    // setBlob(newBlob);
    const recordedUrl = await URL.createObjectURL(newBlob);
    setAudioSrcUrl(recordedUrl);

    console.log('blob: ', newBlob);
    console.log('recordedUrl: ', recordedUrl);

    const audioBuffer = await blobToAudioBuffer(newBlob);

    playAudioBuffer(audioBuffer);
  }

  const stopRecording = () => {
    // setIsRecording(false);
    // const mrStream = mediaRecorderRef.current?.stream;
    // if (mrStream) {
    //   mrStream.getTracks().forEach((track) => {
    //     track.stop();
    //   });
    // }
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

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsRecording(true);
      startRecording(); // await?
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
      falseClick={stopRecording}
    />
  );
};

export default Recorder;
