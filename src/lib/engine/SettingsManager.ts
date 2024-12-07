// SettingsManager.ts
import {
  Sample_settings,
  SettingsParam,
  Time_settings,
} from '../../types/samples';
import { snapToNearestZeroCrossing } from '../audio-utils/zeroCrossingUtils';
import {
  snapDurationToNote,
  C5_DURATION_SEC,
  interpolateDurationToNote,
} from '../../types/constants/note-utils';
import { SingleUseVoice } from './SingleUseVoice';

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
    // updatedParams: SettingsParam[]
  ): void {
    const currentSettings = this.sampleSettings.get(sampleId);
    if (currentSettings) {
      this.sampleSettings.set(sampleId, {
        ...currentSettings,
        ...partialSettings,
      });
    }
  }

  updateParam(sampleId: string, param: SettingsParam): void {
    const currentSettings = this.sampleSettings.get(sampleId);
    if (currentSettings) {
      const updatedParam = {
        [param.param]: param.value,
      };
      this.sampleSettings.set(sampleId, {
        ...currentSettings,
        ...updatedParam,
      });
    }
  }

  getParam(sampleId: string, param: string): number | boolean | undefined {
    const currentSettings = this.sampleSettings.get(sampleId);
    if (currentSettings) {
      console.log('getParam: ', currentSettings[param]);
      return currentSettings[param];
    }
  }

  updateTimeSettings(
    sampleId: string,
    newSettings: Partial<Time_settings>
  ): void {
    const zeroCrossings = this.getZeroCrossings(sampleId) ?? [];

    if (newSettings.startPoint !== undefined) {
      const snapStart = snapToNearestZeroCrossing(
        newSettings.startPoint,
        zeroCrossings // change to just pass id in!
      );
      this.updateParam(sampleId, { param: 'startPoint', value: snapStart });
      // this.source.loopStart = snapStart;
    }
    if (newSettings.endPoint !== undefined) {
      const snapEnd = snapToNearestZeroCrossing(
        newSettings.endPoint,
        zeroCrossings // change to just pass id in!
      );
      this.updateParam(sampleId, { param: 'endPoint', value: snapEnd });
      // update active voices ?
    }

    if (
      newSettings.loopStart !== undefined ||
      newSettings.loopEnd !== undefined
    ) {
      this.updateLoopPoints(
        sampleId,
        newSettings.loopStart,
        newSettings.loopEnd,
        zeroCrossings
      );
    }

    return;
  }

  private updateLoopPoints(
    sampleId: string,
    newStart: number,
    newEnd: number,
    zeroCrossings: number[]
  ): void {
    const prevSettings = this.getSampleSettings(sampleId)?.time;
    if (!prevSettings) return;

    const prevStart = prevSettings.loopStart;
    const prevEnd = prevSettings.loopEnd;

    const initLoopLength = newEnd - newStart;
    if (initLoopLength <= C5_DURATION_SEC) return;

    let start = snapToNearestZeroCrossing(newStart, zeroCrossings);
    let end = snapToNearestZeroCrossing(newEnd, zeroCrossings);

    const zeroSnapLength = end - start;
    if (zeroSnapLength > 0.015) {
      // Update active voices
      SingleUseVoice.updateLoopPoints(start, end, sampleId);
      this.updateParam(sampleId, { param: 'loopStart', value: start });
      this.updateParam(sampleId, { param: 'loopEnd', value: end });

      return;
    }

    // _____________ optimize above and below whe working ______________________

    const prevLoopLength = prevEnd - prevStart;

    const nearestNote = snapDurationToNote(
      zeroSnapLength,
      ['C'],
      'C',
      'C',
      0,
      7,
      'sec'
    );

    interpolateDurationToNote(
      prevLoopLength,
      nearestNote,
      ['C'],
      'C',
      'C',
      0,
      7,
      'sec',
      500, // animation duration in ms,
      (interpolatedDuration: number) => {
        // Update your state or UI with the interpolated duration
        console.log(interpolatedDuration);
        const newEnd = start + interpolatedDuration;

        // Update active voices
        SingleUseVoice.updateLoopPoints(start, end, sampleId);
        // Update sample settings
        this.updateParam(sampleId, { param: 'loopStart', value: start });
        this.updateParam(sampleId, { param: 'loopEnd', value: end });
      }
    );
    // end = start + snappedLength;
    // this.updateLoopPoints(start, end);
    return;
  }
}
