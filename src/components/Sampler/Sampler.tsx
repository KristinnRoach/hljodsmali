'use client';

import { useEffect, useRef, useState } from 'react';

import { Sample, KeyMap } from '../../types';
import { keyMap } from '../../utils/keymap';
import { fetchBlobFromUrl } from '../../utils/fetch';
import ConditionClassButton from '../Button/ConditionClassButton';
import Samples from '../Samples/Samples';
import styles from './Sampler.module.scss';

const Sampler: React.FC<{ droppedAudioUrl: string }> = ({
  droppedAudioUrl,
}) => {
  const audioFormat = 'audio/ogg';

  const [audioElementSrc, setAudioElementSrc] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const clonesRef = useRef<HTMLAudioElement[]>([]);
  const loopEnabledRef = useRef<boolean>(false);
  const keysPressedRef = useRef<string[]>([]);

  useEffect(() => {
    const playSample = (note: number, key: string) => {
      if (audioElementRef.current) {
        const audioElement = audioElementRef.current;
        audioElement.preservesPitch = false;

        const clone = audioElementRef.current?.cloneNode(
          true
        ) as HTMLAudioElement;

        if (clone) {
          clone.preservesPitch = false;
          clone.playbackRate = 2 ** ((note - 60) / 12);
          clonesRef.current.push(clone);
          clone.play();
          clone.addEventListener('ended', onAudioEnded);
        }
      }
    };

    const onAudioEnded = (event: Event) => {
      const sample = event.target as HTMLAudioElement;
      if (!loopEnabledRef.current) {
        sample.pause();
        sample.currentTime = 0;
        sample.removeEventListener('ended', onAudioEnded);
        clonesRef.current = clonesRef.current.filter((c) => c !== sample);
      } else {
        sample.play();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      const note: number | undefined = keyMap[key];

      if (note && !keysPressedRef.current.includes(key)) {
        keysPressedRef.current.push(key);
        // event.preventDefault();
        playSample(note, key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.code;
      const note = keyMap[key];
      keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
      console.log('keysPressedRef.current: ' + keysPressedRef.current);
      if (loopEnabledRef.current && note) {
        // annars feid?
        const clone = clonesRef.current.find(
          (c) => c.dataset.note === note.toString()
        );
        if (clone) {
          stopSample(clone);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [audioElementSrc]);

  const startRecording = async () => {
    try {
      // Clear previously recorded audio blobs
      blobsRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // gera ref?
      // const audioContext = new AudioContext();
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          blobsRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(blobsRef.current, { type: audioFormat });
        setAudioElementSrc((prevState) => {
          if (prevState) {
            URL.revokeObjectURL(prevState);
          }
          return URL.createObjectURL(blob);
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const countdownAndRecord = async () => {
    const countdownSteps = [3, 2, 1];

    const renderCountdownStep = (step) => {
      document.getElementById('record-button').textContent = step.toString();
    };

    const performCountdown = async () => {
      for (const step of countdownSteps) {
        renderCountdownStep(step);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      startRecording();
    };
    performCountdown();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Close the audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const chooseSample = (audioUrl: string) => {
    if (audioUrl) {
      blobsRef.current = [];
      setAudioElementSrc(audioUrl);
    }
  };

  useEffect(() => {
    if (droppedAudioUrl) {
      chooseSample(droppedAudioUrl);
    }
  }, [droppedAudioUrl]);

  const stopSample = (sample: HTMLAudioElement) => {
    if (sample) {
      sample.pause();
      sample.currentTime = 0;
    }
  };

  const stopAllSamples = (event: Event) => {
    const sample = event.target as HTMLAudioElement;
    stopSample(sample);
    clonesRef.current = clonesRef.current.filter((c) => c !== sample);
  };

  const [loopState, setLoopState] = useState<boolean>(false);

  const toggleLoop = (): void => {
    loopEnabledRef.current = !loopEnabledRef.current;
    setLoopState(!loopState);

    if (!loopEnabledRef.current) {
      clonesRef.current.forEach((clone, index) => {
        clone.addEventListener('ended', stopAllSamples);
      });
      clonesRef.current = [];
    }
  };

  return (
    <div className={styles.wrapper}>
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

        {audioElementSrc && (
          <>
            <ConditionClassButton
              condition={loopState}
              baseClassName={styles.samplerButton}
              trueClassName={styles.loopOn}
              falseClassName={styles.loopOff}
              trueClick={toggleLoop}
              falseClick={toggleLoop}
              trueContent="&#x1F501;" // "∞"
              falseContent="&#x1F502;" // "! ∞"
            />
            <audio ref={audioElementRef} src={audioElementSrc}></audio>
          </>
        )}
      </div>

      <Samples
        chooseSample={chooseSample}
        currentSampleBlob={blobsRef.current[0]} // should this be state or ref??
        currentSampleUrl={audioElementSrc}
      />
    </div>
  );
};

export default Sampler;
