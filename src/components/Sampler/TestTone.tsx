import React, { useState, useCallback, useRef, useEffect } from 'react';
import Knob from '../UI/Basic/Knob';

const FADE_IN_SEC = 0.05;
const FADE_OUT_SEC = 0.1;
const MIN_VOLUME = 0;
const MAX_VOLUME = 0.2;
const DEFAULT_VOLUME = 0.1;

interface TestToneProps {
  frequency: number;
  className?: string;
}

const TestTone: React.FC<TestToneProps> = ({ frequency }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [label, setLabel] = useState('Play C4');

  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        console.log(
          'Created new audio context in TestTone component:',
          audioContextRef.current
        );
      } catch (error) {
        console.error('Web Audio API is not supported in this browser:', error);
      }
    }
    return audioContextRef.current;
  }, []);

  const fadeIn = useCallback(
    (gainNode: GainNode) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      gainNode.gain.cancelScheduledValues(ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        ctx.currentTime + FADE_IN_SEC
      );
    },
    [volume]
  );

  const fadeOut = useCallback((gainNode: GainNode) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);
  }, []);

  const toggleTone = useCallback(() => {
    let ctx = audioContextRef.current;
    if (!ctx) {
      ctx = createAudioContext();
    }

    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        console.log('Resumed audio context in TestTone component:', ctx);
      });
    }

    if (isPlaying && gainNodeRef.current && oscillatorRef.current) {
      fadeOut(gainNodeRef.current);
      oscillatorRef.current.stop(ctx.currentTime + FADE_OUT_SEC);
      setLabel('Play C4');
      setTimeout(() => {
        oscillatorRef.current = null;
        gainNodeRef.current = null;
        setIsPlaying(false);
      }, FADE_OUT_SEC * 1000 + 20);
    } else {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      fadeIn(gainNode);
      osc.start();
      setLabel('Stop C4');

      oscillatorRef.current = osc;
      gainNodeRef.current = gainNode;
      setIsPlaying(true);
    }
  }, [frequency, volume, isPlaying, fadeIn, fadeOut, createAudioContext]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        volume,
        audioContextRef.current.currentTime,
        0.01
      );
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
          console.log('Closed audio context in TestTone component');
        });
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <button onClick={toggleTone}>{label}</button>
      <Knob
        label='Vol'
        value={volume}
        min={MIN_VOLUME}
        max={MAX_VOLUME}
        step={0.01}
        onChange={setVolume}
        className='volumeKnob'
        size='xs'
        showValue={false}
      />
    </div>
  );
};

export default TestTone;

// import React, { useState, useCallback, useRef, useEffect } from 'react';

// import Knob from '../UI/Basic/Knob';

// const FADE_IN_SEC = 0.05;
// const FADE_OUT_SEC = 0.1;
// const MIN_VOLUME = 0;
// const MAX_VOLUME = 0.2;
// const DEFAULT_VOLUME = 0.1;

// interface TestToneProps {
//   frequency: number;
//   className?: string;
// }

// let ctx: AudioContext | null = null;

// const TestTone: React.FC<TestToneProps> = ({ frequency }) => {
//   const oscillatorRef = useRef<OscillatorNode | null>(null);
//   const gainNodeRef = useRef<GainNode | null>(null);
//   const [volume, setVolume] = useState(DEFAULT_VOLUME);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [label, setLabel] = useState('Play C4');

//   function createAudioContext() {
//     if (!ctx) {
//       if (typeof AudioContext !== 'undefined') {
//         ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
//       } else {
//         console.error('Web Audio API is not supported in this browser');
//       }
//       ctx
//         ? console.log('created new audio context in TestTone component: ', ctx)
//         : console.warn(
//             'failed to create audio context in TestTone component: ',
//             ctx
//           );
//     }
//     return ctx;
//   }

//   const fadeIn = useCallback(
//     (gainNode: GainNode) => {
//       if (!ctx) return;

