// src/lib/SamplerEngine.ts
import SingleUseVoice from './SingleUseVoice';
import { Sample } from '../types';

type LoadedSample = {
  sample: Sample;
  buffer: AudioBuffer | null;
};

type SampleInfo = {
  duration: number;
  buffer: AudioBuffer;
};

/* Singleton class for managing audio playback and recording */

export default class SamplerEngine {
  private static instance: SamplerEngine | null = null;

  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private loadedSamples: Map<string, LoadedSample> = new Map();
  private selectedSampleIds: Set<string> = new Set();

  private masterGain: GainNode;

  private activeVoices: Map<string, SingleUseVoice> = new Map();

  /* Constructor */

  private constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    console.log('Audio Engine context: ', this.audioContext);
  }

  /* Get instance */

  public static getInstance(audioContext?: AudioContext): SamplerEngine {
    if (!SamplerEngine.instance) {
      if (!audioContext) {
        throw new Error(
          'AudioContext must be provided when creating AudioEngine instance'
        );
      }
      SamplerEngine.instance = new SamplerEngine(audioContext);
    }
    return SamplerEngine.instance;
  }

  /* Sample Manager */

  async loadSample(sample: Sample, audioBuffer: AudioBuffer): Promise<void> {
    if (this.loadedSamples.has(sample.id)) {
      return;
    }
    try {
      this.loadedSamples.set(sample.id, {
        sample: {
          ...sample,
          // Set default values if not present
          startPoint: sample.startPoint ?? 0,
          endPoint: sample.endPoint ?? audioBuffer.duration,
          attackTime: sample.attackTime ?? 0.02,
          releaseTime: sample.releaseTime ?? 0.2,
        },
        buffer: audioBuffer,
      });
      console.log('Loaded sample: ', sample);
    } catch (error) {
      console.error(
        'Failed to fetch or decode buffer in SamplerEngines loadSample:',
        error
      );
    }
    console.log('Loaded samples: ', this.loadedSamples);
  }

  removeSample(id: string): void {
    this.loadedSamples.delete(id);
    this.selectedSampleIds.delete(id);
  }

  isSampleLoaded(id: string): boolean {
    return this.loadedSamples.has(id);
  }

  setSelectedSamples(ids: string[]): void {
    // add support for multi select
    console.log('Setting selected samples: ', ids);
    this.selectedSampleIds = new Set(ids);
    console.log('Selected samples: ', this.selectedSampleIds);
  }

  getSelectedSamples(): LoadedSample[] {
    return Array.from(this.selectedSampleIds)
      .map((id) => this.loadedSamples.get(id))
      .filter((sample): sample is LoadedSample => sample !== undefined);
  }

  updateSampleSettings(id: string, settings: Partial<Sample>): void {
    const loadedSample = this.loadedSamples.get(id);
    if (loadedSample) {
      loadedSample.sample = { ...loadedSample.sample, ...settings };
    }
  }

  /* Playback */

  // playNote(midiNote: number): void {
  //   const selectedSamples = this.getSelectedSamples();
  //   selectedSamples.forEach((loadedSample) => {
  //     if (loadedSample && loadedSample.buffer) {
  //       this.playSingleSample(loadedSample, rate);
  //     } else {
  //       console.warn(`Sample not loaded: ${loadedSample?.sample.id}`);
  //     }
  //   });
  // }

  playNote(midiNote: number): void {
    const selectedSamples = this.getSelectedSamples();
    selectedSamples.forEach((loadedSample) => {
      if (loadedSample && loadedSample.buffer) {
        const voice = new SingleUseVoice(
          this.audioContext,
          loadedSample.buffer,
          this.masterGain,
          loadedSample.sample.startPoint,
          loadedSample.sample.endPoint
        );
        const rate = 2 ** ((midiNote - 60) / 12); // Convert MIDI note to playback rate
        voice.start(rate, 1, loadedSample.sample.attackTime!);

        const voiceKey = `${loadedSample.sample.id}-${midiNote}`;
        this.activeVoices.set(voiceKey, voice);
      }
    });
  }

  releaseNote(midiNote: number): void {
    const selectedSamples = this.getSelectedSamples();
    selectedSamples.forEach((loadedSample) => {
      const voiceKey = `${loadedSample.sample.id}-${midiNote}`;
      const voice = this.activeVoices.get(voiceKey);
      if (voice) {
        voice.release(loadedSample.sample.releaseTime!);
        this.activeVoices.delete(voiceKey);
      }
    });
  }

  getSampleInfo(sampleId: string): SampleInfo | null {
    const loadedSample = this.loadedSamples.get(sampleId);
    if (loadedSample && loadedSample.buffer) {
      return {
        duration: loadedSample.buffer.duration,
        buffer: loadedSample.buffer,
      };
    }
    return null;
  }

  // private playSingleSample(loadedSample: LoadedSample, rate: number): void {
  //   console.log('Playing note');

  //   const { startPoint, endPoint, attackTime, releaseTime } =
  //     loadedSample.sample;
  //   const source = this.audioContext.createBufferSource();
  //   source.buffer = loadedSample.buffer;

  //   const gainNode = this.audioContext.createGain();
  //   source.connect(gainNode);
  //   gainNode.connect(this.masterGain);

  //   const now = this.audioContext.currentTime;
  //   gainNode.gain.setValueAtTime(0, now);
  //   gainNode.gain.linearRampToValueAtTime(1, now + attackTime!);
  //   gainNode.gain.setValueAtTime(
  //     1,
  //     now + (endPoint! - startPoint!) - releaseTime!
  //   );
  //   gainNode.gain.linearRampToValueAtTime(0, now + (endPoint! - startPoint!));

  //   source.playbackRate.value = rate;
  //   source.start(now, startPoint, endPoint! - startPoint!);
  // }

  // playSingleSample(loadedSample: LoadedSample, note: string, rate: number) {
  //     const { sample, buffer } = loadedSample;
  //     if (!buffer) return;

  //     const voice = new SingleUseVoice(
  //     this.audioContext,
  //     buffer,
  //     this.masterGain,
  //     sample.startPoint,
  //     sample.endPoint
  //     );

  //     voice.start(rate, 0.75, sample.attackTime!);
  //     voice.key = note;
  //     this.voices.set(note, voice);
  // }

  //   playNote(key: string, rate: number) {
  //     if (this.voices.has(key)) {
  //       this.stopNote(key);
  //     }

  //     const voice = new SingleUseVoice(
  //       this.audioContext,
  //       this.buffer,
  //       this.masterGain,
  //       this.startPoint,
  //       this.endPoint
  //     );

  //     voice.start(rate, 0.75, this.attackTime);
  //     this.voices.set(key, voice);
  //   }

  //   stopNote(key: string) {
  //     const voice = this.voices.get(key);
  //     if (voice) {
  //       voice.release(this.releaseTime);
  //       this.voices.delete(key);
  //     }
  //   }

  setVolume(volume: number) {
    this.masterGain.gain.setValueAtTime(
      // clicks?
      volume,
      this.audioContext.currentTime
    );

    // this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.audioContext.currentTime);
    // this.masterGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.02);
  }

  /* Recording */

  async setupRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
  }

  startRecording() {
    if (!this.mediaRecorder) {
      console.error('Media Recorder not set up');
      this.setupRecording();
      return;
    }
    this.recordedChunks = [];
    this.mediaRecorder!.start();
  }

  async stopRecording(): Promise<AudioBuffer> {
    if (!this.mediaRecorder) {
      throw new Error('Media Recorder not set up');
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = async () => {
        try {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(
            arrayBuffer
          );
          resolve(audioBuffer);

          this.setupRecording(); // Reset media recorder here?
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder!.stop();
    });
  }
}

function midiToPlaybackRate(midiNote: number): number {
  return 2 ** ((midiNote - 60) / 12);
}
