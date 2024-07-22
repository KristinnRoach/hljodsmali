// src/lib/SamplerEngine.tsx // ts or tsx !?
import SingleUseVoice from './SingleUseVoice';
import {
  Sample_db,
  Sample_settings,
  getDefaultSampleSettings,
  createNewSampleObject,
} from '../types/sample';

export type LoadedSample = {
  sample: Sample_db;
  buffer: AudioBuffer | null;
  sampleGain: GainNode;
};

/* Singleton class for managing audio playback and recording */

export default class SamplerEngine {
  private static instance: SamplerEngine | null = null;

  private audioCtx: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private loadedSamples: Map<string, LoadedSample> = new Map();
  private selectedSampleIds: Set<string> = new Set();

  // private newRecordedSamples: Sample_db[] = [];
  // private updatedSamples: Map<string, Sample_db> = new Map();

  private masterGain: GainNode;
  private globalLoop: boolean = false;

  /* Constructor */

  private constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.75;
    this.masterGain.connect(this.audioCtx.destination);

    this.setupRecording();
    console.log('Audio Engine context: ', this.audioCtx);
  }

  /* Sample Engine instance */

  public static getInstance(audioCtx: AudioContext): SamplerEngine {
    if (!SamplerEngine.instance) {
      SamplerEngine.instance = new SamplerEngine(audioCtx);
      console.log('new SamplerEngine instance created');
    }
    return SamplerEngine.instance;
  }

  /* Loop and Hold state manager */

  // move handleLoopKeys to samplerCtx, only toggle loop neccessary
  handleLoopKeys(loopToggle: boolean, loopMomentary: boolean): void {
    const newLoopState = loopToggle !== loopMomentary;
    if (newLoopState !== this.globalLoop) {
      this.toggleGlobalLoop();
    }
  }

  toggleGlobalLoop(): void {
    this.globalLoop = !this.globalLoop;
    SingleUseVoice.setGlobalLooping(this.globalLoop);
  }

  public getGlobalLoop(): boolean {
    return this.globalLoop;
  }

  toggleHold(): void {
    SingleUseVoice.toggleHold();
  }

  isHolding(): boolean {
    return SingleUseVoice.isHolding();
  }

  setSampleLoopLocked(sampleId: string, lock: boolean): void {
    const loadedSample = this.loadedSamples.get(sampleId);
    if (loadedSample) {
      loadedSample.sample.sample_settings.loopLocked = lock;
      // this.updateActiveLoopLocks(sampleId);
    }
  }

  /* Sample Manager */

  loadSample(sample: Sample_db, buffer: AudioBuffer): LoadedSample {
    const defaultSettings = getDefaultSampleSettings(buffer.duration);

    const updatedSampleSettings: Sample_settings = {
      ...defaultSettings,
      ...sample.sample_settings,
    };

    const updatedSample: Sample_db = {
      ...sample,
      bufferDuration: buffer.duration, // redundant?
      sample_settings: updatedSampleSettings,
    };

    const sampleGain = this.audioCtx.createGain();
    sampleGain.connect(this.masterGain);
    sampleGain.gain.value = updatedSampleSettings.sampleVolume;

    const loadedSample: LoadedSample = {
      sample: updatedSample,
      buffer: buffer,
      sampleGain: sampleGain,
    };

    this.loadedSamples.set(sample.id, loadedSample);

    return loadedSample;
  }

  unloadSample(id: string): void {
    this.loadedSamples.delete(id);
  }

  // getUpdatedSamples(): Sample_db[] {
  //   const updatedSamples = [...this.updatedSamples.values()];
  //   this.updatedSamples = new Map();
  //   return updatedSamples;
  // }

  addBufferDurationToLoadedSamples(): void {
    this.loadedSamples.forEach((loadedSample, key) => {
      if (loadedSample.buffer && loadedSample.buffer.duration) {
        loadedSample.sample.bufferDuration = loadedSample.buffer.duration;
        this.loadedSamples.set(key, loadedSample);
      }
    });
  }

  setSampleVolume(sampleId: string, volume: number) {
    const loadedSample = this.loadedSamples.get(sampleId);
    if (loadedSample) {
      loadedSample.sampleGain.gain.setValueAtTime(
        volume,
        this.audioCtx.currentTime
      );
      loadedSample.sample.sample_settings.sampleVolume = volume;
    }
  }

  removeSample(id: string): void {
    this.loadedSamples.delete(id);
    this.selectedSampleIds.delete(id);
  }

  isSampleLoaded(id: string): boolean {
    return this.loadedSamples.has(id);
  }

  setSelectedSampleIds(ids: string[]): void {
    this.selectedSampleIds = new Set(ids);

    ids.forEach((id) => {
      if (this.loadedSamples.has(id)) {
        this.selectedSampleIds.add(id);
      } else {
        console.error(`Sample ${id} not loaded`);
      }
    });
  }

  getSelectedSampleIds(): string[] {
    return Array.from(this.selectedSampleIds);
  }

  getSelectedSampleObjects(): Sample_db[] {
    if (this.selectedSampleIds.size === 0) {
      return [];
    }
    return Array.from(this.selectedSampleIds)
      .map((id) => this.loadedSamples.get(id)?.sample)
      .filter((sample): sample is Sample_db => sample !== undefined);
  }

  getLoadedSamples(): LoadedSample[] {
    return Array.from(this.loadedSamples.values());
  }

  getSelectedLoadedSamples(): LoadedSample[] {
    return Array.from(this.loadedSamples.values()).filter((loadedSample) =>
      this.selectedSampleIds.has(loadedSample.sample.id)
    );
  }

  updateSampleSettings(id: string, settings: Partial<Sample_settings>) {
    try {
      this.updateSelectedSampleSettings(id, settings);
    } catch (error) {
      console.error(`Error updating sample ${id}:`, error);
    }
  }

  private updateSelectedSampleSettings(
    id: string,
    settings: Partial<Sample_settings>
  ) {
    const loadedSample = this.loadedSamples.get(id);

    if (loadedSample) {
      loadedSample.sample = {
        ...loadedSample.sample,
        sample_settings: {
          ...loadedSample.sample.sample_settings,
          ...settings,
        },
      };

      if (
        'loopStart' in settings ||
        'loopEnd' in settings ||
        'sampleVolume' in settings ||
        'loopVolume' in settings
      ) {
        SingleUseVoice.updateActiveVoices(id, settings);
      }
    }
  }

  /* Playback */

  playNote(midiNote: number): void {
    const selected = this.getSelectedLoadedSamples();

    // can this be done in paralell instead of sequentially?
    selected.forEach((s) => {
      console.log('Playing sample: ', s);
      if (s && s.buffer) {
        const voice = new SingleUseVoice(
          this.audioCtx,
          s.buffer,
          s.sample.sample_settings,
          s.sample.id,
          s.sampleGain
        );
        // voice.voiceGain.connect(loadedSample.sampleGain);
        // loadedSample.sampleGain.connect(this.masterGain);
        voice.start(midiNote);
        console.log('new voice: ', voice);
      }
    });
  }

  releaseNote(midiNote: number): void {
    SingleUseVoice.releaseNote(midiNote);
  }

  stopAllVoices(): void {
    SingleUseVoice.panic();
  }

  /* Master Volume */

  setMasterVolume(volume: number) {
    // add ramp?
    this.masterGain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
  }

  getMasterVolume(): number {
    if (!this.masterGain.gain.value) {
      throw new Error('Master gain node not set up');
    }
    return this.masterGain.gain.value;
  }

  /* Recording */

  async setupRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
    } catch (error) {
      console.error('Failed to setup recording:', error);
      throw error;
    }
  }

  async startRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      await this.setupRecording();
    }
    this.recordedChunks = [];
    this.mediaRecorder?.start();
  }

  async stopRecording(): Promise<{ sample: Sample_db; buffer: AudioBuffer }> {
    if (!this.mediaRecorder) {
      throw new Error('Media Recorder not set up');
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = async () => {
        try {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

          const newSample: Sample_db = createNewSampleObject(
            `new-sample${Date.now().toString()}`, // date eða index eðeikka
            `new-sample${this.loadedSamples.size}`,
            blob,
            audioBuffer.duration
          );
          this.recordedChunks = [];
          resolve({ sample: newSample, buffer: audioBuffer });
          // this.setupRecording(); // Reset media recorder here?
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder!.stop();
    });
  }

  // getNewRecordings(): Sample_db[] {
  //   const newRecordings = [...this.newRecordedSamples];
  //   this.newRecordedSamples = [];
  //   return newRecordings;
  // }

  // hasNewRecordings(): boolean {
  //   return this.newRecordedSamples.length > 0;
  // }
}

