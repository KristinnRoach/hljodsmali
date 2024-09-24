import {
  AmpEnv,
  Pitch_settings,
  Sample_settings,
  Time_settings,
} from '../types/types';
import { MIDDLE_C_MIDI } from '../types/constants/constants';
import {
  snapDurationToNote,
  interpolateDurationToNote,
  C5_DURATION_SEC,
} from '../types/constants/note-utils';

export default function createSingleUseVoice(
  audioCtx: AudioContext,
  buffer: AudioBuffer,
  sampleId: string,
  settings: Sample_settings,
  loop: boolean,
  hold: boolean
) {
  /* FIELDS */
  let source: AudioBufferSourceNode;
  let gainNode: GainNode;

  let startPoint: number = 0;
  let endPoint: number = 0;
  let playDuration: number = 0;
  let midiNote: number = -1;
  let ctxTimeStarted: number = -1;

  // State
  let isPlaying: boolean = false;
  let isReleasing: boolean = false;

  const initialize = (settings: Sample_settings): void => {
    if (!audioCtx) return;

    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    source.connect(gainNode);

    startPoint = settings.time.startPoint;
    endPoint = settings.time.endPoint;
    playDuration = endPoint - startPoint;

    console.log(loop, source.loop);

    source.loop = loop || settings.locks.loop;
    if (source.loop) {
      source.loopStart = settings.time.loopStart;
      source.loopEnd = settings.time.loopEnd;
    }

    console.log('initVoice, loop: ', loop, 'source.loop: ', source.loop);

    source.onended = () => {
      stop();
    };
  };

  initialize(settings);

  const connect = (destination: AudioNode): void => {
    gainNode.connect(destination);
  };

  const toggleLoop = (): void => {
    source.loop = !source.loop;
  };

  const setLoop = (loop: boolean): void => {
    source.loop = loop;
  };

  const setLoopStart = (loopStart: number): void => {
    source.loopStart = loopStart;
  };

  const setLoopEnd = (loopEnd: number): void => {
    source.loopEnd = loopEnd;
  };

  // Convert semitones to playback rate
  const semitoneToRate = (baseRate: number, semitones: number): number => {
    return baseRate * Math.pow(2, semitones / 12);
  };

  const setRateFromMidi = (
    midiNote: number,
    pitchSettings: Pitch_settings
  ): void => {
    const midiRate = semitoneToRate(1, midiNote - MIDDLE_C_MIDI);

    if (
      pitchSettings === undefined ||
      pitchSettings.transposition === undefined ||
      pitchSettings.tuneOffset === undefined
    ) {
      source.playbackRate.value = midiRate;
      playDuration = playDuration / source.playbackRate.value;
      console.error(
        'No pitch settings found, omitting transposition and tune-offset'
      );
      return;
    }

    const transposedRate = semitoneToRate(
      midiRate,
      pitchSettings.transposition
    );
    const tunedRate = semitoneToRate(transposedRate, pitchSettings.tuneOffset);
    source.playbackRate.value = tunedRate;

    playDuration = playDuration / source.playbackRate.value;
  };

  const start = (midiNoteValue: number): void => {
    const pitchSettings = settings.pitch;
    setRateFromMidi(midiNoteValue, pitchSettings);
    const duration = source.loop ? undefined : playDuration;

    source.start(0, startPoint, duration);
    ctxTimeStarted = audioCtx.currentTime;
    isPlaying = true;
    midiNote = midiNoteValue;
    triggerAttack();
  };

  const stop = (): void => {
    source.stop();
    source.disconnect();
    gainNode.disconnect();
    isPlaying = false;
    isReleasing = false;
  };

  const triggerAttack = (): void => {
    gainNode.gain.linearRampToValueAtTime(
      settings.volume.sampleVolume,
      audioCtx.currentTime + settings.ampEnv.attackTime
    );
  };

  const triggerRelease = (): void => {
    if (hold) return;

    const actualReleaseTime =
      settings.ampEnv.releaseTime / source.playbackRate.value;

    gainNode.gain.linearRampToValueAtTime(
      0,
      audioCtx.currentTime + actualReleaseTime
    );
    source.stop(audioCtx.currentTime + actualReleaseTime + 0.5);
  };

  const updateTuning = (
    newPitchSettings: Pitch_settings,
    prevPitchSettings?: Pitch_settings
  ): void => {
    // TODO: use prevPitchSettings to implement gliding interpolation

    midiNote !== -1 && setRateFromMidi(midiNote, newPitchSettings);
  };

  const updateLoopPoints = (
    param: keyof Time_settings,
    newValue: number,
    prevSettings: Time_settings
  ): void => {
    if (!prevSettings) {
      console.error('missing settings when calling voice.updateLoopPoints');
      return;
    }

    const loopStart = param === 'loopStart' ? newValue : prevSettings.loopStart;
    const loopEnd = param === 'loopEnd' ? newValue : prevSettings.loopEnd;

    const newLoopLength = loopEnd - loopStart;
    if (newLoopLength <= C5_DURATION_SEC) return;

    if (newLoopLength > 0.015) {
      setLoopStart(loopStart);
      setLoopEnd(loopEnd);
      return;
    }

    const nearestNote = snapDurationToNote(
      newLoopLength,
      ['C'],
      'C',
      'C',
      0,
      7,
      'sec'
    );

    const prevLoopLength = prevSettings.loopEnd - prevSettings.loopStart;

    interpolateDurationToNote(
      prevLoopLength,
      nearestNote,
      ['C'],
      'C',
      'C',
      0,
      7,
      'sec',
      500,
      (interpolatedLength: number) => {
        const adjustedNewEnd = loopStart + interpolatedLength;
        setLoopStart(loopStart);
        setLoopEnd(adjustedNewEnd);
      }
    );
  };

  return {
    connect,
    start,
    stop,
    triggerAttack,
    triggerRelease,
    updateLoopPoints,
    updateTuning,
    toggleLoop,

    sampleId,
    volume: gainNode.gain.value,
    startPoint,
    endPoint,
    loopStart: source.loopStart,
    loopEnd: source.loopEnd,
    loop: source.loop,
    hold,
  };
}

