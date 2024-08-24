import { useEffect, useRef } from 'react';
import { keyMap } from '../types/constants/keymap';
import { useSamplerEngine } from '../contexts/EngineContext';

export default function useKeyboard() {
  const { playNote, releaseNote } = useSamplerEngine();

  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        pressedKeys.current.has(event.code) ||
        event.target instanceof HTMLTextAreaElement || // ignore keyboard events when typing in input fields or textareas
        (event.target instanceof HTMLInputElement &&
          event.target.type === 'text')
      ) {
        return;
      }

      pressedKeys.current.add(event.code);

      switch (event.code) {
        default:
          const midiNote = keyMap[event.code];
          if (midiNote) {
            event.preventDefault(); // yes or not?
            playNote(midiNote);
          }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLInputElement &&
          event.target.type === 'text')
      ) {
        return;
      }

      pressedKeys.current.delete(event.code);

      switch (event.code) {
        default:
          const midiNote = keyMap[event.code];
          if (midiNote) {
            event.preventDefault(); // yes or not?
            releaseNote(midiNote);
          }
      }
    };

    const handleBlur = () => {
      pressedKeys.current.clear(); // stop notes?
      // console.log('blur occured');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
}

// const isSpacebarDown = useRef(false); // ?
// const isEnabled = useRef(true);

// const momentaryLoop = useRef(false);
// const momentaryLoopRelease = useRef(false);
// const momentaryHold = useRef(false);
// const momentaryHoldRelease = useRef(false);

// const handleSpaceDown = () => {
//   if (momentaryLoop.current || momentaryHold.current) return;

//   if (isLooping() && isHolding()) {
//     toggleHold();
//     momentaryHoldRelease.current = true;
//     console.log(
//       'DOWN momentaryHoldRelease: ',
//       momentaryHoldRelease.current,
//       true
//     );
//   } else if (isLooping()) {
//     toggleLoop();
//     momentaryLoopRelease.current = true;
//     console.log(
//       'DOWN momentaryLoopRelease: ',
//       momentaryLoopRelease.current,
//       true
//     );
//   } else if (!isLooping) {
//     toggleLoop();
//     momentaryLoop.current = true;
//     console.log('DOWN momentaryLoop: ', momentaryLoop.current, true);
//   }
// };

// const handleSpaceUp = () => {
//   if (momentaryLoopRelease.current || momentaryHoldRelease.current) {
//     toggleLoop();
//     momentaryLoopRelease.current = false;
//     console.log(
//       'UP momentaryLoopRelease: ',
//       momentaryLoopRelease.current,
//       false
//     );
//   } else if (momentaryHoldRelease.current) {
//     toggleHold();
//     momentaryHoldRelease.current = false;
//     console.log(
//       'UP momentaryHoldRelease: ',
//       momentaryHoldRelease.current,
//       false
//     );
//   }
//   console.log('UP momentaryLoop: ', momentaryLoop.current);
//   console.log('UP momentaryLoopRelease: ', momentaryLoopRelease.current);
// };

// const isTabActive = useRef(false);
// const isMomentaryLoopOn = useRef(false); //
// const isMomentaryHoldOn = useRef(false); //

// function setIsLooping() { // caps: boolean, space: boolean ?
//   // ... optimize for reliability
//   isLooping.current =
//     (isCapslockActive.current && !isSpacebarDown.current)
//     || (isSpacebarDown.current && !isCapslockActive.current);

//   samplerEngine.setIsLooping(isLooping.current); // implement setIsLooping in SamplerEngine
// }

// const setIsLooping = useCallback(() => {
//   console.log(
//     'caps: ',
//     isCapslockActive.current,
//     'space: ',
//     isSpacebarDown.current
//   );
//   const newLoopState = isCapslockActive.current !== isSpacebarDown.current;

//   if (newLoopState !== isLooping.current) {
//     isLooping.current = newLoopState;
//     samplerEngine?.setGlobalLoop(newLoopState);
//   }
// }, [samplerEngine]);

// return {
//   setEnabled: (enabled: boolean) => {
//     isEnabled.current = enabled;
//     if (!enabled) {
//       isSpacebarDown.current = false;
//       pressedKeys.current.clear();
//     }
//   },
// };