//       gainNode.gain.cancelScheduledValues(ctx.currentTime);
//       gainNode.gain.setValueAtTime(0, ctx.currentTime);
//       gainNode.gain.linearRampToValueAtTime(
//         volume,
//         ctx.currentTime + FADE_IN_SEC
//       );
//     },
//     [volume]
//   );

//   const fadeOut = useCallback((gainNode: GainNode) => {
//     if (!ctx) return;

//     const now = ctx.currentTime;
//     gainNode.gain.cancelScheduledValues(now);
//     gainNode.gain.setValueAtTime(gainNode.gain.value, now);
//     gainNode.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);
//   }, []);

//   const toggleTone = useCallback(() => {
//     if (!ctx) {
//       ctx = createAudioContext();
//     }

//     if (!ctx) return;

//     if (ctx.state === 'suspended') {
//       ctx.resume();
//       console.log('resumed audio context in TestTone component: ', ctx);
//     }

//     if (isPlaying && gainNodeRef.current && oscillatorRef.current) {
//       fadeOut(gainNodeRef.current);
//       oscillatorRef.current.stop(ctx.currentTime + FADE_OUT_SEC);
//       setLabel('Play C4');
//       setTimeout(() => {
//         oscillatorRef.current = null;
//         gainNodeRef.current = null;
//         setIsPlaying(false);
//       }, FADE_OUT_SEC * 1000 + 20);
//     } else {
//       const osc = ctx.createOscillator();
//       const gainNode = ctx.createGain();

//       osc.type = 'triangle';
//       osc.frequency.setValueAtTime(frequency, ctx.currentTime);

//       osc.connect(gainNode);
//       gainNode.connect(ctx.destination);

//       fadeIn(gainNode);
//       osc.start();
//       setLabel('Stop C4');

//       oscillatorRef.current = osc;
//       gainNodeRef.current = gainNode;
//       setIsPlaying(true);
//     }
//   }, [frequency, volume, isPlaying, fadeIn, fadeOut]);

//   useEffect(() => {
//     if (gainNodeRef.current && ctx) {
//       gainNodeRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.01);
//     }
//   }, [volume, ctx]);

//   useEffect(() => {
//     return () => {
//       if (oscillatorRef.current) {
//         oscillatorRef.current.stop();
//         oscillatorRef.current.disconnect();
//       }
//       if (gainNodeRef.current) {
//         gainNodeRef.current.disconnect();
//       }
//       if (ctx) {
//         ctx.close();
//         ctx = null;
//         console.log('closed audio context in TestTone component: ', ctx);
//       }
//     };
//   }, []);

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//       <button onClick={toggleTone}>{label}</button>
//       <Knob
//         label='Vol'
//         value={volume}
//         min={MIN_VOLUME}
//         max={MAX_VOLUME}
//         step={0.01}
//         onChange={setVolume}
//         className='volumeKnob'
//         size='xs'
//         showValue={false}
//       />
//     </div>
//   );
// };

// export default TestTone;

// padding: 0.5rem 0.75rem,
// font-size: 1.2rem,
// height: 3rem,
// width: fit-content

// import React, { useState, useCallback, useRef, useEffect } from 'react';

// const FADE_IN_SEC = 0.05;
// const FADE_OUT_SEC = 0.1;

// const TestTone: React.FC<{ frequency: number; volume: number }> = ({
//   frequency,
//   volume,
// }) => {
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const oscillatorRef = useRef<OscillatorNode | null>(null);
//   const gainNodeRef = useRef<GainNode | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const createAudioContext = useCallback(() => {
//     if (!audioContextRef.current) {
//       audioContextRef.current = new AudioContext();
//     }
//     return audioContextRef.current;
//   }, []);

//   const fadeIn = useCallback(
//     (gainNode: GainNode, ctx: AudioContext) => {
//       gainNode.gain.cancelScheduledValues(ctx.currentTime);
//       gainNode.gain.setValueAtTime(0, ctx.currentTime);
//       gainNode.gain.linearRampToValueAtTime(
//         volume,
//         ctx.currentTime + FADE_IN_SEC
//       );
//     },
//     [volume]
//   );

