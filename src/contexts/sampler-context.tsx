// src/contexts/sampler-context.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sample_db, SampleSettings } from '../types/sample';

import SamplerEngine from '../lib/SamplerEngine';

import {
  fetchSamples,
  updateSampleRecord,
  deleteSample,
  getSampleAudioBuffer,
  saveNewSample,
} from '../lib/db/pocketbase';

import { useReactAudioCtx } from './react-audio-context';

type SamplerCtxType = {
  masterVolume: number;
  setMasterVolume: (value: number) => void;
  allSamples: Sample_db[];
  getSelectedSamples: () => Sample_db[];
  saveAll: () => void;
  // handleDelete: (id: string) => Promise<void>;
  updateSampleSettings: (id: string, settings: Partial<SampleSettings>) => void;
  startRecording: () => void;
  stopRecording: () => void;
  isLoading: boolean;
};

const SamplerCtx = createContext<SamplerCtxType | null>(null);

export default function SamplerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { audioCtx } = useReactAudioCtx();
  const router = useRouter();
  const searchParams = useSearchParams();
  const samplerEngine = SamplerEngine.getInstance(audioCtx);

  // State
  const [allSamples, setAllSamples] = useState<Sample_db[]>([]);
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.75);

  const selectedSlugsMemo = useMemo(
    () => searchParams.getAll('samples'),
    [searchParams]
  );

  const unsavedSampleIds = useRef<Set<string>>(new Set());

  // Fetch samples
  useEffect(() => {
    setIsLoading(true);
    fetchSamples()
      .then(setAllSamples)
      .catch((error) => console.error('Error fetching samples:', error))
      .finally(() => setIsLoading(false));
  }, []);

  // Sample selection and loading to sampler engine
  useEffect(() => {
    if (!samplerEngine || !audioCtx) return;

    console.log('selectedSlugsMemo: ', selectedSlugsMemo);

    const loadSamples = async () => {
      // TODO: fix edge case where slug is not unique (e.g. slug to id map) ?

      const ids = [];
      const loadPromises = selectedSlugsMemo.map(async (slug) => {
        const sample = allSamples.find((s) => s.slug === slug);
        if (sample && sample.id) {
          console.log('loading sample:', sample.id);
          ids.push(sample.id);
          if (!samplerEngine.isSampleLoaded(sample.id)) {
            try {
              const buffer = await getSampleAudioBuffer(sample, audioCtx);
              samplerEngine.loadSample(sample, buffer);
            } catch (error) {
              console.error(`Error loading sample ${sample.id}:`, error);
            }
          }
        }
      });

      await Promise.all(loadPromises);
      samplerEngine.setSelectedSampleIds(ids);

      console.log('ids:', ids);
    };

    loadSamples();

    return () => {
      samplerEngine.setSelectedSampleIds([]);
    };
  }, [selectedSlugsMemo, allSamples, audioCtx, samplerEngine]);

  // allSamples ?

  // // Todo: fix this ugly code
  // if (
  //   allSamples[allSamples.length - 1]?.slug === selectedSlugsMemo[0] &&
  //   samplerEngine.isSampleLoaded(allSamples[allSamples.length - 1].slug)
  // ) {
  //   console.log('single sample already loaded:', allSamples[0].name);
  //   return;
  // }

  const getSelectedSampleIds = useCallback(() => {
    if (!samplerEngine) return [];
    return samplerEngine.getSelectedSampleIds();
  }, [samplerEngine]);

  const getSelectedSamples = useCallback(() => {
    // const selectedIds = searchParams.getAll('samples');
    return allSamples.filter((sample) =>
      selectedSlugsMemo.includes(sample.slug)
    );
  }, [selectedSlugsMemo, allSamples]);

  /* SAMPLE SETTINGS */

  const updateSampleSettings = useCallback(
    (id: string, settings: Partial<SampleSettings>) => {
      if (!samplerEngine) throw new Error('Sampler engine not initialized');

      try {
        samplerEngine.updateSampleSettings(id, settings);
        setAllSamples((prev) =>
          prev.map((sample) =>
            sample.id === id
              ? {
                  ...sample,
                  sample_settings: { ...sample.sample_settings, ...settings },
                }
              : sample
          )
        );
        unsavedSampleIds.current.add(id);
      } catch (error) {
        console.error(`Error updating sample ${id}:`, error);
      }
    },
    [samplerEngine]
  );

  /* SAVE SAMPLES */

  function saveAll() {
    if (!samplerEngine) throw new Error('Sampler engine not initialized');
    if (!unsavedSampleIds.current.size) {
      alert('No unsaved samples');
      console.warn('No unsaved samples');
      return;
    }

    unsavedSampleIds.current.forEach((id) => {
      const sample = allSamples.find((s) => s.id === id);
      if (!sample) return;

      if (id.includes('new-sample')) {
        const newName = promptUserForSampleName();
        if (!newName) return;

        const newSample = {
          ...sample,
          name: newName,
          slug: newName.toLowerCase().replace(/\s+/g, '-'),
        };

        saveNewSample(newSample)
          .then((savedSample) => {
            setAllSamples((prev) =>
              prev.map((s) => (s.id === id ? savedSample : s))
            );
            unsavedSampleIds.current.delete(id);
            router.replace(`?samples=${savedSample.slug}`);
          })
          .catch((error) => console.error('Error saving sample:', error));
      } else {
        updateSampleRecord(id, { ...sample })
          .then(() => {
            unsavedSampleIds.current.delete(id);
          })
          .catch((error) => console.error('Error saving sample:', error));
      }
    });
  }

  function promptUserForSampleName() {
    const sampleName = prompt('Enter a name for the sample:');
    if (sampleName) {
      return sampleName;
    } else {
      alert('Save cancelled. Please provide a name to save the sample.');
    }
  }

  /* MASTER VOLUME */

  useEffect(() => {
    if (samplerEngine) {
      samplerEngine.setMasterVolume(masterVolume);
    }
  }, [masterVolume, samplerEngine]);

  const getEngineMasterVolume = useCallback(() => {
    if (!samplerEngine) throw new Error('Sampler engine not initialized');
    return samplerEngine.getMasterVolume();
  }, [samplerEngine]);

  /* RECORDING */

  const startRecording = useCallback(() => {
    if (!samplerEngine) throw new Error('Sampler engine not initialized');
    samplerEngine.startRecording();
  }, [samplerEngine]);

  const stopRecording = useCallback(async () => {
    if (!samplerEngine) throw new Error('Sampler engine not initialized');
    const { sample, buffer } = await samplerEngine.stopRecording();
    if (sample && buffer) {
      samplerEngine.loadSample(sample, buffer);
      unsavedSampleIds.current.add(sample.id);
      setAllSamples((prev) => [...prev, sample]);
      router.replace(`?samples=${sample.slug}`); // , { scroll: false }
    }
  }, [samplerEngine, router]);

  const value = {
    masterVolume,
    setMasterVolume,
    allSamples,
    getSelectedSamples,
    saveAll,
    // handleDelete,
    updateSampleSettings,
    startRecording,
    stopRecording,
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

// useEffect(() => {
//   if (!samplerEngine) return;

//   samplerEngine.setSelectedSampleIds(selectedIds);

//   const loadedSamples = samplerEngine.getLoadedSamples();
//   const selected = samplerEngine.getSelectedSampleIds();

//   console.log(
//     'From sampler engine / context useEffect: ',
//     'unsaved:',
//     unsavedSampleIds.current,
//     'loadedSamples:',
//     loadedSamples,
//     'engine selected:',
//     selected,
//     'context selected:',
//     selectedIds
//   );
// }, [selectedIds, samplerEngine]);

// async function saveUpdatedSamples() {
//   const ids = unsavedSampleIds.current;
//   if (!ids.size) return;
//   const promises = Array.from(ids).map((id) => {
//     const sample = allSamples.find((s) => s.id === id);
//     if (!sample) return Promise.resolve();
//     return updateSampleRecord(id, { ...sample }).catch((error) =>
//       console.error(`Error updating sample ${id} settings:`, error)
//     );
//   });
//   try {
//     await Promise.all(promises);
//     unsavedSampleIds.current = new Set();
//   } catch (error) {
//     console.error('Error updating sample settings:', error);
//   }
// }
