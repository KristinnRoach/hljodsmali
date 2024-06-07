'use client';

import React, { useContext, useEffect, useRef } from 'react';

import { audioCtx } from '../../utils/audioNodeGraph';
import { AudioSrcCtx } from '../../contexts/ctx';
import { playAudioBuffer } from '../../utils/playback';
import { keyMap } from '../../utils/keymap';

const SamplePlayer: React.FC = ({}) => {
  const { audioBufferRef } = useContext(AudioSrcCtx);

  const keysPressedRef = useRef<string[]>([]);

  function midiToPlaybackRate(midiNote: number): number {
    return 2 ** ((midiNote - 60) / 12);
  }

  function playSample(rate: number): void {
    if (audioBufferRef.current) {
      playAudioBuffer(audioBufferRef.current, rate);
    } else {
      console.error('Audio buffer not available from playAudioBuffer()');
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    const midiNote: number | undefined = keyMap[key];

    if (!keysPressedRef.current.includes(key) && midiNote) {
      // for avoiding retriggers
      keysPressedRef.current.push(key);
      const rate = midiToPlaybackRate(midiNote);
      playSample(rate);
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
  }, []);

  return <></>; // Not rendering anything
};

export default SamplePlayer;