// Object.defineProperties(voiceObject, {
//   volume: {
//     get: () => gainNode.gain.value,
//   },
//   loopStart: {
//     get: () => source.loopStart,
//   },
//   loopEnd: {
//     get: () => source.loopEnd,
//   },
//   startPoint: {
//     get: () => startPoint,
//     set: (value: number) => { startPoint = value; },
//   },
//   endPoint: {
//     get: () => endPoint,
//     set: (value: number) => { endPoint = value; },
//   },
//   loop: {
//     get: () => source.loop,
//     set: (value: boolean) => { source.loop = value; },
//   },
//   hold: {
//     get: () => hold,
//     set: (value: boolean) => { hold = value; },
//   },
// });

// return voiceObject as Voice;

// // Getters // usage: voice.volume etc.
// get sampleId() {
//   return sampleId;
// },
// get volume() {
//   return gainNode.gain.value;
// },
// get loopStart() {
//   return source.loopStart;
// },
// get loopEnd() {
//   return source.loopEnd;
// },

// // Setters
// set hold(value: boolean) {
//   hold = value;
// },

// set loop(value: boolean) {
//   source.loop = value;
// },
// set loopStart(value: number) {
//   source.loopStart = value;
// },
// set loopEnd(value: number) {
//   source.loopEnd = value;
// },
// set startPoint(value: number) {
//   startPoint = value;
// },
// set endPoint(value: number) {
//   endPoint = value;
// },

//   // IS THERE ANY POINT IN GETTERS? // could just write voice.source.loop etc.
//    const getVoiceGain = (): GainNode => voiceGain;
//   const getTriggerTime = (): number => ctxTimeStarted;
//   const getMidiNote = (): number => midiNote;
//   const getLoop = (): boolean => source.loop;
//   const getLoopStart = (): number => source.loopStart;
//   const getLoopEnd = (): number => source.loopEnd;
