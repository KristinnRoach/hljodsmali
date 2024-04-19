'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import $ from 'jquery';

import { Sample, Voice, KeyMap } from '../../types';
import { keyMap } from '../../utils/keymap';
import { fetchBlobFromUrl } from '../../utils/fetch';
import ConditionClassButton from '../Button/ConditionClassButton';
import Samples from '../Samples/Samples';
import styles from './Sampler.module.scss';

const Sampler: React.FC<{
  droppedAudioUrl?: string;
}> = ({ droppedAudioUrl }) => {
  const audioFormat = 'audio/ogg';

  const [droppedUrlState, setDroppedUrlState] = useState<string | null>(
    droppedAudioUrl | null
  );

  /*
  if (droppedAudioUrl !== droppedUrlState) {
    setDroppedUrlState(droppedAudioUrl);
    prepPlayback(droppedAudioUrl);
  }
*/

  // const [audioElementSrc, setAudioElementSrc] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const urlRef = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const blobsRef = useRef<Blob[]>([]); // óþarfi að hafa ref?

  const voicesRef = useRef<HTMLAudioElement[]>([]); // hægt að leysa með type?
  const keysPressedRef = useRef<string[]>([]);

  const loopEnabledRef = useRef<boolean>(false); // henda, global loop óþarfi í bili
  const [loopState, setLoopState] = useState<boolean>(false); // leysa per voice með type

  const [fadeInTime, setFadeInTime] = useState(50);
  const fadeInTimeRef = useRef(50);
  // const [fadeOutTime, setFadeOutTime] = useState(50);
  // const fadeOutTimeRef = useRef(50);

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    const note: number | undefined = keyMap[key];

    if (note && !keysPressedRef.current.includes(key)) {
      keysPressedRef.current.push(key);
      playSample(note); // fadeInTimeRef.current, fadeOutTimeRef.current
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.code;
    const note = keyMap[key];
    keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
    if (loopEnabledRef.current && note) {
      const clone = voicesRef.current.find(
        (c) => c.dataset.note === note.toString()
      );
      if (clone) {
        stopSample(clone);
      }
    }
  };

  const handleFadeInChange = (event) => {
    const newFadeInTime = parseInt(event.target.value);
    setFadeInTime(newFadeInTime);
    fadeInTimeRef.current = newFadeInTime;
  };

  const handleFadeOutChange = (event) => {
    const newFadeOutTime = parseInt(event.target.value);
    setFadeOutTime(newFadeOutTime);
    fadeOutTimeRef.current = newFadeOutTime;
  };

  function onPause(sample: HTMLAudioElement) {
    if (!loopEnabledRef.current) {
      sample.currentTime = 0;
      sample.removeEventListener('pause', onPause);
      voicesRef.current = voicesRef.current.filter((c) => c !== sample);
    } else {
      //     thisVoice.currentTime = 0;

      sample.play();
      //     $(thisVoice).animate({ volume: 1 }, fadeInTime); // þarf að bæta við fade out aftur
      //     fadeOutSample(thisVoice);
    }
  }
  /*

  function onPlay(sample: HTMLAudioElement) {}

  function fadeOutSample(thisVoice) {
    setTimeout(() => {
      $(thisVoice).animate({ volume: 0 }, fadeOutTime); // RELEASE
    }, startFadeTime);

    setTimeout(() => {
      thisVoice.pause();
      voicesRef.current = voicesRef.current.filter((c) => c !== thisVoice); // nóg clean-up?
    }, endFadeTime);
  }
*/

  const playSample = (
    note: number
    // fadeInTime: number,
    // fadeOutTime: number
  ) => {
    if (audioElementRef.current) {
      console.log(
        'refCurrent.src: ' + audioElementRef.current.src + ' og  ' + urlRef
      );

      const thisVoice = audioElementRef.current.cloneNode(
        true
      ) as HTMLAudioElement;

      thisVoice.preservesPitch = false;
      thisVoice.playbackRate = 2 ** ((note - 60) / 12);

      voicesRef.current.push(thisVoice);

      //thisVoice.volume = 0;
      thisVoice.play();
      // $(thisVoice).animate({ volume: 1 }, fadeInTimeRef.current); // ATTACK
    } // if audioelementref end - gera else { error eikkað }
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

  function prepPlayback(sampleUrl: string) {
    if (audioElementRef.current) {
      const ref = audioElementRef.current;
      if (ref.src) {
        URL.revokeObjectURL(ref.src);
      }
      ref.src = sampleUrl;
      urlRef.current = ref.src;
      //setAudioElementSrc(sampleUrl);

      ref.addEventListener('pause', onPause);

      // wait for 'duration' metadata to be loaded
      ref.onloadedmetadata = function () {
        // const durationMs = (ref.duration * 1000) / currentSample.playbackRate;
        ref.preservesPitch = false;
        //const startFadeTime = durationMs / 2;
        //const endFadeTime = startFadeTime + fadeOutTime;

        //ref.addEventListener('play', onPlay);
        ref.addEventListener('pause', onPause);

        // fadeOutSample(thisVoice);
      };
    }
  }

  async function startRecording() {
    try {
      // Clear previously recorded audio blobs
      blobsRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // gera useState eða ref?
      // const source = ctx.createMediaStreamSource(stream); // þarf bara til að processa?
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
        console.log('call prep playback from recorder onstop');
        prepPlayback(recordedUrl);

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
      prepPlayback(audioUrl);
      // blobsRef.current = [];
      // setAudioElementSrc(audioUrl);
      //setLoopState(false);
    }
  };

  // useEffect(() => {
  //   if (droppedAudioUrl) {
  //     // blobsRef.current = [];
  //     // setAudioElementSrc(droppedAudioUrl);
  //     // setLoopState(false);
  //     chooseSample
  //   }
  // }, [droppedAudioUrl]);

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

  const toggleLoop = (): void => {
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

        {urlRef && (
          <>
            <ConditionClassButton
              condition={loopState}
              baseClassName={styles.samplerButton}
              trueClassName={styles.loopOn}
              falseClassName={styles.loopOff}
              trueClick={toggleLoop}
              falseClick={toggleLoop}
              trueContent="∞: on" // "&#x1F501;"
              falseContent="∞: off" // "&#x1F502;"
            />
            <audio
              ref={audioElementRef}
              // src={audioElementSrc} ætti að vera í audioElementRef.src
              // preload="auto"
            ></audio>
          </>
        )}

        {/*
        <label htmlFor="fadeInRange">Fade In: {fadeInTimeRef.current}</label>
        <input
          type="range"
          id="fadeInRange"
          name="fadeInRange"
          min="100"
          max="5000"
          step="100"
          value={fadeInTimeRef.current}
          onChange={handleFadeInChange}
        />

       <label htmlFor="fadeOutRange">Fade Out: {fadeOutTimeRef.current}</label>
        <input
          type="range"
          id="fadeOutRange"
          name="fadeOutRange"
          min="100"
          max="5000"
          step="100"
          value={fadeOutTimeRef.current}
          onChange={handleFadeOutChange}
      /> */}

        {/* <div
          id="wave-container"
          className={styles.waveContainer}
          ref={waveContainerRef}
        ></div> */}
      </div>

      <Samples
        chooseSample={chooseSample}
        // currentSampleBlob={blobsRef.current[0]} // henda ef test virka
        currentSampleUrl={urlRef} // audioElementRef.current.src // currentUrlRef
      />
    </div>
  );
};

export default Sampler;
