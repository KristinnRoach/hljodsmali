'use client';
import React, { use, useEffect, useRef, useState } from 'react';

import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useMediaSourceCtx } from '../../contexts/media-source-context';
import { useControlsCtx } from '../../contexts/controls-context';
import { useFxCtx } from '../../contexts/fx-context';
import {
  createVoice,
  midiToPlaybackRate,
  triggerAttack,
  triggerRelease,
} from '../../utils/audioUtils';
import { keyMap } from '../../utils/keymap';
import { Sample, SingleUseVoice } from '../../types';
import Link from 'next/link';

// useRef for preppedVoice ? What is the difference?
let preppedVoice: SingleUseVoice | null = null;

const SamplePlayer: React.FC = ({}) => {
  const { audioCtx } = useReactAudioCtx();
  const { theSample, theBuffer, sampleSwitch } = useMediaSourceCtx();

  const { attackRatioRef, releaseRatioRef, masterVolumeRef } = useControlsCtx();
  const { reverbEnabledRef } = useFxCtx();

  const currentlyPlayingVoices = useRef<SingleUseVoice[]>([]);

  const keysPressedRef = useRef<string[]>([]);
  const maxKeysPressed = 6;

  const reverbConvolverRef = useRef<ConvolverNode | null>(null);

  if (!preppedVoice && theSample.current && theSample.current.buffer) {
    const voice = createVoice(audioCtx, theSample.current.buffer);
    preppedVoice = voice;
  }

  function playSample(key: string): void {
    console.log('preppedVoice: ', preppedVoice);
    const buffer = theSample.current?.buffer;
    if (!buffer) {
      console.error('No audio buffer available');
      return;
    }

    if (!preppedVoice) {
      const voice = createVoice(audioCtx, buffer);
      // setPreppedVoice(voice);
      preppedVoice = voice;
    }

    if (preppedVoice && preppedVoice.source.buffer) {
      const midiNote = keyMap[key];
      const rate = midiToPlaybackRate(midiNote);

      const bufferDuration = preppedVoice.source.buffer.duration;
      const attackTime = bufferDuration * attackRatioRef.current;

      triggerAttack(preppedVoice, rate, attackTime, masterVolumeRef.current);

      preppedVoice.key = key;
      preppedVoice.triggerTime = audioCtx.currentTime;

      currentlyPlayingVoices.current.push(preppedVoice);

      preppedVoice = createVoice(audioCtx, buffer);

      setTimeout(() => {
        // Release voice 100ms before end of buffer to avoid clicks
        const index = currentlyPlayingVoices.current.findIndex(
          (voice) => voice.key === key
        );
        if (index !== -1) {
          releaseSample(key);
        }
      }, bufferDuration * 1000 - 100);
    } else {
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
    const key = event.code;

    if (!keyMap[key]) {
      return;
    }

    if (keysPressedRef.current.includes(key)) {
      releaseSample(key);
      keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
    } else {
      console.log('handleKeyUp: Key not found in keysPressedRef.current');
    }
  };

  // trigger rerender when sample changes
  useEffect(() => {
    if (preppedVoice && theSample.current && theSample.current.buffer) {
      const voice = createVoice(audioCtx, theSample.current.buffer);
      preppedVoice = voice;
    }
  }, [sampleSwitch]);

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
