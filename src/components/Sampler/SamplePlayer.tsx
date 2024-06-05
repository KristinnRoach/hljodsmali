'use client';

import React, { useContext, useEffect, useRef } from 'react';

import audioCtx from '@components/contexts/webAudioCtx';
import { AudioSrcCtx } from '@components/contexts/ctx';
import { keyMap } from '../../utils/keymap';

const SamplePlayer: React.FC = ({}) => {
  const { audioBufferRef } = useContext(AudioSrcCtx);

  const keysPressedRef = useRef<string[]>([]);

  function midiToPlaybackRate(midiNote: number): number {
    return 2 ** ((midiNote - 60) / 12);
  }

  function playAudioBuffer(rate: number): void {
    const source = audioCtx.createBufferSource(); // create single use audio-buffer-source-node

    if (audioBufferRef.current) {
      source.buffer = audioBufferRef.current;
      source.connect(audioCtx.destination);
      source.playbackRate.value = rate;
      source.start();
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
      playAudioBuffer(rate);
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
