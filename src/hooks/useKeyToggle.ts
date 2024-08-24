import { useState, useEffect, useCallback } from 'react';

type KeyToggleOptions = {
  key: string;
  initialState?: boolean;
  preventDefault?: boolean;
};

const useKeyToggle = ({
  key,
  initialState = false,
  preventDefault = true,
}: KeyToggleOptions) => {
  const [isToggled, setIsToggled] = useState(initialState);

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) {
        if (preventDefault) {
          event.preventDefault();
        }

        if (key === 'CapsLock') {
          // For CapsLock, we use the actual CapsLock state
          setIsToggled(event.getModifierState('CapsLock'));
        } else {
          // For other keys, we toggle the state on keydown
          if (event.type === 'keydown') {
            setIsToggled((prev) => !prev);
          }
        }
      }
    },
    [key, preventDefault]
  );

  useEffect(() => {
    if (key === 'CapsLock') {
      setIsToggled(
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

  const setToggle = useCallback((state: boolean) => {
    setIsToggled(state);
  }, []);

  return [isToggled, setToggle] as const;
};

export default useKeyToggle;
