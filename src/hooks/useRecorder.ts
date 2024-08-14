// hooks/useRecorder.ts

import { useState, useCallback } from 'react';
import { blobToSampleFile, isSampleFile } from '../types/utils';
import { getHoursMinSec } from '../lib/utils/time-utils';
import { useAudioCtxUtils, useReactAudioCtx } from '../contexts/ReactAudioCtx';
import { createNewSampleRecord } from '../lib/db/pocketbase';
import { getInitZeroSnappedPoints } from '../lib/audio-utils/zeroCrossingUtils';
import { normalizeBuffer_RMS } from '../lib/audio-utils/normalize';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { decodeAudioData } = useAudioCtxUtils();
  const { audioCtx } = useReactAudioCtx();

  const handleNewRecording = useCallback(
    async (blob: Blob) => {
      const timeNow = getHoursMinSec();
      const tempName = `unsaved-sample-${timeNow}`;

      const sample_file = blobToSampleFile(blob, tempName, 'WEBM');
      if (!(sample_file && isSampleFile(sample_file))) {
        throw new Error('Error creating sample file from blob');
      }

      const arrayBuffer = await sample_file.arrayBuffer();
      const audioBuffer = await decodeAudioData(arrayBuffer);

      // Normalize the audio buffer
      if (audioCtx) normalizeBuffer_RMS(audioCtx, audioBuffer);

      const bufferDuration = audioBuffer.duration;

      // create the initial start, end, loopstart and loopend points
      // and snap them to the buffers zero-crossings to avoid clicks
      const initZeroSnapped = getInitZeroSnappedPoints(audioBuffer);

      const record = await createNewSampleRecord(
        tempName,
        sample_file,
        bufferDuration,
        initZeroSnapped
      );

      if (!(record && record.sample_settings)) {
        throw new Error('Failed to create Sample from recording');
      }

      return { record, audioBuffer };
    },
    [decodeAudioData]
  );

  return {
    isRecording,
    setIsRecording,
    handleNewRecording,
  };
};
