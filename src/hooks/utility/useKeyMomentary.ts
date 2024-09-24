import { useState, useEffect, useCallback } from 'react';

type KeyMomentaryOptions = {
  key: string;
  onPress: () => void;
  onRelease: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

export const useKeyMomentary = ({
  key,
  onPress,
  onRelease,
  preventDefault = true,
  stopPropagation = true,
}: KeyMomentaryOptions) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();

        if (!event.repeat) {
          setIsPressed(true);
          onPress();
        }
      }
    },
    [key, onPress]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();

      if (event.key === key && isPressed) {
        setIsPressed(false);
        onRelease();
      }
    },
    [key, onRelease]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return isPressed;
};

export default useKeyMomentary;
