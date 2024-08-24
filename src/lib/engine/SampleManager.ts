// SampleManager.ts
import { Sample_settings } from '../../types/samples';

export class SettingsManager {
  private static instance: SettingsManager;
  private sampleSettings: Map<string, Sample_settings> = new Map();
  private zeroCrossings: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  getSampleSettings(sampleId: string): Sample_settings | undefined {
    return this.sampleSettings.get(sampleId);
  }

  setSampleSettings(sampleId: string, settings: Sample_settings): void {
    this.sampleSettings.set(sampleId, settings);
  }

  removeSampleSettings(sampleId: string): void {
    this.sampleSettings.delete(sampleId);
  }

  getZeroCrossings(sampleId: string): number[] | undefined {
    return this.zeroCrossings.get(sampleId);
  }

  setZeroCrossings(sampleId: string, crossings: number[]): void {
    this.zeroCrossings.set(sampleId, crossings);
  }

  removeZeroCrossings(sampleId: string): void {
    this.zeroCrossings.delete(sampleId);
  }

  updateSampleSettings(
    sampleId: string,
    partialSettings: Partial<Sample_settings>
  ): void {
    const currentSettings = this.sampleSettings.get(sampleId);
    if (currentSettings) {
      this.sampleSettings.set(sampleId, {
        ...currentSettings,
        ...partialSettings,
      });
    }
  }
}
