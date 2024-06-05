import { useContext, useEffect, useRef } from 'react';

import audioCtx from '@components/contexts/webAudioCtx';
import { AudioSrcCtx } from '@components/contexts/ctx';
import { keyMap } from '../../utils/keymap';

const SamplePlayer: React.FC = ({}) => {
  const { audioBuffer } = useContext(AudioSrcCtx);

  const keysPressedRef = useRef<string[]>([]);

  function playAudioBuffer(rate: number): void {
    const source = audioCtx.createBufferSource();
    if (audioBuffer) {
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.playbackRate.value = rate;
      source.start();
    } else {
      console.error('No audio buffer available');
    }
  }

  function midiToPlaybackRate(midiNote: number): number {
    return 2 ** ((midiNote - 60) / 12);
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    const midiNote: number | undefined = keyMap[key];

    if (!keysPressedRef.current.includes(key) && midiNote) {
      // for avoiding retriggers
      keysPressedRef.current.push(key);
      const pitch = midiToPlaybackRate(midiNote);
      playAudioBuffer(pitch);
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
