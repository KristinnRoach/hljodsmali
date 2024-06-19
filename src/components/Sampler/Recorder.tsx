'use client';

import { useEffect, useRef, useState } from 'react';
import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useAudioDeviceCtx } from '../../contexts/audio-device-context';
import { useMediaSourceCtx } from '../../contexts/media-source-context';
import ConditionClassButton from '../UI/ConditionClassButton';

import styles from './Sampler.module.scss';
import { createSampleFromBlob } from '../../lib/samplesUtils';
import { blobToAudioBuffer, getAudioStream } from '../..//utils/record';
import { Sample } from '../../types';
import { start } from 'repl';

let stream: MediaStream;

const Recorder: React.FC = ({}) => {
  const { audioCtx } = useReactAudioCtx();
  const { inputID, outputID } = useAudioDeviceCtx();
  const { setNewAudioSrc } = useMediaSourceCtx();

  const analyser = useRef<AnalyserNode | null>(null);
  const [threshold, setThreshold] = useState(-60); // Adjust as needed (in dB)
  const [audioLevel, setAudioLevel] = useState(0);

  const [isRecording, setIsRecording] = useState<boolean>(false);

  /* RECORDING OPTIONS */

  const [maxDuration, setMaxDuration] = useState<number>(5000); // Default max recording length is 5 seconds
  const [durationMs, setDurationMs] = useState<number>(0); // Default duration is 0 ?

  const [audioFormat, setAudioFormat] = useState<string>(
    'audio/ogg; codecs=opus' // 'codecs=vorbis' vs opus vs annað?
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  /* RECORDING FUNCTIONS */

  function monitorAudioLevel(dataArray: Uint8Array) {
    analyser.current?.getByteFrequencyData(dataArray);
    const average =
      dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
    setAudioLevel(average);
    if (!isRecording && average > threshold) {
      startRecording();
    }
  }

  async function prepRecording() {
    const stream = await getAudioStream(inputID);
    if (!stream) {
      throw new Error('Could not get audio stream');
    }

    mediaRecorderRef.current = new MediaRecorder(stream);

    if (!mediaRecorderRef.current) {
      throw new Error('MediaRecorder not set');
    }

    const chunks: BlobPart[] = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: audioFormat });
      try {
        const sample = createSampleFromBlob(blob, 'new', 'new-sample');
        // setId(id + 1);
        const newBuffer = await blobToAudioBuffer(sample.sample_file, audioCtx);
        sample.buffer = newBuffer;
        setNewAudioSrc(sample);
      } catch (error) {
        console.error('Failed to convert blob to audio buffer:', error);
      } finally {
        chunks.length = 0;
        // clearInterval(monitorInterval);
        stopMediaStream(mediaRecorderRef!.current!.stream);
      }
    };

    startRecording();

    // // Create AnalyserNode to monitor audio level
    // analyser.current = audioCtx.createAnalyser();
    // analyser.current.fftSize = 256;
    // const bufferLength = analyser.current.frequencyBinCount;
    // const dataArray = new Uint8Array(bufferLength);

    // // Connect stream to AnalyserNode and AudioContext destination (speakers)
    // const source = audioCtx.createMediaStreamSource(stream);
    // source.connect(analyser.current);
    // analyser.current.connect(audioCtx.destination);

    // // Start monitoring audio level
    // const monitorInterval = setInterval(() => {
    //   monitorAudioLevel(dataArray);
    // }, 100); // Adjust interval as needed
  }

  function startRecording(): void {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'recording'
    ) {
      setIsRecording(true);
      try {
        mediaRecorderRef.current?.start();
      } catch (error) {
        console.error('Error starting audio recording:', error);
      }
    }
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
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
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

      await prepRecording(); // durationMs || maxDuration
    };
    performCountdown();
  };

  return (
    <>
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
    </>
  );
};

export default Recorder;

// useEffect(() => {
//   (async () => {
//     stream = await navigator.mediaDevices.getUserMedia({
//       video: false,
//       audio: {
//         echoCancellation: false,
//         noiseSuppression: false,
//         autoGainControl: false,
//         channelCount: 1,
//       },
//     });

//     if (!stream) {
//       throw new Error('Could not get audio stream');
//     }
//   })();
// }, [audioCtx, audioFormat, device]);

// const lowLatencyConstraints = {
//   video: false,
//   audio: {
//     echoCancellation: false,
//     noiseSuppression: false,
//     autoGainControl: false,
//     channelCount: 1,
//     suppressLocalAudio: true,
//     isLocalAudioSuppressed: true,
//     latency: 0,
//   },
// };