// // Move to sample type file, localize creation of sample_db objects to one place for consistency

// createNewSampleObject(name: string, blob: Blob, duration: number): Sample_db {
//   const file = new File([blob], name + '.webm', { type: 'audio/webm' }); // check for consistency
//   const slug = name.toLowerCase().replace(/ /g, '-');

//   const defaultSettings = getDefaultSampleSettings(duration);

//   const sample: Sample_db = {
//     id: `new-sample: ${this.newRecordedSamples.length + 1}`,
//     name: name,
//     slug: slug,
//     user: 'user', // Add user ID
//     sample_file: file + '',
//     created: new Date().toISOString(),
//     updated: new Date().toISOString(),
//     bufferDuration: duration,
//     sample_settings: defaultSettings,
//   };
//   return sample;
// }

//   loadSample(sample: Sample, buffer: AudioBuffer): LoadedSample {
//     // should be void?
//     const defaultSettings = this.getDefaultSampleSettings(buffer.duration);

//     // Set default values if not present
//     const updatedSample: Sample = {
//       ...sample,
//       bufferDuration: buffer.duration,
//       sample_settings: sample.sample_settings
//         ? {
//             ...defaultSettings,
//             ...sample.sample_settings,
//           }
//         : defaultSettings,
//     };

//     // prep gain node for individual sample volume control
//     const sampleGain = this.audioContext.createGain();
//     sampleGain.connect(this.masterGain);
//     sampleGain.gain.value =
//       sample.sample_settings?.sampleVolume ?? this.masterGain.gain.value;

