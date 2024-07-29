type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type NoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';
type Note = `${NoteName}${Octave}`;

type C_Major = [
  `C${Octave}`,
  `D${Octave}`,
  `E${Octave}`,
  `F${Octave}`,
  `G${Octave}`,
  `A${Octave}`,
  `B${Octave}`
];

export const C5_DURATION_SEC = 0.00191117077819399; // C5 loop length in seconds

const C0_DURATION_MS = 61.1620795107034; // // C0 loop length in ms
const SEMITONE_RATIO = 2 ** (1 / 12);

const noteDurations: Record<NoteName, number> = {
  C: C0_DURATION_MS,
  'C#': C0_DURATION_MS / SEMITONE_RATIO,
  D: C0_DURATION_MS / SEMITONE_RATIO ** 2,
  'D#': C0_DURATION_MS / SEMITONE_RATIO ** 3,
  E: C0_DURATION_MS / SEMITONE_RATIO ** 4,
  F: C0_DURATION_MS / SEMITONE_RATIO ** 5,
  'F#': C0_DURATION_MS / SEMITONE_RATIO ** 6,
  G: C0_DURATION_MS / SEMITONE_RATIO ** 7,
  'G#': C0_DURATION_MS / SEMITONE_RATIO ** 8,
  A: C0_DURATION_MS / SEMITONE_RATIO ** 9,
  'A#': C0_DURATION_MS / SEMITONE_RATIO ** 10,
  B: C0_DURATION_MS / SEMITONE_RATIO ** 11,
};

function getNoteDuration(
  noteName: NoteName,
  octave: number,
  timeUnit: 'ms' | 'sec' = 'ms'
): number {
  const baseDuration = noteDurations[noteName];
  if (baseDuration === undefined)
    throw new Error(`Invalid note name: ${noteName}`);
  if (timeUnit === 'ms') return baseDuration / 2 ** octave;
  return baseDuration / 2 ** octave / 1000;
}

export function snapDurationToNote(
  length: number,
  scale: NoteName[],
  lowestNoteName: NoteName = 'C',
  highestNoteName: NoteName = 'C',
  lowestOctave: number = 1,
  highestOctave: number = 5,
  timeUnit: 'ms' | 'sec' = 'ms'
): number | undefined {
  if (lowestOctave > highestOctave) {
    throw new Error('lowestOctave must be less than or equal to highestOctave');
  }

  if (!scale.includes(lowestNoteName) || !scale.includes(highestNoteName)) {
    throw new Error('lowestNoteName and highestNoteName must be in the scale');
  }

  const lowestDuration = getNoteDuration(
    lowestNoteName,
    lowestOctave,
    timeUnit
  );

  const highestDuration = getNoteDuration(
    highestNoteName,
    highestOctave,
    timeUnit
  );

  if (length >= lowestDuration) return length;
  if (length <= highestDuration) return highestDuration;

  let closestDuration = lowestDuration;
  let smallestDifference = Math.abs(length - lowestDuration);

  for (let oct = lowestOctave; oct <= highestOctave; oct++) {
    // if the highest octave, limit to highest note parameter
    const octavesLimited =
      oct === highestOctave
        ? scale.slice(0, scale.indexOf(highestNoteName) + 1)
        : scale;

    for (const note of octavesLimited) {
      const duration = getNoteDuration(note, oct, timeUnit);
      if (duration < length) continue; // We've passed the target length

      const difference = Math.abs(length - duration);

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestDuration = duration;
      }
    }
  }
  return closestDuration;
}

type noteToDuration_map = {
  [K in Note]?: number;
};

export const msToC: noteToDuration_map = {
  C0: 61.1620795107034,
  C1: 30.5810397553517,
  C2: 15.2881816237577,
  C3: 7.64468311290726,
  C4: 3.82234155638498,
  C5: 1.91117077819399,
  C6: 0.955585389097005,
  C7: 0.477792694455503,
};

