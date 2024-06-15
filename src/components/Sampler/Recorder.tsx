'use client';

import { useEffect, useState } from 'react';
import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useMediaSourceCtx } from '../../contexts/media-source-context';
import ConditionClassButton from '../Button/ConditionClassButton';

import styles from './Sampler.module.scss';
import { blobToAudioBuffer } from '../../utils/record';

const Recorder: React.FC = ({}) => {
  const { setNewAudioSrc } = useMediaSourceCtx();
  const { audioCtx } = useReactAudioCtx();

  const [isRecording, setIsRecording] = useState<boolean>(false);

  /* RECORDING OPTIONS */

  const [maxDuration, setMaxDuration] = useState<number>(5000); // Default max recording length is 5 seconds
  const [durationMs, setDurationMs] = useState<number>(0); // Default duration is 0 ?

  const [audioFormat, setAudioFormat] = useState<string>(
    'audio/ogg; codecs=opus' // 'codecs=vorbis' vs opus vs annað?
  );

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  /* RECORDING FUNCTIONS */

  const lowLatencyConstraints = {
    video: false,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  };

  async function setMediaRecorderWithStream(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia(
      lowLatencyConstraints
    );
    if (!stream) {
      throw new Error('Could not get audio stream');
    }
    const newRecorder = new MediaRecorder(stream);
    if (!newRecorder) {
      throw new Error('Could not create MediaRecorder');
    }
    setMediaRecorder(newRecorder);
  }

  useEffect(() => {
    if (isRecording && !mediaRecorder) {
      throw new Error('Could not set MediaRecorder');
    }
    async function startRecordAudioBuffer(): Promise<void> {
      try {
        if (!mediaRecorder) {
          throw new Error('MediaRecorder not set');
        }
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: audioFormat });
          try {
            const newBuffer = await blobToAudioBuffer(blob, audioCtx);
            setNewAudioSrc(newBuffer);
          } catch (error) {
            console.error('Failed to convert blob to audio buffer:', error);
          } finally {
            chunks.length = 0;
            stopMediaStream(mediaRecorder.stream);
          }
        };
        mediaRecorder.start();
      } catch (error) {
        console.error('Error starting audio recording:', error);
      }
    }

    if (isRecording) {
      startRecordAudioBuffer();
    }
  }, [mediaRecorder]);

  async function start() {
    await setMediaRecorderWithStream();
    setIsRecording(true);
    // startRecordAudioBuffer(); // durationMs || maxDuration
    // setTimeout(() => stop(), durationMs || maxDuration);
  }

  function stopMediaStream(stream: MediaStream) {
    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.readyState == 'live') {
          track.stop();
        }
      });
    }
  }

  const stopRecording = () => {
    setIsRecording(false);
    console.log(
      mediaRecorder,
      'stop entered, mediaRecorder.state: ',
      mediaRecorder?.state
    );
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
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

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setIsRecording(true);
      await start();
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
