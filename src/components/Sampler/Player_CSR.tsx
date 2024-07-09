// src/components/Sampler/Player_CSR.tsx

'use client';

import React, { useEffect } from 'react';
import { keyMap } from '../../lib/keymap';
import { useSamplerCtx } from '../../contexts/sampler-context';

export default function Player_CSR() {
  const { playNote, releaseNote } = useSamplerCtx();
  const keysPressed = new Set<string>();

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code; // event.code is the same across keyboard layouts (not event.key)

    if (keyMap[key] && !keysPressed.has(key)) {
      const midiNote = keyMap[key];
      playNote(midiNote);
      keysPressed.add(key);
      // console.log('keyDown: ', keysPressed);
    }
    if (
      ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)
    ) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.code;

    if (keyMap[key] && keysPressed.has(key)) {
      const midiNote = keyMap[key];
      releaseNote(midiNote);
      keysPressed.delete(key);
    }
    // console.log('keyUp: ', keysPressed);
  };

  const handleBlur = () => {
    keysPressed.forEach((key) => {
      if (keyMap[key]) {
        // releaseAllNotes();
      }
    });
    keysPressed.clear();
    console.log('handleBlur clear keys: ', keysPressed);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  return <>{/* Any UI elements */}</>;
}

// // useRef for preppedVoice ? What is the difference?
// let preppedVoice: SingleUseVoice | null = null;

// export default function Player_CSR(buffers: AudioBuffer[]) {
//   const { audioCtx } = useReactAudioCtx();
//   const { theSample, theBuffer, sampleSwitch } = useMediaSourceCtx();

//   const { attackRatioRef, releaseRatioRef, masterVolumeRef } = useControlsCtx();
//   const { reverbEnabledRef } = useFxCtx();

//   const currentlyPlayingVoices = useRef<SingleUseVoice[]>([]);

//   const keysPressedRef = useRef<string[]>([]);
//   const maxKeysPressed = 6;

//   const reverbConvolverRef = useRef<ConvolverNode | null>(null);

//   if (!preppedVoice && theSample.current && theSample.current.buffer) {
//     const voice = createVoice(audioCtx, theSample.current.buffer);
//     preppedVoice = voice;
//   }

//   function playSample(key: string): void {
//     console.log('preppedVoice: ', preppedVoice);
//     const buffer = theSample.current?.buffer;
//     if (!buffer) {
//       console.error('No audio buffer available');
//       return;
//     }

//     if (!preppedVoice) {
//       const voice = createVoice(audioCtx, buffer);
//       // setPreppedVoice(voice);
//       preppedVoice = voice;
//     }

//     if (preppedVoice && preppedVoice.source.buffer) {
//       const midiNote = keyMap[key];
//       const rate = midiToPlaybackRate(midiNote);

//       const bufferDuration = preppedVoice.source.buffer.duration;
//       const attackTime = bufferDuration * attackRatioRef.current;

//       triggerAttack(preppedVoice, rate, attackTime, masterVolumeRef.current);

//       preppedVoice.key = key;
//       preppedVoice.triggerTime = audioCtx.currentTime;

//       currentlyPlayingVoices.current.push(preppedVoice);

//       preppedVoice = createVoice(audioCtx, buffer);

//       setTimeout(() => {
//         // Release voice 100ms before end of buffer to avoid clicks
//         const index = currentlyPlayingVoices.current.findIndex(
//           (voice) => voice.key === key
//         );
//         if (index !== -1) {
//           releaseSample(key);
//         }
//       }, bufferDuration * 1000 - 100);
//     } else {
//       console.error('No voice / buffer available');
//     }
//   }

//   function releaseSample(key: string): void {
//     const index = currentlyPlayingVoices.current.findIndex(
//       (voice) => voice.key === key
//     );
//     if (index !== -1) {
//       const thisVoice = currentlyPlayingVoices.current[index];
//       let releaseTime = 0.1;
//       if (
//         thisVoice.source &&
//         thisVoice.source.buffer &&
//         thisVoice.triggerTime
//       ) {
//         const bufferDuration = thisVoice.source.buffer.duration;
//         const passedTime = audioCtx.currentTime - thisVoice.triggerTime;
//         const remainingTime = bufferDuration - passedTime;

//         releaseTime = Math.min(
//           bufferDuration * releaseRatioRef.current,
//           remainingTime
//         );
//       }
//       triggerRelease(thisVoice, releaseTime);

//       currentlyPlayingVoices.current.splice(index, 1);
//     }
//   }

//   const handleKeyDown = (event: KeyboardEvent) => {
//     if (keysPressedRef.current.length >= maxKeysPressed) {
//       console.log('Max number of keys pressed simultaneously:', maxKeysPressed);
//       return;
//     }
//     const key = event.code;

//     if (
//       keyMap[key] &&
//       !keysPressedRef.current.includes(key)
//       // keysPressedRef.current.length >= maxKeysPressed - 1 // -1? does not work currently
//     ) {
//       keysPressedRef.current.push(key);
//       playSample(key);
//     }
//   };

//   const handleKeyUp = (event: KeyboardEvent) => {
//     const key = event.code;

//     if (!keyMap[key]) {
//       return;
//     }

//     if (keysPressedRef.current.includes(key)) {
//       releaseSample(key);
//       keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
//     } else {
//       console.log('handleKeyUp: Key not found in keysPressedRef.current');
//     }
//   };

//   // trigger rerender when sample changes
//   useEffect(() => {
//     if (preppedVoice && theSample.current && theSample.current.buffer) {
//       const voice = createVoice(audioCtx, theSample.current.buffer);
//       preppedVoice = voice;
//     }
//   }, [sampleSwitch]);

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//     };
//   }, []);

//   return <></>; // Not rendering anything
// }
