import { findZeroCrossings } from '../lib/audio-utils/zeroCrossingUtils';
import { LoadedSample } from '../lib/audio/SamplerEngine/SamplerEngine';
import { Sample_settings } from '../types/samples';
import { useState, useCallback } from 'react';

export function useResample() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const renderToFileOffline = useCallback(
    async (
      playbackRate: number,
      loadedSample: LoadedSample,
      settings: Sample_settings,
      offsetDuration: number = 0,
      shouldLoop: boolean = false
    ): Promise<AudioBuffer | undefined> => {
      setIsProcessing(true);
      setError(null);

      console.log('renderToFileOffline', loadedSample, settings);

      try {
        const originalBuffer = loadedSample.buffer;

        const bufferDuration = originalBuffer.duration;
        const startPoint = settings.startPoint ?? 0;
        const endPoint = settings.endPoint ?? bufferDuration;
        const loopStart = settings.loopStart ?? 0;
        const loopEnd = settings.loopEnd ?? bufferDuration;
        const attackTime = settings.attackTime ?? 0.1;
        const releaseTime = settings.releaseTime ?? 0.1;

        const playDuration = endPoint - startPoint + offsetDuration;
        const sustainDuration = playDuration - attackTime - releaseTime;
        const loopDuration = loopEnd - loopStart;

        const offlineCtx = new OfflineAudioContext(
          originalBuffer.numberOfChannels,
          originalBuffer.length,
          originalBuffer.sampleRate
        );

        const offlineSource = offlineCtx.createBufferSource();
        offlineSource.buffer = originalBuffer;
        offlineSource.loopStart = loopStart;
        offlineSource.loopEnd = loopEnd;
        offlineSource.loop = settings.loopLocked || shouldLoop;

        const { sampleGain, lowCut, highCut } = loadedSample.sampleNodes;

        // Apply gain, lowCut, and highCut  // or just use the old ones?
        const gain = offlineCtx.createGain();
        gain.gain.value = 1;
        gain.gain.setValueAtTime(1, offlineCtx.currentTime);

        // Create lowCut and highCut
        const highCutFilter = offlineCtx.createBiquadFilter();
        highCutFilter.type = 'lowpass';
        highCutFilter.frequency.value = highCut.frequency.value;
        highCutFilter.Q.value = highCut.Q.value;
        const lowCutFilter = offlineCtx.createBiquadFilter();
        lowCutFilter.type = 'highpass';
        lowCutFilter.frequency.value = lowCut.frequency.value;
        lowCutFilter.Q.value = lowCut.Q.value;

        //  Connect the source to the offline context destination
        gain.connect(offlineCtx.destination);
        offlineSource.connect(gain);
        // gain.connect(lowCutFilter);
        // lowCutFilter.connect(highCutFilter);
        // highCutFilter.connect(offlineCtx.destination);

        // Start the source and render
        offlineSource.start(
          offlineCtx.currentTime,
          startPoint / playbackRate,
          playDuration / playbackRate
        );

        // // Attack // ATTACK AND RELEASE SHOULD NOT DIVIDE BY RATE ?
        // gain.gain.linearRampToValueAtTime(
        //   sampleGain.gain.value,
        //   offlineCtx.currentTime + attackTime / playbackRate
        // );
        // // Sustain
        // gain.gain.setValueAtTime(
        //   sampleGain.gain.value,
        //   offlineCtx.currentTime + (sustainDuration - attackTime) / playbackRate
        // );

        // // Release
        // gain.gain.linearRampToValueAtTime(
        //   0,
        //   offlineCtx.currentTime + releaseTime / playbackRate
        // );

        // Render the audio
        const renderedBuffer = await offlineCtx.startRendering();

        // const newLoadedSample = {
        //   ...loadedSample,
        //   buffer: renderedBuffer,
        //   zeroCrossings: findZeroCrossings(renderedBuffer),
        //   sample_settings: {
        //     ...settings,
        //   },
        // };

        // Convert AudioBuffer to WAV // temporary solution
        // TODO: make download a button for any sample (with audioformat options)
        const wavBlob = await audioBufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rendered_audio.wav';
        link.click();

        // Clean up
        URL.revokeObjectURL(url);

        return renderedBuffer;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        console.error('Error rendering audio:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { renderToFileOffline, isProcessing, error };
}

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels * 2;
  const outputBuffer = new ArrayBuffer(44 + length);

  const view = new DataView(outputBuffer);
  const sampleRate = buffer.sampleRate;
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2 * numberOfChannels, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  const data = new Float32Array(buffer.length * numberOfChannels);
  for (let channel = 0; channel < numberOfChannels; channel++) {
    data.set(buffer.getChannelData(channel), channel * buffer.length);
  }

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return Promise.resolve(new Blob([view], { type: 'audio/wav' }));
}

// const recordNewBuffer = async (audioContext: AudioContext, loadedSample: LoadedSample) => {
//     const audioBufferSourceNode = audioContext.createBufferSource();
//     const mediaRecorder = new MediaRecorder(loadedSample.buffer);
