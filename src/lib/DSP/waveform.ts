import { Loaded } from '../SamplerEngine';

export async function renderAndDrawWaveform(
  loadedSample: Loaded
): Promise<AudioBuffer | undefined> {
  const buffer = loadedSample.buffer;
  const settings = loadedSample.sample.sample_settings;
  if (!(buffer && settings)) return;

  const { attackTime, releaseTime, startPoint, endPoint, loopStart, loopEnd } =
    loadedSample.sample.sample_settings;
  const sampleRate = buffer.sampleRate;
  const duration = (endPoint - startPoint) / sampleRate;

  const offlineCtx = new OfflineAudioContext(
    1,
    duration * sampleRate,
    sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.loopStart = loopStart / sampleRate;
  source.loopEnd = loopEnd / sampleRate;

  const gainNode = offlineCtx.createGain();
  source.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  // Apply envelope
  const now = offlineCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
  gainNode.gain.setValueAtTime(1, now + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  source.start(now, startPoint / sampleRate);
  source.stop(now + duration);

  const renderedBuffer = await offlineCtx.startRendering();

  return renderedBuffer;

  // Draw waveform (using a library like wavesurfer.js or your own drawing function)
  //   drawWaveform(renderedBuffer);
}

export function drawWaveform(
  buffer: AudioBuffer,
  canvas: HTMLCanvasElement,
  color: string = '#3498db'
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.moveTo(0, amp);

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;

    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }

    ctx.lineTo(i, (1 + min) * amp);
    ctx.lineTo(i, (1 + max) * amp);
  }

  ctx.strokeStyle = color;
  ctx.stroke();

  // Optional: Draw center line
  ctx.beginPath();
  ctx.moveTo(0, amp);
  ctx.lineTo(width, amp);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();
}

const canvas = document.getElementById('waveformCanvas') as HTMLCanvasElement;
canvas.width = 800; // Set desired width
canvas.height = 200; // Set desired height

const renderedBuffer = await renderAndDrawWaveform(loadedSample);

drawWaveform(renderedBuffer, canvas, '#3498db');

/*
// Assuming you have UI elements for these parameters
attackSlider.addEventListener('input', updateWaveform);
releaseSlider.addEventListener('input', updateWaveform);
// ... add listeners for other parameters

function updateWaveform() {
  const attack = attackSlider.value;
  const release = releaseSlider.value;
  const startPoint = startPointSlider.value;
  const endPoint = endPointSlider.value;
  const loopStart = loopStartSlider.value;
  const loopEnd = loopEndSlider.value;

  renderAndDrawWaveform(
    currentAudioBuffer,
    attack,
    release,
    startPoint,
    endPoint,
    loopStart,
    loopEnd
  );
}
  */