//   const fadeOut = useCallback((gainNode: GainNode, ctx: AudioContext) => {
//     gainNode.gain.cancelScheduledValues(ctx.currentTime);
//     gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT_SEC);
//   }, []);

//   const toggleTone = useCallback(() => {
//     const ctx = createAudioContext();

//     if (isPlaying && gainNodeRef.current) {
//       fadeOut(gainNodeRef.current, ctx);
//       setTimeout(() => {
//         oscillatorRef.current?.stop();
//         oscillatorRef.current?.disconnect();
//         oscillatorRef.current = null;
//         gainNodeRef.current = null;
//         setIsPlaying(false);
//       }, FADE_OUT_SEC * 1000 + 20);
//     } else {
//       const osc = ctx.createOscillator();
//       const gainNode = ctx.createGain();

//       osc.type = 'triangle';
//       osc.frequency.setValueAtTime(frequency, ctx.currentTime);

//       osc.connect(gainNode);
//       gainNode.connect(ctx.destination);

//       fadeIn(gainNode, ctx);
//       osc.start();

//       oscillatorRef.current = osc;
//       gainNodeRef.current = gainNode;
//       setIsPlaying(true);
//     }
//   }, [frequency, volume, isPlaying, createAudioContext, fadeIn, fadeOut]);

//   useEffect(() => {
//     return () => {
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <button onClick={toggleTone}>
//       {isPlaying ? 'Stop Tone' : 'Play Tone'}
//     </button>
//   );
// };

// export default TestTone;

// import React, { useState, useCallback, useRef, useEffect } from 'react';

// const TestTone: React.FC<{ frequency: number; volume: number }> = ({
//   frequency,
//   volume,
// }) => {
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const oscillatorRef = useRef<OscillatorNode | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const createAudioContext = useCallback(() => {
//     if (!audioContextRef.current) {
//       audioContextRef.current = new AudioContext();
//     }
//     return audioContextRef.current;
//   }, []);

//   const toggleTone = useCallback(() => {
//     if (isPlaying) {
//       oscillatorRef.current?.stop();
//       oscillatorRef.current?.disconnect();
//       oscillatorRef.current = null;
//       setIsPlaying(false);
//     } else {
//       const ctx = createAudioContext();
//       const osc = ctx.createOscillator();
//       const gainNode = ctx.createGain();

//       osc.type = 'triangle';
//       osc.frequency.setValueAtTime(frequency, ctx.currentTime);
//       gainNode.gain.setValueAtTime(volume, ctx.currentTime);

//       osc.connect(gainNode);
//       gainNode.connect(ctx.destination);
//       osc.start();

//       oscillatorRef.current = osc;
//       setIsPlaying(true);
//     }
//   }, [frequency, volume, isPlaying, createAudioContext]);

//   useEffect(() => {
//     return () => {
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <button onClick={toggleTone}>
//       {isPlaying ? 'Stop Tone' : 'Play Tone'}
//     </button>
//   );
// };

// export default TestTone;

// import React, { useState, useCallback } from 'react';

// const TestTone: React.FC<{ frequency: number; volume: number }> = ({
//   frequency,
//   volume,
// }) => {
//   const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
//   const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const toggleTone = useCallback(() => {
//     if (isPlaying) {
//       oscillator?.stop();
//       oscillator?.disconnect();
//       setOscillator(null);
//       setIsPlaying(false);
//     } else {
//       const ctx = new AudioContext();
//       const osc = ctx.createOscillator();
//       const gainNode = ctx.createGain();

//       osc.type = 'triangle';
//       osc.frequency.setValueAtTime(frequency, ctx.currentTime);
//       gainNode.gain.setValueAtTime(volume, ctx.currentTime);

//       osc.connect(gainNode);
//       gainNode.connect(ctx.destination);
//       osc.start();

//       setAudioContext(ctx);
//       setOscillator(osc);
//       setIsPlaying(true);
//     }
//   }, [frequency, volume, isPlaying, oscillator]);

//   return (
//     <button onClick={toggleTone}>
//       {isPlaying ? 'Stop Tone' : 'Play Tone'}
//     </button>
//   );
// };

// export default TestTone;
