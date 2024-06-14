'use client';

import React, { useEffect, useRef } from 'react';

import { useReactAudioCtx } from '../../contexts/react-audio-context';
import { useMediaSourceCtx } from '../../contexts/media-source-context';
import { keyMap } from '../../utils/keymap';

const SamplePlayer: React.FC = ({}) => {
  const { audioCtx } = useReactAudioCtx();
  const { audioBuffer } = useMediaSourceCtx();

  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    audioBufferRef.current = audioBuffer;
  }, [audioBuffer]);

  function playAudioBuffer(
    // audioBuffer: AudioBuffer,
    // audioCtx: AudioContext,
    rate: number
  ): void {
    if (audioBufferRef.current) {
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      // console.log('audioCtx.destination: ', audioCtx.destination);
      source.playbackRate.value = rate;
      source.start();
      // console.log('base latency: ', audioCtx.baseLatency);
      // console.log('output latency: ', audioCtx.outputLatency);
    } else {
      console.error('No audio buffer available');
    }
  }

  function midiToPlaybackRate(midiNote: number): number {
    return 2 ** ((midiNote - 60) / 12);
  }

  async function resumeAudioContext(audioCtx: AudioContext): Promise<void> {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  }

  const keysPressedRef = useRef<string[]>([]);

  function playSample(midiNote: number): void {
    const rate = midiToPlaybackRate(midiNote);
    console.log('play audioBuffer: ', audioBufferRef.current);
    // resumeAudioContext(audioCtx); // unnecessary?
    playAudioBuffer(rate);
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    const midiNote: number | undefined = keyMap[key];

    if (!keysPressedRef.current.includes(key) && midiNote) {
      // for avoiding retriggers
      keysPressedRef.current.push(key);
      playSample(midiNote);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.code;
    const note = keyMap[key];
    keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [audioBuffer]);

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
