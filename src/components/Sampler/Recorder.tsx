import React, { useState, useEffect, useRef, useCallback } from 'react';
import VolumeMonitor from '../../lib/audio-utils/VolumeMonitor';
import { useReactAudioCtx } from '../../contexts/ReactAudioCtx';
import { useSamplerCtx } from '../../contexts/SamplerCtx';
import { ToggleMultiState } from '../UI/Basic/Toggle';
import { useRecorder } from '../../hooks/useRecorder';

interface RecorderProps {
  className?: string;
  resamplerMode?: boolean;
}

const Recorder: React.FC<RecorderProps> = ({
  className,
  resamplerMode = false,
}) => {
  const [audioFormat, setAudioFormat] = useState<'wav' | 'webm'>('webm');
  const [includeVideo, setIncludeVideo] = useState<boolean>(false);

  const [streamVolume, setStreamVolume] = useState<number | null>(null);
  const [label, setLabel] = useState<string>('');

  const [recorderState, setRecorderState] = useState<
    'idle' | 'armed' | 'recording'
  >('idle');
  const recStateRef = useRef(recorderState); // do we need the useState also?

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const volumeMonitor = useRef<VolumeMonitor | null>(null);
  const resamplingInput = useRef<MediaStreamAudioDestinationNode | null>(null);

  const startRecThreshold = resamplerMode ? -200 : -35; // dB
  const stopRecThreshold = resamplerMode ? -95 : -40; // dB
  const silenceDelay = resamplerMode ? 50 : 200; // ms
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const { audioCtx } = useReactAudioCtx();
  const { samplerEngine, addNewSample } = useSamplerCtx();
  const { setIsRecording, handleNewRecording } = useRecorder();

  useEffect(() => {
    recStateRef.current = recorderState;
    if (resamplerMode) {
      recorderState === 'idle' && setLabel('ReSample!');
    } else {
      recorderState === 'idle' && setLabel('Start');
    }
    recorderState === 'armed' && setLabel('Armed');
    recorderState === 'recording' && setLabel('Recording');
  }, [recorderState]);

  const armRecording = useCallback(() => {
    if (!(audioCtx && samplerEngine)) {
      console.error('AudioContext or SamplerEngine not available');
      return;
    }

    const setupRecorderAndMonitor = (mediaStream: MediaStream) => {
      stream.current = mediaStream;
      recorder.current = new MediaRecorder(mediaStream);

      recorder.current.ondataavailable = async (e) => {
        const { record, audioBuffer } = await handleNewRecording(e.data);
        addNewSample(record, audioBuffer);
      };

      volumeMonitor.current = new VolumeMonitor(mediaStream);
      volumeMonitor.current.monitorVolume(handleVolume);

      setRecorderState('armed');
      console.log('Armed!');
    };
    if (resamplerMode) {
      const destination = audioCtx.createMediaStreamDestination();
      samplerEngine.connectToExternalOutput(destination);
      resamplingInput.current = destination;
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
  }, [handleNewRecording, addNewSample, includeVideo, audioCtx, samplerEngine]);

  // _______________________ CALIBRATION TEST ______________________________ MOVE SOMEWHERE

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibratedThreshold, setCalibratedThreshold] = useState<number | null>(
    null
  );

  const calibrate = useCallback(() => {
    setIsCalibrating(true);
    let samples = 0;
    let sum = 0;
    const sampleDuration = 2000; // 2 seconds of sampling
    const startTime = Date.now();

    const sampleVolume = () => {
      if (volumeMonitor.current && volumeMonitor.current.getVolume()) {
        const volume = volumeMonitor.current.getVolume();
        sum += volume!; // !
        samples++;

        if (Date.now() - startTime < sampleDuration) {
          requestAnimationFrame(sampleVolume);
        } else {
          const averageVolume = sum / samples;
          const newThreshold = averageVolume + 10; // 10 dB safety margin
          setCalibratedThreshold(newThreshold);
          setIsCalibrating(false);
          console.log(`Calibrated threshold: ${newThreshold} dB`);
        }
      }
    };

    if (resamplerMode && audioCtx && resamplingInput.current) {
      // For resampling, we need to create a silent source
      const silentSource = audioCtx.createBufferSource();
      silentSource.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
      silentSource.connect(resamplingInput.current);
      silentSource.start();
    }

    // Start the calibration process
    armRecording();
    requestAnimationFrame(sampleVolume);
  }, [armRecording, audioCtx, resamplerMode]);

  // _______________________ CALIBRATION TEST ______________________________ MOVE SOMEWHERE

  const handleVolume = useCallback(
    (dB: number) => {
      setStreamVolume(dB);

      const activeThreshold =
        calibratedThreshold ?? (resamplerMode ? -70 : -35);
      const activeStopThreshold = activeThreshold - 5; // 5 dB below start threshold

      if (dB > activeThreshold && recStateRef.current === 'armed') {
        console.log('over threshold:', dB, 'dB, Status:', recorderState);

        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }

        console.log('Starting recording...');
        startRecording();
      } else if (
        dB <= activeStopThreshold &&
        recStateRef.current === 'recording'
      ) {
        if (!silenceTimer.current) {
          silenceTimer.current = setTimeout(() => {
            console.log('Stopping recording due to silence...');
            stopRecording();
          }, silenceDelay);
        }
      } else if (dB > stopRecThreshold && recStateRef.current === 'recording') {
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      }
    },
    [calibratedThreshold, resamplerMode]
  );

  const startRecording = useCallback(() => {
    if (!(recorder.current && stream.current)) throw new Error('No stream');
    if (recorder.current.state === 'inactive') {
      console.log('Actually starting MediaRecorder...');

      // if (isResampling && autoResample) {
      //   samplerEngine?.playSample(latestSelectedLoadedSample?.id);
      // }

      recorder.current.start();
      setRecorderState('recording');
      setIsRecording(true);
    } else {
      console.log('MediaRecorder is already active or not initialized');
    }
  }, [setIsRecording]);

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
    setRecorderState('idle');
    setIsRecording(false);

    if (resamplingInput.current && resamplerMode && samplerEngine) {
      /* if ReSampling */
      samplerEngine.disconnectExternalOutput(resamplingInput.current);
    }
  }, [setIsRecording]);

  useEffect(() => {
    return stopRecording;
  }, [stopRecording]);

  const handleToggle = useCallback(
    (newState: string) => {
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
    [armRecording, stopRecording]
  );

  return (
    <div className={className}>
      <ToggleMultiState
        currentState={recorderState}
        states={['idle', 'armed', 'recording']}
        onToggle={handleToggle}
        label={label}
        type='recordArm'
      />
      <button
        onClick={calibrate}
        disabled={isCalibrating || recorderState !== 'idle'}
      >
        {isCalibrating ? 'Calibrating...' : 'Calibrate'}
      </button>
      {calibratedThreshold !== null && (
        <p>Calibrated Threshold: {calibratedThreshold.toFixed(2)} dB</p>
      )}
    </div>
  );
};

export default Recorder;
