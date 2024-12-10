import { useEffect, useRef } from 'react';
import { keyMap } from '../lib/utils/keymap';

import { useSamplerCtx } from '../contexts/sampler-context';

export default function useKeyboard() {
  const pressedKeys = useRef(new Set<string>());
  const isEnabled = useRef(true);

  const { samplerEngine, toggleHold, setLoop } = useSamplerCtx();

  if (!samplerEngine) {
    console.error('SamplerEngine not initialized in useKeyboard hook');
    throw new Error('SamplerEngine not initialized in useKeyboard hook');
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
          const capsLockActive = event.getModifierState('CapsLock');
          if (capsLockActive) {
            setLoop(true);
          }
          pressedKeys.current.delete(event.code);
          break;
        case 'Space':
          event.preventDefault();
          break;
        case 'Tab':
          event.preventDefault();
          event.stopPropagation();
          toggleHold();
          break;
        default:
          const midiNote = keyMap[event.code];
          if (midiNote) {
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
        case 'CapsLock':
          const capsLockActive = event.getModifierState('CapsLock');
          if (!capsLockActive) {
            setLoop(false);
          }
          break;
        default:
          const midiNote = keyMap[event.code];
          if (midiNote) {
            event.preventDefault();
            samplerEngine.releaseNote(midiNote);
          }
      }
    };

    const handleBlur = () => {
      if (isEnabled.current) {
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
  }, [samplerEngine, toggleHold, setLoop]);

  return {
    setEnabled: (enabled: boolean) => {
      isEnabled.current = enabled;
      if (!enabled) {
        pressedKeys.current.clear();
      }
    },
  };
}
