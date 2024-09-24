import { useState, useCallback } from 'react';
import { Time_settings } from '../types/types';

export default function useZeroCrossings() {
  const [zeroCrossings, setZeroCrossings] = useState<Map<string, number[]>>(
    new Map()
  );

  const getZeroCrossings = useCallback(
    (sampleId: string): number[] | undefined => {
      return zeroCrossings.get(sampleId);
    },
    [zeroCrossings]
  );

  const setZeroCrossingsForSample = useCallback(
    (sampleId: string, crossings: number[]): void => {
      console.log(`Setting zero crossings for ${sampleId}:`, crossings.length);
      setZeroCrossings((prev) => new Map(prev).set(sampleId, crossings));
    },
    []
  );

  const removeZeroCrossings = useCallback((sampleId: string): void => {
    setZeroCrossings((prev) => {
      const newMap = new Map(prev);
      newMap.delete(sampleId);
      return newMap;
    });
  }, []);

  const findZeroCrossings = useCallback(
    (audioBuffer: AudioBuffer, threshold: number = 0.001): number[] => {
      const channel = audioBuffer.getChannelData(0); // Assuming mono audio
      const sampleRate = audioBuffer.sampleRate;
      const crossings: number[] = [];

      for (let i = 1; i < channel.length; i++) {
        if (Math.abs(channel[i]) < threshold) {
          crossings.push(i / sampleRate);
        } else if (Math.sign(channel[i]) !== Math.sign(channel[i - 1])) {
          const t = -channel[i - 1] / (channel[i] - channel[i - 1]);
          const zeroCrossingTime = (i - 1 + t) / sampleRate;
          crossings.push(zeroCrossingTime);
        }
      }

      return crossings;
    },
    []
  );

  const snapToZeroCrossing = useCallback(
    (time: number, sampleId: string, newZeroCrossings?: number[]): number => {
      let crossings: number[] = [];
      if (
        sampleId === 'new' &&
        newZeroCrossings &&
        newZeroCrossings.length > 0
      ) {
        crossings = newZeroCrossings;
      } else if (zeroCrossings.has(sampleId)) {
        crossings = zeroCrossings.get(sampleId) || [];
      } else {
        console.warn(`No zero crossings found for ${sampleId}`);
        return time;
      }

      if (crossings.length === 0) {
        console.warn('No zero crossings found');
        return time;
      }

      return crossings.reduce((prev, curr) =>
        Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev
      );
    },
    [zeroCrossings]
  );

  const getInitZeroSnappedPoints = useCallback(
    (buffer: AudioBuffer, id: string = 'new'): Time_settings => {
      const crossings = findZeroCrossings(buffer);
      const bufferDuration = buffer.duration;

      return {
        startPoint: snapToZeroCrossing(0.0, id, crossings),
        endPoint: snapToZeroCrossing(bufferDuration * 0.9, id, crossings),
        loopStart: snapToZeroCrossing(bufferDuration * 0.2, id, crossings),
        loopEnd: snapToZeroCrossing(bufferDuration * 0.6, id, crossings),
      };
    },
    [findZeroCrossings, snapToZeroCrossing]
  );

  return {
    getZeroCrossings,
    setZeroCrossings: setZeroCrossingsForSample,
    removeZeroCrossings,
    findZeroCrossings,
    snapToZeroCrossing,
    getInitZeroSnappedPoints,
  };
}
