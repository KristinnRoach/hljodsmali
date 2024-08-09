import React, { useState, useEffect, useRef, useCallback } from 'react';
import VolumeMonitor from '../../lib/audio/VolumeMonitor';
import { useSamplerCtx } from '../../contexts/sampler-context';

const Recorder: React.FC = () => {
  const [audioFormat, setAudioFormat] = useState<'wav' | 'webm'>('webm');
  const [includeVideo, setIncludeVideo] = useState<boolean>(false);
  const [streamVolume, setStreamVolume] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'armed' | 'recording'>('idle');
  const [buttonText, setButtonText] = useState('Arm Recording'); // Initialize with the default value for 'idle'

  const statusRef = useRef(status);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const volumeMonitor = useRef<VolumeMonitor | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecThreshold = -40; // dB
  const stopRecThreshold = -40; // dB
  const silenceDelay = 100; // ms
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const { handleNewRecording } = useSamplerCtx();

  // Update statusRef whenever status changes
  useEffect(() => {
    statusRef.current = status;
    const buttonTextMap = {
      idle: 'Arm Recording',
      armed: 'Armed',
      recording: 'Recording',
    };
    setButtonText(buttonTextMap[status]);
  }, [status]);

  const armRecording = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        // video: includeVideo, // for later
      })
      .then((newStream) => {
        stream.current = newStream;
        recorder.current = new MediaRecorder(newStream);
        recorder.current.ondataavailable = (e) => chunks.current.push(e.data);
        recorder.current.onstop = () => {
          const blob = new Blob(chunks.current, {
            type: `audio/${audioFormat}`,
          });
          handleNewRecording(blob);
          chunks.current = [];
        };

        volumeMonitor.current = new VolumeMonitor(newStream);
        volumeMonitor.current.monitorVolume(handleVolume);

        setStatus('armed');

        console.log('Armed!'); // Added for debugging
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }, [handleNewRecording, audioFormat]); // includeVideo

  const handleVolume = useCallback((dB: number) => {
    setStreamVolume(dB);
    console.log(statusRef.current); // Added for debugging

    if (dB > startRecThreshold && statusRef.current === 'armed') {
      console.log('over threshold:', dB, 'dB, Status:', status); // Added for debugging

      if (silenceTimer.current) {
        // should this be here?
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }

      console.log('Starting recording...'); // Added for debugging
      startRecording();
    } else if (dB <= stopRecThreshold && statusRef.current === 'recording') {
      if (!silenceTimer.current) {
        silenceTimer.current = setTimeout(() => {
          console.log('Stopping recording due to silence...'); // Added for debugging
          stopRecording();
          // silenceTimer.current = null;
        }, silenceDelay);
      }
    } else if (dB > stopRecThreshold && statusRef.current === 'recording') {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!(recorder.current && stream.current)) throw new Error('No stream');
    if (recorder.current.state === 'inactive') {
      console.log('Actually starting MediaRecorder...'); // Added for debugging
      recorder.current.start();
      setStatus('recording');
    } else {
      console.log('MediaRecorder is already active or not initialized');
    }
  }, []); // empty ?? remove callback ??

  const stopRecording = useCallback(() => {
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
    setStatus('idle');
  }, []);

  useEffect(() => {
    return stopRecording;
  }, [stopRecording]);

  return (
    <div>
      <button onClick={status === 'idle' ? armRecording : stopRecording}>
        {buttonText}
      </button>
      {streamVolume !== null && (
        <p>Current Volume: {streamVolume.toFixed(2)} dB</p>
      )}
      <p>Status: {status}</p>
    </div>
  );
};

export default Recorder;

// detectSilence(
//   audioCtx!,
//   newStream,
//   stopRecording,
//   startRecording,

//   silenceDelay,
//   startRecThreshold
// );

// useEffect(() => {
//   return () => {
//     stopRecording();
//   };
// }, [stopRecording]);

// const armRecording = useCallback(async () => {
//   try {
//     const audioStream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//     });
//     stream.current = audioStream;
//     setStatus('armed');
//     animationFrameId.current = requestAnimationFrame(handleVolume);
//   } catch (error) {
//     console.error('Error accessing the microphone', error);
//   }
// }, [handleVolume]);

// const lastVolumeTime = useRef<number>(0);
// const volumeState = useRef<'idle' | 'overThreshold' | 'underThreshold'>(
//   'idle'
// );

// const handleVolume = useCallback(() => {
//   if (stream.current) {
//     const currentVolume = getVolume(stream.current);
//     setStreamVolume(currentVolume);

//     const currentTime = performance.now();

