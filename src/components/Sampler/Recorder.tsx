'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Sample_settings, Time_settings } from '../../types/types';
import VolumeMonitor from '../../lib/audio-utils/VolumeMonitor';

import Toggle, { ToggleMultiState } from '../UI/Basic/Toggle';

import { useSamplerEngine } from '../../contexts/EngineContext';
import useZeroCrossings from '../../hooks/useZeroCrossings';

import { getHoursMinSec } from '../../lib/utils/time-utils';
import { blobToSampleFile, isSampleFile } from '../../types/utils';
import { createNewSampleRecord } from '../../lib/db/pocketbase';

interface RecorderProps {
  className?: string;
  resamplerMode?: boolean;
}

const Recorder: React.FC<RecorderProps> = ({
  className,
  resamplerMode = false,
}) => {
  const {
    audioCtx: ctx,
    loadSample,
    selectSample: selectForPlayback,
    selectFocusedSettings: selectForSettings,
    connectToExternalOutput,
    disconnectExternalOutput,
  } = useSamplerEngine();

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    setAudioCtx(ctx);
  }, [ctx]);

  const [audioFormat, setAudioFormat] = useState<'wav' | 'webm'>('webm'); // TODO: Add support for other formats
  const [includeVideo, setIncludeVideo] = useState<boolean>(false); // TODO: Add support for video

  const [recorderState, setRecorderState] = useState<
    'idle' | 'armed' | 'recording'
  >('idle');
  const [streamVolume, setStreamVolume] = useState<number | null>(null); // TODO: use streamVolume for visual feedback
  const [label, setLabel] = useState<string>('');

  const recStateRef = useRef(recorderState); // do we need the useState also?
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const volumeMonitor = useRef<VolumeMonitor | null>(null);
  const resamplingInput = useRef<MediaStreamAudioDestinationNode | null>(null);

  const startThreshold = resamplerMode ? -200 : -35; // dB // REMOVE IF calibrate replaces
  const stopThreshold = resamplerMode ? -95 : -40; // dB // REMOVE IF calibrate replaces
  const silenceDelay = resamplerMode ? 50 : 200; // ms
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const zeroCrossings = useZeroCrossings();

  const handleNewRecording = useCallback(
    async (blob: Blob) => {
      if (!audioCtx) {
        console.error('AudioContext not available in handleNewRecording');
        return;
      }

      const timeNow = getHoursMinSec();
      const tempName = `unsaved-sample-${timeNow}`;

      const sample_file = blobToSampleFile(blob, tempName, 'WEBM');
      if (!(sample_file && isSampleFile(sample_file))) {
        throw new Error('Error creating sample file from blob');
      }

      const arrayBuffer = await sample_file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      if (!audioBuffer) {
        console.error('Error decoding audio data');
        return;
      }

      // Normalize the audio buffer
      // if (audioCtx) normalizeBuffer_Peak(audioCtx, audioBuffer);

      /* TODO: Move init settings and zeroCrossing function to 
      engine or more appropriate place (no need for useZeroCrossing elsewhere
      in this component) */

      const bufferDuration = audioBuffer.duration;

      // create the initial start, end, loopstart and loopend points
      // and snap them to the buffers zero-crossings to avoid clicks
      const initZeroSnapped = zeroCrossings.getInitZeroSnappedPoints(
        audioBuffer
      ) as Time_settings;

      console.log('initZeroSnapped:', initZeroSnapped);

      const record = await createNewSampleRecord(
        tempName,
        sample_file,
        bufferDuration,
        initZeroSnapped
      );

      console.log('Created new sample record:', record.sample_settings.time);

      if (!record || !record.sample_settings) {
        throw new Error('Failed to create Sample from recording');
      }

      return { record, audioBuffer };
    },
    [audioCtx]
  );

  const setupRecorderAndMonitor = useCallback(
    async (mediaStream: MediaStream) => {
      console.log('setupRecorderAndMonitor called');

      if (!audioCtx) {
        console.error('AudioContext not available in setupRecorderAndMonitor');
        return;
      }

      stream.current = mediaStream;
      recorder.current = new MediaRecorder(mediaStream);

      recorder.current.ondataavailable = async (e) => {
        console.log('ondataavailable triggered');

        const result = await handleNewRecording(e.data);

        console.log('handleNewRecording result:', result);

        if (result) {
          const { record, audioBuffer } = result;
          loadSample(record, audioBuffer);

          selectForPlayback(record.id, 'replace');
          selectForSettings(record.id, 'replace');
        } else {
          console.error('handleNewRecording returned undefined');
        }
      };

      volumeMonitor.current = new VolumeMonitor(mediaStream, audioCtx);
      volumeMonitor.current.monitorVolume(handleVolume);

      setRecorderState('armed');
    },
    [
      handleNewRecording,
      loadSample,
      selectForPlayback,
      selectForSettings,
      audioCtx,
    ]
  );

  const armRecording = useCallback(() => {
    if (!audioCtx) {
      console.error('AudioContext not available in armRecording');
      return;
    }

    if (resamplerMode) {
      const destination = audioCtx.createMediaStreamDestination();
      resamplingInput.current = destination;
      if (!destination) return;
      connectToExternalOutput(destination);
      setupRecorderAndMonitor(destination.stream);
    } else {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: includeVideo,
        })
        .then((mediaStream) => {
          setupRecorderAndMonitor(mediaStream);
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
        });
    }
  }, [audioCtx, resamplerMode, setupRecorderAndMonitor]); // audioCtx, addNewSample, samplerEngine

  const startRecording = useCallback(() => {
    if (!audioCtx) {
      console.error('AudioContext not available in startRecording');
      return;
    }

    if (!(recorder.current && stream.current)) throw new Error('No stream');
    if (recorder.current.state === 'inactive') {
      // TODO: Implement bake / autoResample
      // if (isResampling && autoResample) {
      //   samplerEngine?.playSample(latestSelectedLoadedSample?.id);
      // }

      recorder.current.start();
      setRecorderState('recording');
    } else {
      console.log('MediaRecorder is already active or not initialized');
    }
  }, [audioCtx]);

  const stopRecording = useCallback(() => {
    if (!audioCtx) {
      console.error('AudioContext not available in stopRecording');
      return;
    }

    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop();
    }

    if (volumeMonitor.current) {
      volumeMonitor.current.stopMonitoringStream();
      volumeMonitor.current = null;
    }
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
      stream.current = null;
    }
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    setStreamVolume(null);
    setRecorderState('idle');

    if (resamplingInput.current && resamplerMode) {
      /* if ReSampling */
      disconnectExternalOutput(resamplingInput.current);
    }
  }, [audioCtx, disconnectExternalOutput, resamplerMode]);

  const handleVolume = useCallback(
    (dB: number) => {
      if (!audioCtx) {
        console.error('AudioContext not available in handleVolume');
        return;
      }

      setStreamVolume(dB);

      if (dB > startThreshold && recStateRef.current === 'armed') {
        // console.log('over threshold:', dB, 'dB, Status:', recorderState);

        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }

        console.log('Starting recording...');
        startRecording();
      } else if (dB <= stopThreshold && recStateRef.current === 'recording') {
        if (!silenceTimer.current) {
          silenceTimer.current = setTimeout(() => {
            console.log('Stopping recording due to silence...');
            stopRecording();
          }, silenceDelay);
        }
      } else if (dB > stopThreshold && recStateRef.current === 'recording') {
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      }
    },
    [audioCtx, startThreshold, stopThreshold, silenceDelay] // resamplerMode startRecording, stopRecording
  );

  useEffect(() => {
    recStateRef.current = recorderState;
    setLabel(
      recorderState === 'idle'
        ? resamplerMode
          ? 'ReSample!'
          : 'Start'
        : recorderState === 'armed'
        ? 'Armed'
        : 'Recording'
    );
  }, [recorderState, resamplerMode]);

  const handleToggle = useCallback(
    // TODO: make mouse click toggle just arm / disarm
    // TODO: disable auto stop recording if recording was started by mouse click ?
    (newState: string) => {
      if (!audioCtx) {
        console.error('AudioContext not available in handleToggle');
        return;
      }

      console.log('newState:', newState);
      switch (newState) {
        case 'idle':
          stopRecording();
          break;
        case 'armed':
          armRecording();
          break;
        case 'recording':
          // This state is handled automatically by the volume threshold
          break;
      }
      setRecorderState(newState as 'idle' | 'armed' | 'recording');
    },
    [armRecording, stopRecording, audioCtx]
  );

  return (
    <div className={className}>
      <ToggleMultiState // Does not need multi state !
        currentState={recorderState}
        states={['idle', 'armed', 'recording']}
        onToggle={handleToggle}
        label={label}
        type='recordArm'
        // disabled={!isAudioReady}
      />
    </div>
  );
};

