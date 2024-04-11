'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
// import { PitchDetector } from 'pitchy';

import { Sample, KeyMap } from '../../types';
import { keyMap } from '../../utils/keymap';
import { fetchBlobFromUrl } from '../../utils/fetch';
import ConditionClassButton from '../Button/ConditionClassButton';
import Samples from '../Samples/Samples';
import styles from './Sampler.module.scss';

const Sampler: React.FC<{ droppedAudioUrl?: string }> = ({
  droppedAudioUrl,
}) => {
  const audioFormat = 'audio/ogg';

  const [audioElementSrc, setAudioElementSrc] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const voicesRef = useRef<HTMLAudioElement[]>([]);
  const loopEnabledRef = useRef<boolean>(false);
  const keysPressedRef = useRef<string[]>([]);

  const onAudioPause = useCallback((event: Event) => {
    const sample = event.target as HTMLAudioElement;
    if (!loopEnabledRef.current) {
      sample.pause();
      sample.currentTime = 0;
      sample.removeEventListener('pause', onAudioPause);
      voicesRef.current = voicesRef.current.filter((c) => c !== sample);
    } else {
      sample.play();
    }
  }, []);

  const playSample = (note: number, key: string) => {
    if (audioElementRef.current) {
      const audioElement = audioElementRef.current;
      audioElement.preservesPitch = false;

      const thisVoice = audioElementRef.current?.cloneNode(
        true
      ) as HTMLAudioElement;

      if (thisVoice) {
        thisVoice.preservesPitch = false;
        thisVoice.playbackRate = 2 ** ((note - 60) / 12);
        voicesRef.current.push(thisVoice);
        thisVoice.play();
        thisVoice.addEventListener('pause', onAudioPause);
        // clone.addEventListener('ended', onAudioEnded);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    const note: number | undefined = keyMap[key];

    if (note && !keysPressedRef.current.includes(key)) {
      keysPressedRef.current.push(key);
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
      const clone = voicesRef.current.find(
        (c) => c.dataset.note === note.toString()
      );
      if (clone) {
        stopSample(clone);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      // Clear previously recorded audio blobs
      blobsRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // gera useState eða ref?
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          blobsRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const recordedBlob = new Blob(blobsRef.current, { type: audioFormat });
        prepPlayback(recordedBlob);
      };

      setIsRecording(true);
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  function prepPlayback(blob: Blob) {
    const recordedUrl = URL.createObjectURL(blob);
    setAudioElementSrc((prevState) => {
      if (prevState) {
        URL.revokeObjectURL(prevState);
      }
      return recordedUrl;
    });
    // const voice = audioElementRef.current?.cloneNode(true) as HTMLAudioElement;
    if (audioElementRef.current) {
      audioElementRef.current.preservesPitch = false;
    }
  }

  const stopRecording = async () => {
    setIsRecording(false);

    const mrStream = mediaRecorderRef.current?.stream;
    if (mrStream) {
      mrStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // Close the audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const chooseSample = (audioUrl: string) => {
    if (audioUrl) {
      blobsRef.current = [];
      setAudioElementSrc(audioUrl);
      setLoopState(false);
    }
  };

  useEffect(() => {
    if (droppedAudioUrl) {
      chooseSample(droppedAudioUrl);
    }
  }, [droppedAudioUrl]);

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
      startRecording();
    };
    performCountdown();
  };

  const stopSample = (sample: HTMLAudioElement) => {
    if (sample) {
      sample.pause();
      sample.currentTime = 0;
    }
  };

  const stopAllSamples = (event: Event) => {
    const sample = event.target as HTMLAudioElement;
    stopSample(sample);
    voicesRef.current = voicesRef.current.filter((c) => c !== sample);
  };

  const [loopState, setLoopState] = useState<boolean>(false);

  const toggleLoop = (): void => {
    console.log(voicesRef.current.toString());

    loopEnabledRef.current = !loopEnabledRef.current; // key eða id til að identify-a sampl
    setLoopState(!loopState);

    if (!loopEnabledRef.current) {
      voicesRef.current.forEach((clone, index) => {
        clone.addEventListener('pause', stopAllSamples);
        clone.addEventListener('ended', stopAllSamples);
      });
      voicesRef.current = [];
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
        {/* <PitchDetection /> */}

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
