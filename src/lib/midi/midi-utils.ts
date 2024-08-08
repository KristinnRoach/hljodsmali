export function rateToMidiNote(playbackRate: number) {
  return Math.round(12 * Math.log2(playbackRate) + 60);
}

function midiToPlaybackRate(midiNote: number): number {
  return 2 ** ((midiNote - 60) / 12);
}