export default Recorder;

// const { ensureAudioContext, decodeAudioData } = useAudioCtxUtils();
// const audioCtx = useAudioCtx();
// const [forceRender, setForceRender] = useState<boolean>(false);

// useEffect(() => {
//   setForceRender((prev) => !prev);
// }, [audioCtx, isAudioReady]);

/* <Toggle
        label={label}
        isOn={recorderState === 'recording'}
        onToggle={toggleArm}
        type='record'
        // disabled={!isAudioReady}
      /> */

// const toggleArm = useCallback(() => {
//   if (!isAudioReady || !audioCtx) {
//     console.warn('Audio not ready in toggleArm');
//     return;
//   }

//   if (recorderState === 'idle') {
//     armRecording();
//   } else {
//     stopRecording();
//   }
// }, [recorderState, armRecording, stopRecording, isAudioReady]);

/* Clean up */
// useEffect(() => {
//   return stopRecording;
// }, [stopRecording]);

// useEffect(() => {
//   recStateRef.current = recorderState;
//   if (resamplerMode) {
//     recorderState === 'idle' && setLabel('ReSample!');
//   } else {
//     recorderState === 'idle' && setLabel('Start');
//   }
//   recorderState === 'armed' && setLabel('Armed');
//   recorderState === 'recording' && setLabel('Recording');
// }, [recorderState, resamplerMode]);

