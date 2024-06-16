import React, { useEffect, useRef } from 'react';

import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useMediaSourceCtx } from '../../contexts/media-source-context';
import { useControlsCtx } from '../../contexts/controls-context';
import {
  createVoice,
  midiToPlaybackRate,
  triggerAttack,
  triggerRelease,
} from '../../utils/audioUtils';
import { keyMap } from '../../utils/keymap';
import { SingleUseVoice } from '../../types';

let preppedVoice: SingleUseVoice | null = null;

const SamplePlayer: React.FC = ({}) => {
  const { audioCtx } = useReactAudioCtx();
  const { audioBufferRef } = useMediaSourceCtx();
  const { attackRatioRef, releaseRatioRef, masterVolumeRef } = useControlsCtx();

  const currentlyPlayingVoices = useRef<SingleUseVoice[]>([]);

  const keysPressedRef = useRef<string[]>([]);
  const maxKeysPressed = 6;

  if (!preppedVoice && audioBufferRef.current) {
    preppedVoice = createVoice(audioCtx, audioBufferRef.current);
  }

  useEffect(() => {
    if (audioBufferRef.current) {
      preppedVoice = createVoice(audioCtx, audioBufferRef.current);
    }
  }, [audioBufferRef.current]);

  function playSample(key: string): void {
    if (!audioBufferRef.current) {
      console.error('No audio buffer available');
      return;
    }

    let thisVoice: SingleUseVoice | null = null;

    if (!preppedVoice) {
      thisVoice = createVoice(audioCtx, audioBufferRef.current);
    } else if (preppedVoice) {
      thisVoice = preppedVoice;
      preppedVoice = null;
    }

    if (thisVoice && thisVoice.source.buffer) {
      const midiNote = keyMap[key];
      const rate = midiToPlaybackRate(midiNote);

      const bufferDuration = thisVoice.source.buffer.duration;
      const attackTime = bufferDuration * attackRatioRef.current;

      console.log('attackTime:', attackTime);
      triggerAttack(thisVoice, rate, attackTime, masterVolumeRef.current);

      thisVoice.key = key;
      thisVoice.triggerTime = audioCtx.currentTime;

      currentlyPlayingVoices.current.push(thisVoice);

      // prep the next voice
      preppedVoice = createVoice(audioCtx, audioBufferRef.current);
    } else {
      console.log('No audio buffer available');
      console.error('No voice / buffer available');
    }
  }

  function releaseSample(key: string): void {
    const index = currentlyPlayingVoices.current.findIndex(
      (voice) => voice.key === key
    );
    if (index !== -1) {
      const thisVoice = currentlyPlayingVoices.current[index];
      let releaseTime = 0.1;
      if (
        thisVoice.source &&
        thisVoice.source.buffer &&
        thisVoice.triggerTime
      ) {
        const bufferDuration = thisVoice.source.buffer.duration;
        const passedTime = audioCtx.currentTime - thisVoice.triggerTime;
        const remainingTime = bufferDuration - passedTime;

        releaseTime = Math.min(
          bufferDuration * releaseRatioRef.current,
          remainingTime
        );
      }
      console.log('releaseTime:', releaseTime);
      triggerRelease(thisVoice, releaseTime);

      currentlyPlayingVoices.current.splice(index, 1);
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (keysPressedRef.current.length >= maxKeysPressed) {
      console.log('Max number of keys pressed simultaneously:', maxKeysPressed);
      return;
    }
    const key = event.code;

    if (
      keyMap[key] &&
      !keysPressedRef.current.includes(key)
      // keysPressedRef.current.length >= maxKeysPressed - 1 // -1? does not work currently
    ) {
      keysPressedRef.current.push(key);
      playSample(key);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (keysPressedRef.current.includes(event.code)) {
      const key = event.code;
      releaseSample(key);
      keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
    } else {
      console.log('handleKeyUp: Key not found in keysPressedRef.current');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <></>; // Not rendering anything
};

export default SamplePlayer;

// import Envelope from 'envelope-generator';

// let masterGainNode = audioCtx.createGain();

// let env = new Envelope(audioCtx, {
//   attackTime: 0.5,
//   decayTime: 0.5,
//   sustainLevel: 0.3,
//   releaseTime: 0.1,
// });

// env.connect(masterGainNode.gain);

// export function playAudioBuffer(audioBuffer: AudioBuffer, rate: number): void {
//   masterGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
//   const source = audioCtx.createBufferSource();
//   source.buffer = audioBuffer;
//   source.connect(audioCtx.destination);
//   // const gainNode = new GainNode(audioCtx);
//   // source.connect(gainNode).connect(audioCtx.destination);
//   // gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);

//   source.playbackRate.value = rate;
//   source.start();

//   env.start(audioCtx.currentTime);

//   // env.release(releaseAt);

//   // triggerAttackHoldRelease(gainNode, 1.0, 500, 1000, 500);
//   //triggerAttack(gainNode, 1.0, 500);

//   // console.log('base latency: ', audioCtx.baseLatency);
//   // console.log('output latency: ', audioCtx.outputLatency);
// }

// export function createGainNode(volume: number): GainNode {
//   const gainNode = audioCtx.createGain();
//   gainNode.gain.value = volume;

//   return gainNode;
// }

// export function triggerAttack(
//   gainNode: GainNode,
//   peakVolume: number,
//   attackMs: number
// ) {
//   const currentTime = audioCtx.currentTime;
//   gainNode.gain.exponentialRampToValueAtTime(
//     peakVolume,
//     currentTime + attackMs
//   );
// }

// export function triggerRelease(gainNode: GainNode, decayMs: number) {
//   const currentTime = audioCtx.currentTime;

//   gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
//   gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + decayMs);
// }

// export function triggerAttackHoldRelease(
//   gainNode: GainNode,
//   peakVolume: number,
//   attackMs: number,
//   holdMs: number,
//   releaseMs: number
// ) {
//   triggerAttack(gainNode, peakVolume, attackMs);
//   setTimeout(() => {
//     triggerRelease(gainNode, releaseMs);
//   }, holdMs);
// }

// export function setVolume(gainNode: GainNode, fadeTime: number) {
//   const currentTime = audioCtx.currentTime;

//   gainNode.gain.value = 0.5;

//   gainNode.gain.exponentialRampToValueAtTime(
//     gainNode.gain.value,
//     audioCtx.currentTime + 0.03
//   );
// }

// export function createBufferSourceNode(audioBuffer: AudioBuffer) {
//   const source = audioCtx.createBufferSource();
//   source.buffer = audioBuffer;

//   // source.connect(audioCtx.destination);
//   //masterVolume.connect(masterCompressor);
//   //masterCompressor.connect(audioCtx.destination);

//   return source;
// }
