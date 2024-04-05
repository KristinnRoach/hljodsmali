'use client';

import { useEffect, useRef, useState } from 'react';
import PocketBase from 'pocketbase';

import { keyMap } from '../../utils/keymap';
import ConditionClassButton from '../Button/ConditionClassButton';
import styles from './SamplerComp.module.scss';
import { createSample, fetchSamples, deleteSample } from '../../db/db_samples';
import { Sample, KeyMap } from '../../types';

const SamplerComp: React.FC = () => {
  const audioFormat = 'audio/ogg';
  const pocketBase = new PocketBase('http://127.0.0.1:8090/');

  const audioContextRef = useRef<AudioContext | null>(null);

  const [audioElementSrc, setAudioElementSrc] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [userSamples, setUserSamples] = useState<Sample[]>([]);

  const loopEnabledRef = useRef<boolean>(false);

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const clonesRef = useRef<HTMLAudioElement[]>([]);

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

  async function loadUserSamples() {
    const sampleObjArray = await fetchSamples();
    setUserSamples(sampleObjArray);
  }

  const handleSave = async (): Promise<void> => {
    if (blobsRef.current[0]) {
      const name = prompt('Enter a name for the sample:');

      if (name !== null && name.trim() !== '') {
        await createSample(name, blobsRef.current[0]);
        await loadUserSamples();
      } else {
        console.error('Invalid name or cancelled.');
        alert('Invalid name or cancelled.');
      }
    } else {
      console.error('No recorded audio blobs found');
    }
  };

  const chooseSample = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const clicked = (event.target as HTMLElement)
      ?.nextSibling as HTMLAudioElement;
    if (clicked && clicked.tagName === 'AUDIO') {
      setAudioElementSrc(clicked.src);
    }
  };

  const [showSampleList, setShowSampleList] = useState<boolean>(false);

  const toggleShowSamples = (): void => {
    loadUserSamples();
    setShowSampleList((prevShowSampleList) => !prevShowSampleList);
  };

  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    const sampleId: string = event.currentTarget.id;

    if (sampleId) {
      try {
        await deleteSample(sampleId);
        await loadUserSamples();
      } catch {
        console.error('Delete sample failed');
        alert('Delete sample failed');
      }
    }
  }

  const downloadAudio = () => {
    if (audioElementSrc) {
      const link = document.createElement('a');
      link.href = audioElementSrc;
      link.download = 'sample-hljodsmali.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
    <div className={styles.samplerWrapper}>
      <div className={styles.samplerBtnsContainer}>
        <ConditionClassButton
          condition={!isRecording}
          baseClassName={styles.samplerButton}
          trueClassName={styles.recordingOff}
          falseClassName={styles.recordingOn}
          trueContent="&#x23FA;"
          falseContent="&#x23F9;"
          trueClick={startRecording}
          falseClick={stopRecording}
        />

        {audioElementSrc && (
          <>
            <ConditionClassButton
              condition={loopState}
              baseClassName={loopState ? styles.loopOn : styles.loopOff}
              trueClick={toggleLoop}
              falseClick={toggleLoop}
              trueContent="&#x1F501;" // "∞"
              falseContent="&#x1F502;" // "! ∞"
            />
            <button onClick={handleSave}>&#x1F4BE;</button>
            <button className={styles.downloadButton} onClick={downloadAudio}>
              &#x2B07;
            </button>
            <audio ref={audioElementRef} src={audioElementSrc}></audio>
          </>
        )}

        <button onClick={toggleShowSamples}>🎵</button>
      </div>

      <ul className={styles.samplesList}>
        {showSampleList &&
          userSamples.map((sample, index) => (
            <li key={index}>
              <button onClick={chooseSample} className={styles.singleSample}>
                {sample.name}
                <button
                  onClick={handleDelete}
                  id={sample.id}
                  className={styles.deleteButton}
                >
                  x
                </button>
              </button>
              <audio src={sample.audioUrl}></audio>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default SamplerComp;
