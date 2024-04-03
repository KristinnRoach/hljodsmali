'use client';

import { useEffect, useRef, useState } from 'react';

import { keyMap } from '../../utils/keymap.js';
import ConditionClassButton from '../Button/ConditionClassButton';
import styles from './SamplerComp.module.scss';

//  CLEAR OLD SAMPLE WHEN RE-RECORDING

const SamplerComp: React.FC = () => {
  // const dataType = "video/webm";

  const [audioElementSrc, setAudioElementSrc] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [holdOn, setHoldOn] = useState(false);

  // const loopEnabled = useRef<boolean>(false);

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const clonesRef = useRef<HTMLAudioElement[]>([]);

  const keysPressedRef = useRef<string[]>([]);

  useEffect(() => {
    const playSample = (note: number) => {
      if (audioElementSrc) {
        const audioElement = audioElementRef.current;
        // audioElement.loop = loopEnabled;
        audioElement.preservesPitch = false;

        // if (clonesRef.current.length === 0 && audioElement.ended) {
        //   // Reuse the existing audio element if it's not currently playing
        //   audioElement.currentTime = 0;
        //   //   audioElement.preservesPitch = false; // unecessary?
        //   audioElement.playbackRate = 2 ** ((note - 60) / 12);
        //   audioElement.play();
        // } else {
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
        // }
      }
    };

    const onAudioEnded = (event: Event) => {
      const clone = event.target as HTMLAudioElement;
      stopSample(clone);

      if (loopEnabled) {
        // .current ef ref
        clone.play();
        clone.addEventListener('ended', onAudioEnded);
      } else {
        clone.removeEventListener('ended', onAudioEnded);
        clonesRef.current = clonesRef.current.filter((c) => c !== clone);
      }
    };

    const stopSample = (sample: HTMLAudioElement) => {
      if (sample) {
        sample.pause();
        sample.currentTime = 0;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      const note = keyMap[key];

      if (note) {
        // && !keysPressedRef.current.includes(key)
        keysPressedRef.current.push(key);
        // event.preventDefault();
        playSample(note);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.code;
      const note = keyMap[key];
      keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
      console.log('keysPressedRef.current: ' + keysPressedRef.current);
      if (!holdOn && note) {
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
    // document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // document.removeEventListener('keyup', handleKeyUp);
    };
  }, [audioElementSrc, holdOn, loopEnabled]); //

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // echoCancelation?

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioElementSrc(url);
        // Clear recorded audio chunks after creating the audio source URL
        chunksRef.current = [];
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
    }
  };

  const toggleLoop = () => {
    if (loopEnabled) {
      clonesRef.current.forEach((clone) => {
        stopSample(clone);
        clone.removeEventListener('ended', onAudioEnded);
      });
      clonesRef.current = [];
    }
    setLoopEnabled(!loopEnabled);
    // loopEnabled.current = !loopEnabled.current;
  };

  const toggleHold = () => {
    setHoldOn(!holdOn);
  };

  // Þegar slekk á loop eða hold triggera release á sömplum svo hættiiii!

  return (
    <div className={styles.samplerBtnsContainer}>
      <ConditionClassButton
        id="record-button"
        condition={!isRecording}
        baseClassName={styles.samplerButton}
        trueClassName={styles.recordingOff}
        falseClassName={styles.recordingOn}
        trueContent="Record!"
        falseContent="  Stop "
        trueClick={startRecording}
        falseClick={stopRecording}
      />
      <ConditionClassButton
        id="loop-button"
        condition={loopEnabled} // .current
        baseClassName={styles.samplerButton}
        trueClick={toggleLoop}
        falseClick={toggleLoop}
        trueClassName={styles.loopOn}
        falseClassName={styles.loopOff}
        trueContent="∞ !"
        falseContent="! ∞"
        inactive={!audioElementSrc}
      />
      <ConditionClassButton
        id="hold-button"
        condition={holdOn}
        baseClassName={styles.samplerButton}
        trueClick={toggleHold}
        falseClick={toggleHold}
        trueClassName={styles.holdOn}
        falseClassName={styles.holdOff}
        trueContent="Hold On !"
        falseContent="Hold Off !"
        inactive={!audioElementSrc}
      />
      <audio ref={audioElementRef} src={audioElementSrc}></audio>
    </div>
  );
};

export default SamplerComp;
