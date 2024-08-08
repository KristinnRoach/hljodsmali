// src/hooks/useAudioRecorder.ts

'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioRecorder } from '../lib/audio/recording/AudioRecorder';
import { APP_FORMATS, AudioFormat, FormatKey } from '../types/mimeTypes';

export const useAudioRecorder = (initialFormat: FormatKey = 'WEBM') => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recorderRef = useRef<AudioRecorder | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
    }
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      recorderRef.current = new AudioRecorder(initialFormat);
    }
    return () => {
      if (recorderRef.current) {
        recorderRef.current.dispose();
      }
    };
  }, [initialFormat, permissionGranted]);

  const startRecording = useCallback(async () => {
    if (!permissionGranted) {
      await requestPermission();
    }
    if (permissionGranted && recorderRef.current) {
      await recorderRef.current.start();
      setIsRecording(true);
    }
  }, [permissionGranted, requestPermission]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return null;

    const blob = await recorderRef.current.stop();
    setAudioBlob(blob);
    setIsRecording(false);
    return blob;
  }, []);

  const setAudioFormat = useCallback(
    (formatKey: FormatKey) => {
      if (isRecording) {
        console.warn('Cannot change audio format while recording');
        return;
      }
      recorderRef.current?.setAudioFormat(formatKey); // can be undefined - otherwise ' || initialFormat'
    },
    [isRecording]
  );

  const getAudioFormatInfo = useCallback((): AudioFormat => {
    return (
      recorderRef.current?.getAudioFormatInfo() || APP_FORMATS[initialFormat]
    );
  }, []);

  const getAudioFormatKey = useCallback((): FormatKey => {
    return recorderRef.current?.getAudioFormatKey() || initialFormat;
  }, []);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    setAudioFormat,
    getAudioFormatInfo,
    getAudioFormatKey,
    requestPermission,
    permissionGranted,
  };
};