// BELOW IS INCLUDING NON-FUNCTIONAL CALIBRATION CODE

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import VolumeMonitor from '../../lib/audio-utils/VolumeMonitor';
// import { useReactAudioCtx } from '../../contexts/ReactAudioCtx';
// import { useSamplerCtx } from '../../contexts/SamplerCtx';
// import { ToggleMultiState } from '../UI/Basic/Toggle';
// import { useRecorder } from '../../hooks/useRecorder';
// import { set } from 'react-hook-form';

// interface RecorderProps {
//   className?: string;
//   resamplerMode?: boolean;
// }

// const Recorder: React.FC<RecorderProps> = ({
//   className,
//   resamplerMode = false,
// }) => {
//   const [audioFormat, setAudioFormat] = useState<'wav' | 'webm'>('webm'); // TODO: Add support for other formats
//   const [includeVideo, setIncludeVideo] = useState<boolean>(false);

//   const [streamVolume, setStreamVolume] = useState<number | null>(null);
//   const [label, setLabel] = useState<string>('');

//   const [recorderState, setRecorderState] = useState<
//     'idle' | 'armed' | 'recording'
//   >('idle');
//   const recStateRef = useRef(recorderState); // do we need the useState also?

//   const recorder = useRef<MediaRecorder | null>(null);
//   const stream = useRef<MediaStream | null>(null);
//   const volumeMonitor = useRef<VolumeMonitor | null>(null);
//   const resamplingInput = useRef<MediaStreamAudioDestinationNode | null>(null);

