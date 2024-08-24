import { useState, useEffect, useCallback } from 'react';

type KeyMomentaryOptions = {
  key: string;
  onPress: () => void;
  onRelease: () => void;
};

export const useKeyMomentary = ({
  key,
  onPress,
  onRelease,
}: KeyMomentaryOptions) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key && !event.repeat) {
        setIsPressed(true);
        onPress();
      }
    },
    [key, onPress]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) {
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
