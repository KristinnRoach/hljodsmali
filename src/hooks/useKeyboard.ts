import { useEffect, useRef } from 'react';
import { keyMap } from '../lib/utils/keymap';

// import SamplerEngine from '../lib/SamplerEngine';
import { useSamplerCtx } from '../contexts/sampler-context';

export default function useKeyboard() {
  const isSpacebarDown = useRef(false); // ?
  const isTabActive = useRef(false);
  const pressedKeys = useRef(new Set<string>());
  const isEnabled = useRef(true);

  // const samplerEngine = SamplerEngine.getInstance();
  const {
    samplerEngine,
    handleLoopKeys,
    handleHoldKey,
    toggleHold,
    // mainLoopToggle,
    // mainHoldToggle,
    // momentaryLoopToggle,
    // momentaryHoldToggle,
  } = useSamplerCtx();

  if (!samplerEngine) {
    console.error('SamplerEngine not initialized in useKeyboard hook');
    return;
  }

  useEffect(() => {
    if (!samplerEngine) {
      console.error('SamplerEngine not initialized in useKeyboard effect');
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !isEnabled.current ||
        event.repeat ||
        pressedKeys.current.has(event.code)
      )
        return;

      pressedKeys.current.add(event.code);

      // if (
      //   event.target instanceof HTMLInputElement ||
      //   event.target instanceof HTMLTextAreaElement
      // ) {
      //   return; // ignore keyboard events when typing in input fields // NOT TESTED
      // }

      switch (event.code) {
        case 'CapsLock':
          event.preventDefault();
          if (isSpacebarDown.current && event.getModifierState('CapsLock')) {
            return;
          }
          handleLoopKeys(
            event.getModifierState('CapsLock'),
            isSpacebarDown.current
          );
          // samplerEngine.mainLoopToggle(event.getModifierState('CapsLock'));
          break;
        case 'Space':
          event.preventDefault();
          isSpacebarDown.current = true;
          handleLoopKeys(event.getModifierState('CapsLock'), true);
          // momentaryLoopToggle(true);
          // momentaryHoldToggle(true);
          break;
        case 'Tab':
          event.preventDefault();
          event.stopPropagation();
          // isTabActive.current = !isTabActive.current;
          // handleHoldKey(isTabActive.current);
          toggleHold();
          // samplerEngine.mainHoldToggle(event.getModifierState('Tab'));
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
      if (!isEnabled.current) return;
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
          isSpacebarDown.current = false;
          if (event.getModifierState('CapsLock')) {
            toggleHold();
          } else {
            handleLoopKeys(event.getModifierState('CapsLock'), false);
          }

          // samplerEngine.momentaryLoopToggle(false);
          // samplerEngine.momentaryHoldToggle(false);
          break;
        // case 'Tab':
        //   event.preventDefault();
        //   // event.stopPropagation();
        //   isTabDown.current = false;
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
        // handleLoopKeys(false, false);
        isSpacebarDown.current = false;
        isTabActive.current = false;
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
  }, [samplerEngine]);

  return {
    setEnabled: (enabled: boolean) => {
      isEnabled.current = enabled;
      if (!enabled) {
        handleLoopKeys(false, false);
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
