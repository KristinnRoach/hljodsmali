import audioCtx from './webAudioCtx';

export function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  start: number,
  end: number
) {
  const newBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    end - start,
    audioBuffer.sampleRate
  );

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i);
    const newChannelData = newBuffer.getChannelData(i);

    for (let j = start; j < end; j++) {
      newChannelData[j - start] = channelData[j];
    }
  }

  return newBuffer;
}
