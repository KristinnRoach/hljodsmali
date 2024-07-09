// src/contexts/sampler-context.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sample } from '../types';
import SamplerEngine from '../lib/SamplerEngine';

import {
  fetchSamples,
  createSampleRecord,
  deleteSample,
  getSampleAudioBuffer,
} from '../lib/db/pocketbase';

import { useReactAudioCtx } from './react-audio-context';

type SamplerCtxType = {
  samples: Sample[];
  selectedSampleIds: string[];
  selectSample: (slug: string) => void;
  addSample: (name: string, file: File) => Promise<void>;
  removeSample: (id: string) => Promise<void>;
  updateSampleSettings: (id: string, settings: Partial<Sample>) => void;
  playNote: (midiNote: number) => void;
  releaseNote: (midiNote: number) => void;
  getSampleInfo: (
    sampleId: string
  ) => { duration: number; buffer: AudioBuffer } | null;
  isLoading: boolean;
};

const SamplerCtx = createContext<SamplerCtxType | null>(null);

let samplerEngine: SamplerEngine;

export default function SamplerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { audioCtx } = useReactAudioCtx();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize SamplerEngine
  if (audioCtx && !samplerEngine) {
    samplerEngine = SamplerEngine.getInstance(audioCtx);
  }

  // State
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [slugToId, setSlugToId] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch samples
  useEffect(() => {
    setIsLoading(true);
    fetchSamples()
      .then(setSamples)
      .catch((error) => console.error('Error fetching samples:', error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const newMap = new Map(samples.map((s) => [s.slug, s.id]));
    setSlugToId(newMap);
  }, [samples]);

  // Sample selection and loading to sampler engine
  useEffect(() => {
    const slugs = searchParams.getAll('samples');
    const selectedIds = slugs
      .map((slug) => slugToId.get(slug))
      .filter(Boolean) as string[];

    setSelectedSampleIds(selectedIds);
    samplerEngine.setSelectedSamples(selectedIds);

    selectedIds.forEach((id) => {
      const sample = samples.find((s) => s.id === id);
      if (sample && !samplerEngine.isSampleLoaded(id)) {
        getSampleAudioBuffer(sample, audioCtx!)
          .then((buffer) => samplerEngine.loadSample(sample, buffer))
          .catch((error) => console.error('Error loading sample:', error));
      }
    });
  }, [searchParams, slugToId, samples, audioCtx]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('samples');
    selectedSampleIds.forEach((id) => {
      const sample = samples.find((s) => s.id === id);
      if (sample) newSearchParams.append('samples', sample.slug);
    });
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  }, [selectedSampleIds, samples, router, searchParams]);

  const selectSample = useCallback(
    (slug: string) => {
      if (!slug) return;
      const id = slugToId.get(slug);
      if (id) {
        setSelectedSampleIds((prev) => {
          const newIds = new Set(prev);
          newIds.has(id) ? newIds.delete(id) : newIds.add(id);
          const newSelectedIds = Array.from(newIds);
          samplerEngine.setSelectedSamples(newSelectedIds);
          return newSelectedIds;
        });
      }
    },
    [slugToId]
  );

  const saveSample = useCallback(
    async (name: string, file: File) => {
      try {
        const newSample = await createSampleRecord(name, file);
        setSamples((prev) => [...prev, newSample]);
        const buffer = await getSampleAudioBuffer(newSample, audioCtx!);
        await samplerEngine.loadSample(newSample, buffer);
        selectSample(newSample.slug);
      } catch (error) {
        console.error('Error adding sample:', error);
      }
    },
    [audioCtx, selectSample]
  );

  const removeSample = useCallback(async (id: string) => {
    try {
      await deleteSample(id);
      setSamples((prev) => prev.filter((s) => s.id !== id));
      setSelectedSampleIds((prev) => prev.filter((sId) => sId !== id));
      samplerEngine.removeSample(id);
    } catch (error) {
      console.error('Error removing sample:', error);
    }
  }, []);

  const getSampleInfo = useCallback((sampleId: string) => {
    return samplerEngine.getSampleInfo(sampleId);
  }, []);

  /* PLAYBACK */

  const playNote = useCallback((midiNote: number) => {
    try {
      samplerEngine.playNote(midiNote);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }, []);

  const releaseNote = useCallback((rate: number) => {
    try {
      samplerEngine.releaseNote(rate);
    } catch (error) {
      console.error('Error releasing note:', error);
    }
  }, []);

  const updateSampleSettings = useCallback(
    (id: string, settings: Partial<Sample>) => {
      try {
        samplerEngine.updateSampleSettings(id, settings);
        setSamples((prev) =>
          prev.map((sample) =>
            sample.id === id ? { ...sample, ...settings } : sample
          )
        );
      } catch (error) {
        console.error(`Error updating sample ${id}:`, error);
      }
    },
    []
  );

  const value = {
    samples,
    selectedSampleIds,
    selectSample,
    addSample: saveSample,
    removeSample,
    updateSampleSettings,
    playNote,
    releaseNote,
    getSampleInfo,
    isLoading,
  };

  return <SamplerCtx.Provider value={value}>{children}</SamplerCtx.Provider>;
}

export function useSamplerCtx() {
  const context = useContext(SamplerCtx);
  if (!context) {
    throw new Error('useSamplerCtx must be used within a SamplerProvider');
  }
  return context;
}

// const [buffers, setBuffers] = useState<Map<string, AudioBuffer>>(new Map());

// const updateSample = useCallback(async (id: string, newName: string) => {
//   try {
//     const updatedSample = await updateSampleName(id, newName);
//     setSamples((prev) =>
//       prev.map((sample) => (sample.id === id ? updatedSample : sample))
//     );
//   } catch (error) {
//     console.error('Error updating sample:', error);
//   }
// }, []);

// useEffect(() => {
//   fetchSamples()
//     .then((samples) => {
//       setSamples(samples);
//     })
//     .catch((error) => {
//       console.error('Error fetching samples:', error);
//     });
// }, []);

// useEffect(() => {
//   if (!audioCtx) {
//     return;
//   }
//   try {
//     SamplerEngine.getInstance(audioCtx);
//   } catch (e) {
//     console.error('Error initializing engine in SamplerProvider: ', e);
//   }
// }, [audioCtx]);

// useEffect(() => {
//   const sampleName = searchParams.get('sample');
//   setCurrentSample(samples.find((s) => s.name === sampleName) || null);
// }, [searchParams, samples]);

// useEffect(() => {
//   if (!currentSample) {
//     return;
//   }
//   // const samplerEngine = SamplerEngine.getInstance();
//   getSampleAudioBuffer(currentSample, audioCtx!).then((buffer) => {
//     samplerEngine.loadSample(currentSample, buffer);
//   });
// }, [currentSample]);

// const selectSample = (name: string) => {
//   if (!name) {
//     return;
//   }
//   router.push(`?sample=${name}`);
//   const sample = samples.find((s) => s.name === name);
//   if (sample) {
//     setSelectedSampleIds([sample.id]);
//   }
// };

// const selectSample = (name: string) => {
//   if (!name) return;

//   const sample = samples.find((s) => s.name === name);
//   if (sample) {
//     setSelectedSampleIds((prev) => {
//       const newIds = new Set(prev);
//       if (newIds.has(sample.id)) {
//         newIds.delete(sample.id);
//       } else {
//         newIds.add(sample.id);
//       }
//       return Array.from(newIds);
//     });

//     const searchParams = new URLSearchParams(window.location.search);
//     searchParams.delete('sample');
//     selectedSampleIds.forEach((id) => searchParams.append('sample', id));
//     router.push(`?${searchParams.toString()}`);
//   }
// };

// const loadSample = useCallback(
//   async (id: string) => {
//     if (!buffers.has(id)) {
//       try {
//         const sample = await fetchSampleByID(id);
//         const buffer = await getSampleAudioBuffer(sample, audioCtx);
//         setBuffers((prev) => new Map(prev).set(id, buffer));
//         setSamples((prev) => new Map(prev).set(id, sample));
//         // Update SamplerEngine if necessary
//       } catch (error) {
//         console.error(`Failed to load sample ${id}:`, error);
//       }
//     }
//   },
//   [audioCtx, buffers]
// );
// useEffect(() => {
//   const sampleNames = searchParams.getAll('sample');
//   const selectedSamples = samples.filter((s) => sampleNames.includes(s.name));
//   setSelectedSampleIds(selectedSamples.map((s) => s.id));

//   selectedSamples.forEach((sample) => {
//     getSampleAudioBuffer(sample, audioCtx!).then((buffer) => {
//       samplerEngine.loadSample(sample, buffer);
//     });
//   });
// }, [searchParams, samples, audioCtx]);

// useEffect(() => {
//   // const samplerEngine = SamplerEngine.getInstance();
//   samplerEngine.setSelectedSamples(selectedSampleIds);
// }, [selectedSampleIds]);

// const selectSample = (slug: string) => {
//   if (!slug) return;
//   const id = slugToId.get(slug);
//   if (id) {
//     let newIds: Set<string>;
//     setSelectedSampleIds((prev) => {
//       newIds = new Set(prev);
//       if (newIds.has(id)) {
//         newIds.delete(id);
//       } else {
//         newIds.add(id);
//       }
//       return Array.from(newIds);
//     });

//     const searchParams = new URLSearchParams(window.location.search);
//     searchParams.delete('sample');
//     Array.from(newIds).forEach((id) => {
//       const sample = samples.find((s) => s.id === id);
//       if (sample) searchParams.append('sample', sample.slug);
//     });
//     router.push(`?${searchParams.toString()}`);
//   }
// };

// const loadSampleToEngine = async (sample: Sample) => {
//   try {
//     // const samplerEngine = SamplerEngine.getInstance();
//     getSampleAudioBuffer(sample, audioCtx!).then((buffer) => {
//       samplerEngine.loadSample(sample, buffer);
//     });
//   } catch (error) {
//     console.error(`Error loading sample ${sample.id}:`, error);
//   }
// };

// const addSample = async (name: string, file: File) => {
//   const newSample = await createSampleRecord(name, file);
//   setSamples((prev) => [...prev, newSample]);
//   await loadSampleToEngine(newSample);
//   selectSample(newSample.name);
// };

// const addSample = async (name: string, file: File) => {
//   try {
//     const newSample = await createSampleRecord(name, file);
//     setSamples((prev) => [...prev, newSample]);
//     await loadSampleToEngine(newSample);
//     selectSample(newSample.slug); // Note: changed from name to slug
//   } catch (error) {
//     if (error.data?.data?.slug?.code === 'validation_invalid_regex') {
//       console.error('Invalid slug format');
//       // Handle the error (e.g., show a user-friendly message)
//     }
//     // Handle other errors
//   }
// };

// const removeSample = async (id: string) => {
//   await deleteSample(id);
//   setSamples((prev) => prev.filter((s) => s.id !== id));
//   setSelectedSampleIds((prev) => prev.filter((sId) => sId !== id));
//   if (currentSample?.id === id) {
//     router.push('/samples');
//   }
// };
// import {
//   fetchSampleByID,
//   fetchSamples,
//   createSampleRecord,
//   deleteSample,
//   getSampleAudioBuffer,
// } from '../lib/db/pocketbase';