export const secToC: noteToDuration_map = {
  C0: 0.0611620795107034,
  C1: 0.0305810397553517,
  C2: 0.0152881816237577,
  C3: 0.00764468311290726,
  C4: 0.00382234155638498,
  C5: 0.00191117077819399,
  C6: 0.000955585389097005,
  C7: 0.000477792694455503,
};

export const secToC3major: noteToDuration_map = {
  C3: 0.00764468311290726,
  D3: 0.00680364273366824,
  E3: 0.0060625,
  F3: 0.00571578947368421,
  G3: 0.00509259259259259,
  A3: 0.00453514739229025,
  B3: 0.00404040404040404,
};

export const secToC4major: noteToDuration_map = {
  C4: 0.00382234155638498,
  D4: 0.00340182136683417,
  E4: 0.00303125,
  F4: 0.00285789473684211,
  G4: 0.0025462962962963,
  A4: 0.00226757369614512,
  B4: 0.00202020202020202,
};

export const secToCorG: noteToDuration_map = {
  C0: 0.0611620795107034,
  G0: 0.0549090909090909,
  C1: 0.0305810397553517,
  G1: 0.0274545454545455,
  C2: 0.0152881816237577,
  G2: 0.0137272727272727,
  C3: 0.00764468311290726,
  G3: 0.00686363636363636,
  C4: 0.00382234155638498,
  G4: 0.00343181818181818,
  C5: 0.00191117077819399,
  G5: 0.00171590909090909,
  C6: 0.000955585389097005,
  G6: 0.000857954545454545,
  C7: 0.000477792694455503,
  G7: 0.000428977272727273,
};

// export function snapSecondsToC(length: number): number {
//   if (length > 0.07) return length;

//   if (length < 0.000477792694455503) return secToC.C7;
//   if (length < 0.000955585389097005) return secToC.C6;
//   if (length < 0.00191117077819399) return secToC.C5;
//   if (length < 0.00382234155638498) return secToC.C4;
//   return secToC.C3;
//   //   if (length < 0.00764468311290726) return secToC.C3;
//   //   if (length < 0.0152881816237577) return secToC.C2;
//   //   if (length < 0.0305810397553517) return secToC.C1;
//   //   return secToC.C0;
// }

// export function snapSecondsToC3major(length: number): number {
//   if (length > 0.008) return length;

//   if (length < 0.00404040404040404) return secToC3major.B3;
//   if (length < 0.00453514739229025) return secToC3major.A3;
//   if (length < 0.00509259259259259) return secToC3major.G3;
//   if (length < 0.00571578947368421) return secToC3major.F3;
//   if (length < 0.0060625) return secToC3major.E3;
//   if (length < 0.00680364273366824) return secToC3major.D3;
//   return secToC3major.C3;
// }

// export function snapSecondsToCmajor(length: number): number {
//   if (length > 0.0039) return snapSecondsToC3major(length);

//   if (length < 0.00202020202020202) return secToC4major.B4;
//   if (length < 0.00226757369614512) return secToC4major.A4;
//   if (length < 0.0025462962962963) return secToC4major.G4;
//   if (length < 0.00285789473684211) return secToC4major.F4;
//   if (length < 0.00303125) return secToC4major.E4;
//   if (length < 0.00340182136683417) return secToC4major.D4;
//   return secToC4major.C4;
// }

// C0 (16.35 Hz):
// (1 / 16.35) * 1000 = 61.1620795107034 ms
// C1 (32.70 Hz):
// (1 / 32.70) * 1000 = 30.5810397553517 ms
// C2 (65.41 Hz):
// (1 / 65.41) * 1000 = 15.2881816237577 ms
// C3 (130.81 Hz):
// (1 / 130.81) * 1000 = 7.64468311290726 ms
// C4 (261.63 Hz):
// (1 / 261.63) * 1000 = 3.82234155638498 ms
// C5 (523.25 Hz):
// (1 / 523.25) * 1000 = 1.91117077819399 ms
// C6 (1046.50 Hz):
// (1 / 1046.50) * 1000 = 0.955585389097005 ms
// C7 (2093.00 Hz):
// (1 / 2093.00) * 1000 = 0.477792694455503 ms

//   return 12 * Math.log2(duration / 61.1620795107034);