//     const loadedSample: LoadedSample = {
//       sample: updatedSample,
//       buffer: buffer,
//       sampleGain: sampleGain,
//     };

//     this.loadedSamples.set(sample.id, loadedSample);
//     // Set the newly loaded sample as the only selected sample
//     this.setSelectedSampleIds([sample.id]);
//     return loadedSample;
//   }

//   releaseAllLoops(): void {
//     const activeVoiceKeys = Array.from(this.activeVoices.keys());

//     activeVoiceKeys.forEach((voiceKey) => {
//       const voice = this.activeVoices.get(voiceKey);

//       if (voice && voice.getLoop()) {
//         voice.setLoop(false);
//         // voice.release();
//         this.activeVoices.delete(voiceKey);
//       }
//     });
//     console.log('releaseAllLoops called. Active voices: ', this.activeVoices);
//   }

//   playNote(midiNote: number, isLoopOn: boolean): void {
//     const selected = this.getSelectedLoadedSamples();
//     selected.forEach((loadedSample) => {
//       if (loadedSample) {
//         // loadedSample.sample.sample_settings && loadedSample.buffer && loadedSample.sampleGain
//         const voice = new SingleUseVoice(
//           this.audioContext,
//           isLoopOn,
//           loadedSample.sample.sample_settings.sampleVolume,
//           loadedSample.buffer,
//           loadedSample.sample.sample_settings
//         );
//         voice.voiceGain.connect(loadedSample.sampleGain);
//         loadedSample.sampleGain.connect(this.masterGain);
//         this.masterGain.connect(this.audioContext.destination);
//         voice.start(
//           midiNote
//           // this.masterGain.gain.value,
//           // loadedSample.sample.sample_settings.attackTime
//         );

//         const voiceKey = `${loadedSample.sample.id}-${midiNote}`;
//         this.activeVoices.set(voiceKey, voice);
//       }
//     });
//   }

//   releaseNote(midiNote: number, isLoopOn: boolean): void {
//     const selectedSamples = this.getSelectedLoadedSamples();
//     selectedSamples.forEach((loadedSample) => {
//       const voiceKey = `${loadedSample.sample.id}-${midiNote}`;
//       const voice = this.activeVoices.get(voiceKey);
//       if (voice) {
//         voice.release(); // loadedSample.sample.sample_settings.releaseTime

//         if (voice.getLoop()) {
//           // || isLoopOn ?
//           // if (loadedSample.sampleGain.gain.value !== voice.loopVolume)
//           //   loadedSample.sampleGain.gain.setValueAtTime(
//           //     loadedSample.sampleGain.gain.value,
//           //     this.audioContext.currentTime // + voice.releaseTime
//           //   );
//           // loadedSample.sampleGain.gain.linearRampToValueAtTime(
//           //   voice.loopVolume,
//           //   this.audioContext.currentTime + voice.releaseTime
//           // );
//         } else {
//           // voice.release(); // loadedSample.sample.sample_settings.releaseTime

//           // Wait for release time before removing voice from activeVoices // is this necessary?
//           setTimeout(() => {
//             this.activeVoices.delete(voiceKey);
//           }, voice.releaseTime * 1000);
//         }
//       }
//     });
//   }
// updateActiveLoopLocks(id?: string): void {
//   this.loadedSamples.forEach((s) => {
//     if (id && s.sample.id === id) {
//       return;
//     }
//     if (s.sample.sample_settings.loopLocked) {
//       this.updateActiveVoiceSettings(s.sample.id, s.sample.sample_settings);
//     }
//   });
// }
