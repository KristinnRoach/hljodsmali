// src/lib/SamplerEngine.tsx // ts or tsx !?
import SingleUseVoice from './SingleUseVoice';
import {
  Sample_db,
  Sample_settings,
  getDefaultSampleSettings,
  createNewSampleObject,
} from '../types/sample';

import {
  findZeroCrossings,
  snapToNearestZeroCrossing,
} from './DSP/zeroCrossingUtils';

export type Loaded = {
  sample: Sample_db;
  buffer: AudioBuffer | null;

  nodes: {
    sampleGain: GainNode;
    lowCut: BiquadFilterNode;
    highCut: BiquadFilterNode;
  };
};

/* Singleton class for managing audio playback and recording */

export default class SamplerEngine {
  private static instance: SamplerEngine | null = null;

  private audioCtx: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private loadedSamples: Map<string, Loaded> = new Map();
  private selectedSampleIds: Set<string> = new Set();

  // private newRecordedSamples: Sample_db[] = [];
  // private updatedSamples: Map<string, Sample_db> = new Map();

  private masterGain: GainNode;
  // private globalLoop: boolean = false;

  /* Constructor */

  private constructor(audioCtx: AudioContext | null) {
    if (!audioCtx) {
      throw new Error('Audio context not set up');
    }
    this.audioCtx = audioCtx;

    this.masterGain = this.audioCtx?.createGain();
    this.masterGain.gain.value = 0.75;
    this.masterGain.connect(this.audioCtx.destination);

    // TODO: ADD LIMITER / COMPRESSOR NODE

    this.setupRecording();
    console.log('Audio Engine context: ', this.audioCtx);

    SingleUseVoice.initialize(this.audioCtx.sampleRate);
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

  toggleLoop(): void {
    SingleUseVoice.toggleLoop();
  }

  public isLooping(): boolean {
    return SingleUseVoice.isLooping();
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

  createGain(volume: number): GainNode {
    const newGain = this.audioCtx.createGain();
    newGain.gain.value = volume;
    return newGain;
  }

  setupFilters(
    lowCutoff?: number,
    highCutoff?: number
  ): { lowCut: BiquadFilterNode; highCut: BiquadFilterNode } {
    const lowCut = this.audioCtx.createBiquadFilter();
    lowCut.type = 'highpass';
    lowCut.frequency.value = lowCutoff || 40;

    const highCut = this.audioCtx.createBiquadFilter();
    highCut.type = 'lowpass';
    highCut.frequency.value = highCutoff || 20000;

    return { lowCut: lowCut, highCut: highCut };
  }

  connectSampleAudioNodes(
    sampleGain: GainNode,
    lowCut: BiquadFilterNode,
    highCut: BiquadFilterNode,
    masterOut: GainNode = this.masterGain
  ): void {
    if (!masterOut) throw new Error('Master output not set up');

    sampleGain.connect(lowCut);
    lowCut.connect(highCut);
    highCut.connect(masterOut);
    masterOut.connect(this.audioCtx.destination);
  }

  loadSample(sampleToLoad: Sample_db, buffer: AudioBuffer): Loaded {
    const loading: Sample_db = {
      ...sampleToLoad,
      bufferDuration: buffer.duration,
      sample_settings: {
        ...getDefaultSampleSettings(buffer.duration),
        ...sampleToLoad.sample_settings,
      },
    };

    if (
      !sampleToLoad.zeroCrossings ||
      sampleToLoad.zeroCrossings.length === 0
    ) {
      loading.zeroCrossings = findZeroCrossings(buffer);
    }

    SingleUseVoice.zeroCrossings.set(loading.id, loading.zeroCrossings ?? []);

    console.log('Zero crossings:', SingleUseVoice.zeroCrossings);

    const settings = loading.sample_settings;

    // --------DELETE THIS WHEN FILTERS ARE IMPLEMENTED--------
    if (settings.lowCutoff === undefined) {
      settings.lowCutoff = 40;
    }
    if (settings.highCutoff === undefined) {
      settings.highCutoff = 20000;
    }
    //---------------------------------------------------------

    const sampleGain = this.createGain(settings.sampleVolume);

    const { lowCut, highCut } = this.setupFilters(
      settings.lowCutoff,
      settings.highCutoff
    );

    this.connectSampleAudioNodes(sampleGain, lowCut, highCut);

    // CREATE MASTER LIMITER / COMPRESSOR NODE

    const loaded: Loaded = {
      sample: loading,
      buffer: buffer,
      nodes: {
        sampleGain: sampleGain,
        lowCut: lowCut,
        highCut: highCut,
      },
    };

    this.loadedSamples.set(loaded.sample.id, loaded);

    SingleUseVoice.sampleSettings.set(
      loaded.sample.id,
      loaded.sample.sample_settings
    );

    console.log('Loaded sample:', loaded);

    return loaded;
  }

  unloadSample(id: string): void {
    this.loadedSamples.delete(id);
    SingleUseVoice.sampleSettings.delete(id);
    SingleUseVoice.zeroCrossings.delete(id);
  }

  // getUpdatedSamples(): Sample_db[] {
  //   const updatedSamples = [...this.updatedSamples.values()];
  //   this.updatedSamples = new Map();
  //   return updatedSamples;
  // }

  // addBufferDurationToLoadedSamples(): void {
  //   // remove function if redundant, else add zeroCrossings
  //   this.loadedSamples.forEach((loadedSample, key) => {
  //     if (loadedSample.buffer && loadedSample.buffer.duration) {
  //       loadedSample.sample.bufferDuration = loadedSample.buffer.duration;
  //       this.loadedSamples.set(key, loadedSample);
  //     }
  //   });
  // }

  setSampleVolume(sampleId: string, volume: number) {
    const loaded = this.loadedSamples.get(sampleId);
    if (loaded) {
      loaded.nodes.sampleGain.gain.setValueAtTime(
        volume,
        this.audioCtx.currentTime
      );
      loaded.sample.sample_settings.sampleVolume = volume;
    }
  }

  removeSample(id: string): void {
    this.loadedSamples.delete(id);
    this.selectedSampleIds.delete(id);
  }

  isSampleLoaded(id: string): boolean {
    const sample = this.loadedSamples.get(id);

    return (sample && sample.buffer && sample.nodes.sampleGain) !== undefined;
  }

  isSampleSelected(id: string): boolean {
    return this.selectedSampleIds.has(id);
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

  isPlaying(): boolean {
    return SingleUseVoice.isPlaying();
  }

  getCurrentPlayheadPosition(): number {
    return SingleUseVoice.getCurrentPlayheadPosition();
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

  getLoadedSamples(): Loaded[] {
    return Array.from(this.loadedSamples.values());
  }

  getSelectedLoadedSamples(): Loaded[] {
    return Array.from(this.loadedSamples.values()).filter((loadedSample) =>
      this.selectedSampleIds.has(loadedSample.sample.id)
    );
  }

  updateSampleSettings(id: string, settings: Partial<Sample_settings>) {
    try {
      const loadedSample = this.loadedSamples.get(id);

      if (loadedSample) {
        if (settings.lowCutoff !== undefined) {
          loadedSample.nodes.lowCut.frequency.setValueAtTime(
            settings.lowCutoff,
            this.audioCtx.currentTime
          );
          console.log('Low cut:', settings.lowCutoff);
        }
        if (settings.highCutoff !== undefined) {
          loadedSample.nodes.highCut.frequency.setValueAtTime(
            settings.highCutoff,
            this.audioCtx.currentTime
          );
          console.log('High cut:', settings.highCutoff);
        }
        if (
          settings.startPoint !== undefined &&
          loadedSample.sample.zeroCrossings
        ) {
          const snapped = snapToNearestZeroCrossing(
            settings.startPoint,
            loadedSample.sample.zeroCrossings
          );
          loadedSample.sample.sample_settings.startPoint = snapped;
        }
        if (
          settings.endPoint !== undefined &&
          loadedSample.sample.zeroCrossings
        ) {
          const snapped = snapToNearestZeroCrossing(
            settings.endPoint,
            loadedSample.sample.zeroCrossings
          );
          loadedSample.sample.sample_settings.endPoint = snapped;
        }

        loadedSample.sample = {
          ...loadedSample.sample,
          sample_settings: {
            ...loadedSample.sample.sample_settings,
            ...settings,
          },
        };

        SingleUseVoice.sampleSettings.set(
          loadedSample.sample.id,
          loadedSample.sample.sample_settings
        );

        if (
          'loopStart' in settings ||
          'loopEnd' in settings ||
          'sampleVolume' in settings ||
          'loopVolume' in settings
        ) {
          SingleUseVoice.updateActiveVoices(id, settings);
        }
      }
    } catch (error) {
      console.error(`Error updating sample ${id}:`, error);
    }
  }

  /* Playback */

  playNote(midiNote: number): void {
    const selected = this.getSelectedLoadedSamples();

    // can this be done in paralell instead of sequentially?
    selected.forEach((s) => {
      if (s && s.buffer) {
        const voice = new SingleUseVoice(this.audioCtx, s.buffer, s.sample.id);
        voice.getVoiceGain().connect(s.nodes.sampleGain);
        voice.start(midiNote);
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
}

// getNewRecordings(): Sample_db[] {
//   const newRecordings = [...this.newRecordedSamples];
//   this.newRecordedSamples = [];
//   return newRecordings;
// }

// hasNewRecordings(): boolean {
//   return this.newRecordedSamples.length > 0;
// }

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