//   const startThreshold = resamplerMode ? -200 : -35; // dB // REMOVE IF calibrate replaces
//   const stopThreshold = resamplerMode ? -95 : -40; // dB // REMOVE IF calibrate replaces
//   const silenceDelay = resamplerMode ? 50 : 200; // ms
//   const silenceTimer = useRef<NodeJS.Timeout | null>(null);

//   const { audioCtx } = useReactAudioCtx();
//   const { samplerEngine, addNewSample } = useSamplerCtx();
//   const { setIsRecording, handleNewRecording } = useRecorder();

//   useEffect(() => {
//     recStateRef.current = recorderState;
//     if (resamplerMode) {
//       recorderState === 'idle' && setLabel('ReSample!');
//     } else {
//       recorderState === 'idle' && setLabel('Start');
//     }
//     recorderState === 'armed' && setLabel('Armed');
//     recorderState === 'recording' && setLabel('Recording');
//   }, [recorderState]);

//   const armRecording = useCallback(() => {
//     if (!(audioCtx && samplerEngine)) {
//       console.error('AudioContext or SamplerEngine not available');
//       return;
//     }

//     const setupRecorderAndMonitor = (mediaStream: MediaStream) => {
//       stream.current = mediaStream;
//       recorder.current = new MediaRecorder(mediaStream);

//       recorder.current.ondataavailable = async (e) => {
//         const { record, audioBuffer } = await handleNewRecording(e.data);
//         addNewSample(record, audioBuffer);
//       };

//       volumeMonitor.current = new VolumeMonitor(mediaStream);
//       volumeMonitor.current.monitorVolume(handleVolume);

//       setRecorderState('armed');
//     };
//     if (resamplerMode) {
//       const destination = audioCtx.createMediaStreamDestination();
//       samplerEngine.connectToExternalOutput(destination);
//       resamplingInput.current = destination;
//       setupRecorderAndMonitor(destination.stream);
//     } else {
//       navigator.mediaDevices
//         .getUserMedia({
//           audio: true,
//           video: includeVideo,
//         })
//         .then((mediaStream) => {
//           setupRecorderAndMonitor(mediaStream);
//         })
//         .catch((error) => {
//           console.error('Error accessing media devices:', error);
//         });
//     }
//   }, [handleNewRecording, addNewSample, includeVideo, audioCtx, samplerEngine]);

//   // _______________________ CALIBRATION TEST ______________________________ MOVE SOMEWHERE

//   const [isCalibrating, setIsCalibrating] = useState(false);
//   const [calibratedThreshold, setCalibratedThreshold] = useState<number | null>(
//     null
//   );

//   const calibrate = useCallback(() => {
//     setIsCalibrating(true);
//     let samples = 0;
//     let sum = 0;
//     const sampleDuration = 2000; // 2 seconds of sampling
//     const startTime = Date.now();

//     const sampleVolume = () => {
//       if (volumeMonitor.current && volumeMonitor.current.getVolume()) {
//         const volume = volumeMonitor.current.getVolume();
//         sum += volume!; // !
//         samples++;

//         if (Date.now() - startTime < sampleDuration) {
//           requestAnimationFrame(sampleVolume);
//         } else {
//           const averageVolume = sum / samples;
//           const newThreshold = averageVolume + 10; // 10 dB safety margin
//           setCalibratedThreshold(newThreshold);
//           setIsCalibrating(false);
//           console.log(`Calibrated threshold: ${newThreshold} dB`);
//         }
//       }
//     };

//     if (resamplerMode && audioCtx && resamplingInput.current) {
//       // For resampling, we need to create a silent source
//       const silentSource = audioCtx.createBufferSource();
//       silentSource.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
//       silentSource.connect(resamplingInput.current);
//       silentSource.start();
//     }

//     // Start the calibration process
//     armRecording();
//     requestAnimationFrame(sampleVolume);
//   }, [armRecording, audioCtx, resamplerMode]);

//   // _______________________ CALIBRATION TEST ______________________________ MOVE SOMEWHERE