//     if (currentVolume !== null) {
//       if (currentVolume > startRecThreshold && status === 'armed') {
//         volumeState.current = 'overThreshold';
//         console.log('Sound detected! Starting recording...');
//         startRecording(stream.current);
//       } else if (
//         currentVolume <= stopRecThreshold &&
//         status === 'recording'
//       ) {
//         if (volumeState.current !== 'underThreshold') {
//           volumeState.current = 'underThreshold';
//           lastVolumeTime.current = currentTime;
//         } else if (currentTime - lastVolumeTime.current >= silenceDelay) {
//           console.log('Silence detected! Stopping recording...');
//           stopRecording();
//         }
//       } else {
//         volumeState.current = 'idle';
//       }
//     }

//     animationFrameId.current = requestAnimationFrame(handleVolume);
//   }
// }, [status]);

// import React, { useState, useRef, useCallback } from 'react';

// import {
//   detectVolume,
//   stopDetectingVolume,
//   getCtxTime,
// } from '../../lib/audio/audioCtx-utils';
// import { useSamplerCtx } from '../../contexts/sampler-context';

// const Recorder: React.FC = () => {
//   const [audioFormat, setAudioFormat] = useState<'wav' | 'webm'>('webm');
//   const [status, setStatus] = useState<'idle' | 'armed' | 'recording'>('idle');

//   const recorder = useRef<MediaRecorder | null>(null);
//   const chunks = useRef<Blob[]>([]);
//   const stream = useRef<MediaStream | null>(null);

//   const [streamVolume, setStreamVolume] = useState<number | null>(null);
//   const animationFrameId = useRef<number | null>(null);

//   const startRecThreshold = -8; // dB
//   const stopRecThreshold = -20; // dB
//   const detectionDelay = 200; // ms

//   const { handleNewRecording } = useSamplerCtx();

//   const handleVolume = () => {
//     if (stream.current) {
//       const currentVolume = detectVolume(stream.current);
//       setStreamVolume(currentVolume);

//       // Here you can implement your sound/silence detection logic
//       if (currentVolume !== null) {
//         if (currentVolume > startRecThreshold) {
//           console.log('detectVolume: ', currentVolume, 'state: ', streamVolume); // streamVolume is null
//           startRecording(stream.current);
//         } else if (currentVolume <= stopRecThreshold) {
//           console.log('Silence detected!');
//           stopRecording();
//         }
//       }

//       animationFrameId.current = requestAnimationFrame(handleVolume);
//     }
//   };

//   const stopRecording = useCallback(() => {
//     if (recorder.current) {
//       recorder.current.stop();
//     }
//   }, []);

//   const onStopRecording = useCallback(() => {
//     const blob = new Blob(chunks.current, { type: audioFormat });
//     handleNewRecording(blob);
//     chunks.current = [];

//     setStatus('idle');
//     cleanupStream();
//     stopDetectingVolume();
//   }, [handleNewRecording, audioFormat, cleanupStream]);

//   function cleanupStream() {
//     if (stream.current) {
//       stream.current.getTracks().forEach((track) => track.stop());
//       stream.current = null;
//     }
//   }

//   const startRecording = useCallback(
//     (stream: MediaStream) => {
//       recorder.current = new MediaRecorder(stream);
//       recorder.current.ondataavailable = (event) => {
//         chunks.current.push(event.data);
//       };
//       recorder.current.onstop = async () => onStopRecording();
//       recorder.current.start();
//       setStatus('recording');
//     },
//     [handleNewRecording, audioFormat, onStopRecording]
//   );

//   const armRecording = useCallback(async () => {
//     try {
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });
//       stream.current = newStream;
//       setStatus('armed');
//       animationFrameId.current = requestAnimationFrame(handleVolume);
//     } catch (error) {
//       console.error('Error accessing the microphone', error);
//     }
//   }, [status]);

//   const toggleArm = useCallback(() => {
//     if (status === 'idle') {
//       armRecording();
//       return;
//     }

//     if (status === 'recording') {
//       // clean up tracks n stuff
//       stopRecording();
//     }

//     if (status === 'armed') {
//       stopDetectingVolume();
//       return;
//     }
//   }, [status, armRecording]);

//   const buttonText = {
//     idle: 'Arm Recording',
//     armed: 'Armed',
//     recording: 'Recording',
//   }[status];

//   return (
//     <div>
//       <button onClick={toggleArm}>{buttonText}</button>
//     </div>
//   );
// };

// export default Recorder;

// // const startRecording = useCallback(async () => {
// //   try {
// //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //     mediaRecorder.current = new MediaRecorder(stream);

// //     mediaRecorder.current.ondataavailable = (event) => {
// //       audioChunks.current.push(event.data);
// //     };

// //     mediaRecorder.current.onstop = () => {
// //       const blob = new Blob(audioChunks.current, { type: 'audio/webm' });

// //       handleNewRecording(blob);

// //       audioChunks.current = [];
// //     };

// //     mediaRecorder.current.start();
// //     setIsRecording(true);
// //   } catch (error) {
// //     console.error('Error accessing the microphone:', error);
// //   }
// // }, []);
