import { Voice } from '../types/types';

export function releaseNote(
  voices: Voice[],
  midiNote: number,
  isHoldActive: boolean
): void {
  voices.forEach((voice) => {
    if (voice.getMidiNote() === midiNote && !isHoldActive) {
      voice.triggerRelease();
    }
  });
}

export function releaseAllVoices(voices: Voice[]): void {
  voices.forEach((voice) => voice.triggerRelease());
}

export function stopAllVoices(voices: Voice[]): void {
  voices.forEach((voice) => voice.stop());
}

// // set source.loop
// export function toggleLoop(voices: Voice[], isLooping: boolean): void {
//   voices.forEach((voice) => voice.setLoop(isLooping));
// }

// // Utility function to update loop points for active voices
// export function updateActiveVoicesLoopPoints(
//   voices: Voice[],
//   sampleId: string,
//   newStart: number,
//   newEnd: number,
//   prevStart: number,
//   prevEnd: number
// ): void {
//   voices.forEach((voice) => {
//     if (voice.getSampleId() === sampleId) {
//       voice.updateLoopPoints(newStart, newEnd, prevStart, prevEnd);
//     }
//   });
// }

// // Utility function to update pitch settings for active voices
// export function updateActiveVoicesPitchSettings(
//   voices: Voice[],
//   sampleId: string,
//   transposition: number,
//   tuneOffset: number
// ): void {
//   voices.forEach((voice) => {
//     if (voice.getSampleId() === sampleId) {
//       voice.updatePitchSettings(transposition, tuneOffset);
//     }
//   });
// }

// Utility function to get voices for a specific sample
export function getVoicesForSample(voices: Voice[], sampleId: string): Voice[] {
  return voices.filter((voice) => voice.getSampleId() === sampleId);
}

// Utility function to check if any voice is playing
export function hasPlayingVoices(voices: Voice[]): boolean {
  return voices.length > 0;
}

// Utility function to get the number of playing voices
export function numberOfPlayingVoices(voices: Voice[]): number {
  return voices.length;
}

// Utility function to get the current playhead position
export function getCurrentPlayheadPosition(voices: Voice[]): number {
  if (voices.length === 0) return 0;
  const voice = voices[0];
  return voice.getTriggerTime() > 0
    ? voice.getVoiceGain().context.currentTime - voice.getTriggerTime()
    : 0;
}
