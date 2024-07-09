'use client';

import React, { useEffect, useState } from 'react';

import { fetchSampleAudio, fetchSamples } from '../../app/server-actions';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useSamplerCtx } from '../../contexts/sampler-context';

// import { useAudioDecoder } from '../../hooks/useAudioDecoder';
// import Recorder_CSR from './Recorder_CSR';
import Player_CSR from './Player_CSR';

export default function Sampler_CSR() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { samples, selectedSampleIds } = useSamplerCtx();

  return (
    <div>
      <Player_CSR />
      {/* buffers={chosenBuffers} */}
      {/* <Recorder_CSR /> */}
    </div>
  );
}

// import { handleDrop, handleDragOver } from '../../utils/dragNdrop';

/* onDragOver={handleDragOver} onDrop={handleDrop} className={''} */

// const [chosenBuffers, setChosenBuffers] = useState<AudioBuffer[]>([]);

// const decodeAudio = useAudioDecoder();

// const [initialBuffer, setInitialBuffer] = useState<AudioBuffer | null>(null);

// const selectedIds =
//   searchParams.get('samples')?.split(',').filter(Boolean) || [];

// useEffect(() => {
//   const loadInitialSample = async () => {
//     try {
//       const response = await fetch('/audio/C-kid1.wav');
//       const arrayBuffer = await response.arrayBuffer();
//       const audioBuffer = await decodeAudio(arrayBuffer);
//       setChosenBuffers([audioBuffer]);
//       setInitialBuffer(audioBuffer);

//       // Update URL to include the initial sample
//       // if (!selectedIds.includes('initial')) {
//       //   router.push('/?samples=initial', { scroll: false });
//       // }
//     } catch (error) {
//       console.error('Failed to load initial sample:', error);
//     }
//   };

// if (selectedIds.length === 0) {
// loadInitialSample();
// } else {
//   // Load samples from URL
//   const loadSamples = async () => {
//     const buffers = await Promise.all(
//       selectedIds.map(async (id) => {
//         if (id === 'initial') {
//           const response = await fetch('/audio/C-kid1.wav');
//           const arrayBuffer = await response.arrayBuffer();
//           return await decodeAudio(arrayBuffer);
//         } else {
//           const arrayBuffer = await fetchSampleAudio(id);
//           return await decodeAudio(arrayBuffer);
//         }
//       })
//     );
//     setChosenBuffers(buffers);
//   };
//   loadSamples();
// }

//   console.log('initialBuffer: ', initialBuffer);
// }, [selectedIds, decodeAudio, router]);
