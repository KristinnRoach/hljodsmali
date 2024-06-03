'use client';

import { useEffect, useRef, useState, useContext } from 'react';

import { AudioSrcCtx } from '@components/contexts/ctx';
import { Sample, Voice, KeyMap } from '../../types';
import { keyMap } from '../../utils/keymap';
import ConditionClassButton from '../Button/ConditionClassButton';
import Samples from '../Samples/Samples';
import styles from './Sampler.module.scss';

const Sampler: React.FC = ({}) => {
  const {
    ogAudioElement,
    audioSrcUrl,
    setAudioSrcUrl,
    globalLoopState,
    setGlobalLoopState,
  } = useContext(AudioSrcCtx);

  const audioFormat = 'audio/ogg';
  const trimStartMs = 200;
  const trimEndMs = 400;

  const [isRecording, setIsRecording] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const blobsRef = useRef<Blob[]>([]); // unnecessary? (only for recording)

  const voicesRef = useRef<Voice[]>([]);

  const latestVoice = (): Voice => {
    return voicesRef.current[voicesRef.current.length - 1];
  };

  const keysPressedRef = useRef<string[]>([]);

  const [loopState, setLoopState] = useState<boolean>(false); // leysa per voice með type

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    const note: number | undefined = keyMap[key];

    if (!keysPressedRef.current.includes(key) && note) {
      // for avoiding retriggers
      keysPressedRef.current.push(key);
      playSample(note);
      // const pitch = 2 ** ((note - 60) / 12);
      // playAudio(pitch);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.code;
    const note = keyMap[key];
    keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
  };

  function onPause(thisVoice: Voice) {
    if (!thisVoice.isLooping && voicesRef) {
      // thisVoice.audioEl.removeEventListener('pause', onPause); // unneccessary?
      voicesRef.current = voicesRef.current.filter((c) => c !== thisVoice);
    } else {
      thisVoice.audioEl.currentTime = trimStartMs / 1000;
      thisVoice.audioEl.play();
    }
  }

  function onPlay(thisVoice: Voice) {
    setTimeout(() => {
      thisVoice.audioEl.pause();
      console.log('timeout paused: ', thisVoice.pauseTime);
    }, thisVoice.pauseTime);
  }

  const playSample = (note: number) => {
    const voice = latestVoice();
    if (voice && voice.audioEl) {
      voice.audioEl.playbackRate = 2 ** ((note - 60) / 12);
      // voice.pauseTime =
      //   (voice.audioEl.duration * 1000) / voice.audioEl.playbackRate -
      //   trimEndMs / voice.audioEl.playbackRate;
      voice.audioEl.play();
      prepPlayback();
    } else {
      console.error('latestVoice() is null');
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

  function setAudioElSrc(sampleUrl: string): void {
    // if (audioElementRef.current) {
    //   if (audioElementRef.current.src) {
    //     URL.revokeObjectURL(audioElementRef.current.src);
    //   }
    //   audioElementRef.current.src = sampleUrl;
    setAudioSrcUrl(sampleUrl);
    prepPlayback();
    // } else {
    //   console.error('audioElementRef.current is null');
    // }
  }

  function prepPlayback() {
    if (ogAudioElement.current) {
      const clone = ogAudioElement.current.cloneNode(true) as HTMLAudioElement;
      if (clone) {
        const thisVoice = {
          audioEl: clone,
          pauseTime: 2000, // fallback
          isLooping: false,
        };
        setGlobalLoopState(false);
        thisVoice.audioEl.currentTime = trimStartMs / 1000;
        thisVoice.audioEl.preservesPitch = false;
        thisVoice.audioEl.addEventListener('pause', () => {
          onPause(thisVoice);
        });
        // thisVoice.audioEl.addEventListener('play', () => {
        //   onPlay(thisVoice);
        // });
        voicesRef.current.push(thisVoice);
        console.log('latest voice:', latestVoice().audioEl);
      } else {
        console.error('Failed to clone audio element');
      }
    } else {
      console.error('audioElementRef.current is null');
    }
  }

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
        setAudioElSrc(recordedUrl);

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

  const chooseSample = (audioUrl: string) => {
    if (audioUrl) {
      setAudioElSrc(audioUrl);
      //prepPlayback(audioUrl);
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

  const toggleLoop = (): void => {
    if (latestVoice().isLooping) {
      latestVoice().isLooping = false;
      setLoopState(false);
    } else if (!latestVoice().isLooping) {
      latestVoice().isLooping = true;
      setLoopState(true);
    }
  };

  return (
    <>
      {/* <audio
        ref={ogAudioElement}
        preload='auto' // henda?
      ></audio> */}
      <div className={styles.wrapper}>
        <div className={styles.controlsBox}>
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
        </div>

        <div>
          <Samples
            handleChooseSample={chooseSample}
            currentSampleUrl={ogAudioElement.current?.src || ''}
          />
        </div>
      </div>
    </>
  );
};

export default Sampler;

// useEffect(() => {
//   if (droppedAudioUrl && audioElementRef.current) {
//     blobsRef.current = [];
//     if (audioElementRef.current.src) {
//       URL.revokeObjectURL(audioElementRef.current.src);
//     }
//     audioElementRef.current.src = droppedAudioUrl;
//     setAudioUrl(droppedAudioUrl);
//   }
// }, [droppedAudioUrl]);
