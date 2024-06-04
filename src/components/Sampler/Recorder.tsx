'use client'; // gæti virkað á server?

import { useRef, useState, useContext } from 'react';

import { AudioSrcCtx } from '@components/contexts/ctx';
import ConditionClassButton from '../Button/ConditionClassButton';

import styles from './Sampler.module.scss';

const Recorder: React.FC = ({}) => {
  const {
    ogAudioElement,
    audioSrcUrl,
    setAudioSrcUrl,
    globalLoopState,
    setGlobalLoopState,
  } = useContext(AudioSrcCtx);

  const audioFormat = 'audio/ogg';

  const [isRecording, setIsRecording] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const blobsRef = useRef<Blob[]>([]); // unnecessary? (only for recording)

  async function startRecording() {
    try {
      // Clear previously recorded audio blobs
      blobsRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          blobsRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const recordedBlob = await new Blob(blobsRef.current, {
          type: audioFormat,
        });
        const recordedUrl = await URL.createObjectURL(recordedBlob);
        setSampleUrl(recordedUrl);
        createNextVoice();

        blobsRef.current = []; // best place for it?
      };

      setIsRecording(true);
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  const stopRecording = () => {
    setIsRecording(false);

    const mrStream = mediaRecorderRef.current?.stream;
    if (mrStream) {
      mrStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
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
