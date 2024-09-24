import { useState, useCallback, use, useEffect } from 'react';

export default function useLoopHold() {
  const [isLooping, setIsLooping] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  /////////// TODO: MOMENTARY KEY MODE - 1) toggle loop 2) toggle hold ///////////

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
    // console.log('isLooping', isLooping); // STATE IS NOT UPDATED UNTIL NEXT RENDER !!!! LOOK AT EVERYTHING :O
    return !isLooping; // safe?
  }, [isLooping]);

  const toggleHold = useCallback(() => {
    setIsHolding((prev) => !prev);
    // console.log('isHolding', isHolding);
    return !isHolding;
  }, [isHolding]);

  useEffect(() => {
    console.log('isLooping', isLooping);
  }, [isLooping]);

  useEffect(() => {
    console.log('isHolding', isHolding);
  }, [isHolding]);

  return {
    isLooping,
    setIsLooping,
    isHolding,
    setIsHolding,
    toggleLoop,
    toggleHold,
  };
}
