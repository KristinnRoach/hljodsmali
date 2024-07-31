import { useEffect, useRef } from 'react';
import { keyMap } from '../lib/utils/keymap';

// import SamplerEngine from '../lib/SamplerEngine';
import { useSamplerCtx } from '../contexts/sampler-context';

export default function useKeyboard() {
  const isSpacebarDown = useRef(false); // ?
  // const isTabActive = useRef(false);
  const pressedKeys = useRef(new Set<string>());
  const isEnabled = useRef(true);

  // const isMomentaryLoopOn = useRef(false); //
  // const isMomentaryHoldOn = useRef(false); //

  // const samplerEngine = SamplerEngine.getInstance();
  const { samplerEngine, toggleHold, toggleLoop, isLooping, isHolding } =
    useSamplerCtx();

  if (!samplerEngine) {
    console.error('SamplerEngine not initialized in useKeyboard hook');
    throw new Error('SamplerEngine not initialized in useKeyboard hook');
  }

  const momentaryLoop = useRef(false);
  const momentaryLoopRelease = useRef(false);
  const momentaryHold = useRef(false);
  const momentaryHoldRelease = useRef(false);

  const handleSpaceDown = () => {
    if (momentaryLoop.current || momentaryHold.current) return;

    if (isLooping && isHolding) {
      toggleHold();
      momentaryHoldRelease.current = true;
      console.log(
        'DOWN momentaryHoldRelease: ',
        momentaryHoldRelease.current,
        true
      );
    } else if (isLooping) {
      toggleLoop();
      momentaryLoopRelease.current = true;
      console.log(
        'DOWN momentaryLoopRelease: ',
        momentaryLoopRelease.current,
        true
      );
    } else if (!isLooping) {
      toggleLoop();
      momentaryLoop.current = true;
      console.log('DOWN momentaryLoop: ', momentaryLoop.current, true);
    }
  };

  const handleSpaceUp = () => {
    if (momentaryLoopRelease.current || momentaryHoldRelease.current) {
      toggleLoop();
      momentaryLoopRelease.current = false;
      console.log(
        'UP momentaryLoopRelease: ',
        momentaryLoopRelease.current,
        false
      );
    } else if (momentaryHoldRelease.current) {
      toggleHold();
      momentaryHoldRelease.current = false;
      console.log(
        'UP momentaryHoldRelease: ',
        momentaryHoldRelease.current,
        false
      );
    }
    console.log('UP momentaryLoop: ', momentaryLoop.current);
    console.log('UP momentaryLoopRelease: ', momentaryLoopRelease.current);
  };

  useEffect(() => {
    if (!samplerEngine) {
      console.error('SamplerEngine not initialized in useKeyboard effect');
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !isEnabled.current ||
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
        case 'CapsLock':
          event.preventDefault();
          // if (isSpacebarDown.current && event.getModifierState('CapsLock')) {
          //   return;
          // }
          toggleLoop();
          break;
        case 'Space':
          event.preventDefault();
          isSpacebarDown.current = true;
          handleSpaceDown();
          // momentaryLoopToggle(true);
          // momentaryHoldToggle(true);
          break;
        case 'Tab':
          event.preventDefault();
          event.stopPropagation();
          // isTabActive.current = !isTabActive.current;
          toggleHold();
          break;
        default:
          const midiNote = keyMap[event.code];
          if (midiNote) {
            event.preventDefault(); // yes or not?
            samplerEngine.playNote(midiNote);
          }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        !isEnabled.current ||
        event.repeat ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLInputElement &&
          event.target.type === 'text')
      ) {
        return;
      }

      pressedKeys.current.delete(event.code);

      switch (event.code) {
        // case 'CapsLock':
        //   event.preventDefault();
        //   if (isSpacebarDown.current && event.getModifierState('CapsLock')) {
        //     return;
        //   }
        //   handleLoopKeys(
        //     event.getModifierState('CapsLock'),
        //     isSpacebarDown.current
        //   );

        //   break;
        case 'Space':
          event.preventDefault();
          handleSpaceUp();

          // isSpacebarDown.current = false;
          // if (event.getModifierState('CapsLock')) {
          //   toggleHold();
          // } else {
          //   handleSpaceDown(event.getModifierState('CapsLock'));
          // }
          // samplerEngine.momentaryLoopToggle(false);
          // samplerEngine.momentaryHoldToggle(false);
          break;
        // case 'Tab':
        //   event.preventDefault();
        //   // event.stopPropagation();
        //   // isTabActive.current = false;
        //   handleHoldKey(false);
        //   break;
        default:
          const midiNote = keyMap[event.code];
          if (midiNote) {
            event.preventDefault(); // yes or not?
            samplerEngine.releaseNote(midiNote);
          }
      }
    };

    const handleBlur = () => {
      if (isEnabled.current) {
        // isSpacebarDown.current = false;
        // isTabActive.current = false;
        pressedKeys.current.clear();
        console.log('blur occured');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [samplerEngine, toggleHold, toggleLoop, handleSpaceUp, handleSpaceDown]);

  return {
    setEnabled: (enabled: boolean) => {
      isEnabled.current = enabled;
      if (!enabled) {
        isSpacebarDown.current = false;
        pressedKeys.current.clear();
      }
    },
  };
}

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
