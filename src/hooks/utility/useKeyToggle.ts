import { useState, useEffect, useCallback } from 'react';

type KeyToggleOptions = {
  key: string;
  initialState?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

const useKeyToggle = ({
  key,
  initialState = false,
  preventDefault = true,
  stopPropagation = true,
}: KeyToggleOptions) => {
  const [isActive, setToggle] = useState(initialState);

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();

        if (key === 'CapsLock') {
          // For CapsLock, we use the actual CapsLock state
          setToggle(event.getModifierState('CapsLock'));
        } else {
          // For other keys, we toggle the state on keydown
          if (event.type === 'keydown') {
            setToggle((prev) => !prev);
          }
        }
      }
    },
    [key, preventDefault]
  );

  useEffect(() => {
    if (key === 'CapsLock') {
      setToggle(
        'getModifierState' in KeyboardEvent.prototype
          ? new KeyboardEvent('').getModifierState('CapsLock')
          : false
      );
    }

    window.addEventListener('keydown', handleKeyEvent);
    if (key === 'CapsLock') {
      // We need to listen for keyup as well for CapsLock
      window.addEventListener('keyup', handleKeyEvent);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      if (key === 'CapsLock') {
        window.removeEventListener('keyup', handleKeyEvent);
      }
    };
  }, [handleKeyEvent, key]);

  const toggle = useCallback((state: boolean) => {
    setToggle(state);
  }, []);

  return [isActive, toggle] as const;
};

export default useKeyToggle;
