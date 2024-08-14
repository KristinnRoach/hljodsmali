export function normalizeBuffer_Peak(
  buffer: AudioBuffer,
  targetPeak: number = 0.9
) {
  const channelData = buffer.getChannelData(0);
  const peak = Math.max(...channelData.map(Math.abs));
  const scaleFactor = targetPeak / peak;

  for (let i = 0; i < channelData.length; i++) {
    channelData[i] *= scaleFactor;
  }
}

export function normalizeBuffer_RMS(
  ctx: AudioContext,
  buffer: AudioBuffer,
  targetRMS: number = 0.3
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const bufferLength = buffer.length;

  // Calculate RMS across all channels
  let squaredSum = 0;
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < bufferLength; i++) {
      squaredSum += channelData[i] * channelData[i];
    }
  }
  const rms = Math.sqrt(squaredSum / (bufferLength * numChannels));

  if (rms <= 1e-6) return buffer; // Avoid division by near-zero

  const scaleFactor = targetRMS / rms;

  // Apply normalization with a simple limiter
  const limit = 0.99;
  const limitedScaleFactor = Math.min(
    scaleFactor,
    limit /
      Math.max(
        ...Array.from({ length: numChannels }, (_, i) =>
          Math.max(...buffer.getChannelData(i))
        )
      )
  );

  const normalizedBuffer = ctx.createBuffer(
    numChannels,
    bufferLength,
    sampleRate
  );

  for (let channel = 0; channel < numChannels; channel++) {
    const inputData = buffer.getChannelData(channel);
    const outputData = normalizedBuffer.getChannelData(channel);
    for (let i = 0; i < bufferLength; i++) {
      outputData[i] = inputData[i] * limitedScaleFactor;
    }
  }

  return normalizedBuffer;
}

// export function normalizeBuffer_RMS(
//   audioBuffer: AudioBuffer,
//   targetRMS: number = 0.3,
//   attackTime: number = 0.01,
//   releaseTime: number = 0.05
// ) {
//   const sampleRate = audioBuffer.sampleRate;
//   const channelData = audioBuffer.getChannelData(0);
//   const envelopeFollower = new Float32Array(channelData.length);

//   const attackCoeff = Math.exp(-1 / (sampleRate * attackTime));
//   const releaseCoeff = Math.exp(-1 / (sampleRate * releaseTime));

//   let envelope = 0;
//   for (let i = 0; i < channelData.length; i++) {
//     const inputSquared = channelData[i] * channelData[i];
//     if (inputSquared > envelope) {
//       envelope = attackCoeff * (envelope - inputSquared) + inputSquared;
//     } else {
//       envelope = releaseCoeff * (envelope - inputSquared) + inputSquared;
//     }
//     envelopeFollower[i] = Math.sqrt(envelope);
//   }

//   const maxEnvelope = Math.max(...envelopeFollower);
//   const scaleFactor = targetRMS / maxEnvelope;

//   for (let i = 0; i < channelData.length; i++) {
//     channelData[i] *= scaleFactor;
//   }
// }
