// SettingsManager.ts
import { Sample_settings, Time_settings } from '../../types/samples';
import { snapToNearestZeroCrossing } from '../audio-utils/zeroCrossingUtils';

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
//   updateTimeSettings(
//     sampleId: string,
//     settings: Partial<Time_settings>
//   ): Time_settings {
//     const prevTimeSettings = this.getSampleSettings(sampleId)?.time;

//     const { startPoint, endPoint, loopStart, loopEnd } = settings;
//     const zeroCrossings = this.getZeroCrossings(sampleId) ?? [];

//     if (startPoint !== undefined) {
//       const snapStart = snapToNearestZeroCrossing(
//         startPoint,
//         zeroCrossings // change to just pass id in!
//       );
//       // this.source.loopStart = snapStart;
//       settings.startPoint = snapStart;
//     }
//     if (endPoint !== undefined) {
//       const snapEnd = snapToNearestZeroCrossing(
//         endPoint,
//         zeroCrossings // change to just pass id in!
//       );
//       settings.endPoint = snapEnd;
//     }
//     if (loopStart !== undefined || loopEnd !== undefined) {
//       this.calculateLoopPoints(
//         prevTimeSettings.loopStart,
//         prevTimeSettings.loopEnd
//       );

//       settings.loopStart = loopStart;
//       settings.loopEnd = loopEnd;
//     }

//     return settings as Time_settings;
//   }

//   private calculateLoopPoints(
//     prevStart: number,
//     prevEnd: number
//   ): { loopStart: number; loopEnd: number } | null {
//     // const sampleManager = SettingsManager.getInstance();
//     // const settings = sampleManager.getSampleSettings(this.sampleId)!;
//     // const zeroCrossings = sampleManager.getZeroCrossings(this.sampleId) ?? [];

//     const { loopStart, loopEnd } = settings.time;
//     if (!loopStart || !loopEnd) return;

//     const initLoopLength = loopEnd - loopStart;
//     if (initLoopLength <= C5_DURATION_SEC) return;

//     let start = snapToNearestZeroCrossing(loopStart, zeroCrossings);
//     let end = snapToNearestZeroCrossing(loopEnd, zeroCrossings);

//     const zeroSnapLength = end - start;
//     if (zeroSnapLength > 0.015) {
//       this.updateLoopPoints(start, end);
//       return;
//     }

//     // _____________ optimize above and below whe working ______________________

//     const prevLoopLength = prevEnd - prevStart;

//     const nearestNote = snapDurationToNote(
//       zeroSnapLength,
//       ['C'],
//       'C',
//       'C',
//       0,
//       7,
//       'sec'
//     );

//     interpolateDurationToNote(
//       prevLoopLength,
//       nearestNote,
//       ['C'],
//       'C',
//       'C',
//       0,
//       7,
//       'sec',
//       500, // animation duration in ms,
//       (interpolatedDuration: number) => {
//         // Update your state or UI with the interpolated duration
//         console.log(interpolatedDuration);

//         const newEnd = start + interpolatedDuration;
//         this.updateLoopPoints(start, newEnd);
//       }
//     );
//     // end = start + snappedLength;
//     // this.updateLoopPoints(start, end);
//   }
// }
