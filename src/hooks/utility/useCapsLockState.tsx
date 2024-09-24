import { useState, useEffect } from 'react';

const useCapsLockState = () => {
  const [capsLockState, setCapsLockState] = useState(false);

  useEffect(() => {
    const handleKeyboardEvent = (event: KeyboardEvent) => {
      setCapsLockState(event.getModifierState('CapsLock'));
    };

    window.addEventListener('keydown', handleKeyboardEvent);
    window.addEventListener('keyup', handleKeyboardEvent);

    // Initial check
    setCapsLockState(
      'getModifierState' in KeyboardEvent.prototype
        ? new KeyboardEvent('').getModifierState('CapsLock')
        : false
    );

    return () => {
      window.removeEventListener('keydown', handleKeyboardEvent);
      window.removeEventListener('keyup', handleKeyboardEvent);
    };
  }, []);

  return capsLockState;
};

export default useCapsLockState;