//   const handleVolume = useCallback(
//     (dB: number) => {
//       setStreamVolume(dB);

//       const activeStartThreshold =
//         calibratedThreshold ?? (resamplerMode ? -70 : -35); // -70 : -35 dB same as startRecThreshold
//       const activeStopThreshold = activeStartThreshold - 5; // 5 dB below start threshold

//       if (dB > activeStartThreshold && recStateRef.current === 'armed') {
//         console.log('over threshold:', dB, 'dB, Status:', recorderState);

//         if (silenceTimer.current) {
//           clearTimeout(silenceTimer.current);
//           silenceTimer.current = null;
//         }

//         console.log('Starting recording...');
//         startRecording();
//       } else if (
//         dB <= activeStopThreshold &&
//         recStateRef.current === 'recording'
//       ) {
//         if (!silenceTimer.current) {
//           silenceTimer.current = setTimeout(() => {
//             console.log('Stopping recording due to silence...');
//             stopRecording();
//           }, silenceDelay);
//         }
//       } else if (
//         dB > activeStopThreshold &&
//         recStateRef.current === 'recording'
//       ) {
//         if (silenceTimer.current) {
//           clearTimeout(silenceTimer.current);
//           silenceTimer.current = null;
//         }
//       }
//     },
//     [calibratedThreshold, resamplerMode]
//   );

//   const startRecording = useCallback(() => {
//     if (!(recorder.current && stream.current)) throw new Error('No stream');
//     if (recorder.current.state === 'inactive') {
//       console.log('Actually starting MediaRecorder...');

//       // TODO: Implement bake / autoResample
//       // if (isResampling && autoResample) {
//       //   samplerEngine?.playSample(latestSelectedLoadedSample?.id);
//       // }

//       recorder.current.start();
//       setRecorderState('recording');
//       setIsRecording(true);
//     } else {
//       console.log('MediaRecorder is already active or not initialized');
//     }
//   }, [setIsRecording]);

//   const stopRecording = useCallback(() => {
//     if (recorder.current && recorder.current.state !== 'inactive') {
//       recorder.current.stop();
//     }

//     if (volumeMonitor.current) {
//       volumeMonitor.current.stopMonitoringStream();
//       volumeMonitor.current = null;
//     }
//     if (stream.current) {
//       stream.current.getTracks().forEach((track) => track.stop());
//       stream.current = null;
//     }
//     if (silenceTimer.current) {
//       clearTimeout(silenceTimer.current);
//       silenceTimer.current = null;
//     }
//     setStreamVolume(null);
//     setRecorderState('idle');
//     setIsRecording(false);

//     if (resamplingInput.current && resamplerMode && samplerEngine) {
//       /* if ReSampling */
//       samplerEngine.disconnectExternalOutput(resamplingInput.current);
//     }
//   }, [setIsRecording]);

//   useEffect(() => {
//     return stopRecording;
//   }, [stopRecording]);

//   const handleToggle = useCallback(
//     (newState: string) => {
//       switch (newState) {
//         case 'idle':
//           stopRecording();
//           break;
//         case 'armed':
//           armRecording();
//           break;
//         case 'recording':
//           // This state is handled automatically by the volume threshold
//           break;
//       }
//       setRecorderState(newState as 'idle' | 'armed' | 'recording');
//     },
//     [armRecording, stopRecording]
//   );

//   return (
//     <div className={className}>
//       <ToggleMultiState
//         currentState={recorderState}
//         states={['idle', 'armed', 'recording']}
//         onToggle={handleToggle}
//         label={label}
//         type='recordArm'
//       />
//       <button
//         onClick={calibrate}
//         disabled={isCalibrating || recorderState !== 'idle'}
//       >
//         {isCalibrating ? 'Calibrating...' : 'Calibrate'}
//       </button>
//       {calibratedThreshold !== null && (
//         <p>Calibrated Threshold: {calibratedThreshold.toFixed(2)} dB</p>
//       )}
//     </div>
//   );
// };

// export default Recorder;
