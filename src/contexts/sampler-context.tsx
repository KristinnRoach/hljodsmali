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
import { useReactAudioCtx } from './react-audio-context';

import {
  Sample_db,
  Sample_settings,
  createNewSampleObject,
} from '../types/sample';

import {
  fetchSamples,
  updateSampleRecord,
  deleteSampleRecord,
  getSampleAudioBuffer,
  createSampleRecord,
  renameSampleRecord,
} from '../lib/db/pocketbase';

import SamplerEngine from '../lib/SamplerEngine';

type SamplerCtxType = {
  samplerEngine: SamplerEngine | null;
  allSamples: Sample_db[];
  selectedSamples: Sample_db[];
  latestSelectedSample: Sample_db | undefined;
  latestSelectedBuffer: AudioBuffer | undefined;
  isSampleLoaded: (id: string) => boolean;
  isSampleSelected: (id: string) => boolean;
  saveAll: () => void;
  updateSample: (id: string) => void;
  deleteSample: (id: string) => void;
  hasUnsavedSamples: boolean;
  isLooping: boolean;
  toggleLoop: () => void;
  setLoop: (loop: boolean) => void;
  isHolding: boolean;
  toggleHold: () => void;
  setHold: (hold: boolean) => void;
  updateSampleSettings: (
    id: string,
    settings: Partial<Sample_settings>
  ) => void;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  if (typeof window === 'undefined')
    throw new Error('No window object in sampler context'); // not necessary in a 'use client' context?

  const { audioCtx } = useReactAudioCtx();

  const samplerEngine = audioCtx ? SamplerEngine.getInstance(audioCtx) : null; // should this be in a useMemo?

  // State
  const [allSamples, setAllSamples] = useState<Sample_db[]>([]);
  const [isLoading, setIsLoading] = useState(false); // todo: set true when db ready

  const selectedSlugsMemo = useMemo(
    () => searchParams.getAll('samples'),
    [searchParams]
  );

  const unsavedSampleIds = useRef<Set<string>>(new Set());

  const loadedBuffers = useRef(new Map<string, AudioBuffer>());

  const addLoadedBuffer = useCallback((id: string, buffer: AudioBuffer) => {
    loadedBuffers.current.set(id, buffer);
  }, []);

  /* UTILS */

  const isMatchingSlug = (sample: Sample_db, slug: string) =>
    sample.slug === slug || `${sample.slug}-${sample.id}` === slug;

  const isSampleLoaded = useCallback(
    (id: string) => samplerEngine?.isSampleLoaded(id) ?? false,
    [samplerEngine]
  );

  const isSampleSelected = useCallback(
    (id: string) => samplerEngine?.isSampleSelected(id) ?? false,
    [samplerEngine]
  );

  /* LOOPING and HOLDING */

  const [isLooping, setIsLooping] = useState(
    samplerEngine?.isLooping() ?? false
  );
  const [isHolding, setIsHolding] = useState(
    samplerEngine?.isHolding() ?? false
  );

  const toggleLoop = () => {
    if (!(samplerEngine && audioCtx)) return;
    setIsLooping((prev) => !prev);
  };

  const toggleHold = () => {
    if (!(samplerEngine && audioCtx)) return;
    setIsHolding((prev) => !prev);
  };

  const setLoop = (loop: boolean) => {
    if (!(samplerEngine && audioCtx)) return;
    setIsLooping(loop);
  };

  const setHold = (hold: boolean) => {
    if (!(samplerEngine && audioCtx)) return;
    setIsHolding(hold);
  };

  // sync loop and hold states with engine
  useEffect(() => {
    if (!(samplerEngine && audioCtx)) return;

    samplerEngine.setLoop(isLooping);
    samplerEngine.setHold(isHolding);
  }, [isLooping, isHolding, samplerEngine, audioCtx]);

  /* TODO: In the process of switching DB's 
 
 // Fetch samples  
    useEffect(() => {
      setIsLoading(true);
      fetchSamples()
        .then(setAllSamples)
        .catch((error) => console.error('Error fetching samples:', error))
        .finally(() => setIsLoading(false));
    }, []);
  */

  // DRAG N DROP

  const handleDroppedFile = useCallback(
    async (file: File) => {
      if (!(samplerEngine && audioCtx)) return;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const sample = createNewSampleObject(
          `dropped-${Date.now()}`,
          file.name,
          file,
          audioBuffer.duration
        );
        if (!sample) console.error('Error creating new sample object');

        samplerEngine.loadSample(sample, audioBuffer);
        addLoadedBuffer(sample.id, audioBuffer);

        unsavedSampleIds.current.add(sample.id);
        setAllSamples((prev) => [...prev, sample]);
        router.replace(`?samples=${sample.slug}`, { scroll: false });
      } catch (error) {
        console.error('Error decoding dropped audio file:', error);
      }
    },
    [audioCtx, samplerEngine, router, addLoadedBuffer]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(samplerEngine && audioCtx)) return;

    const handleGlobalDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleGlobalDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('audio/')) {
        await handleDroppedFile(file);
      }
    };

    window.addEventListener('dragover', handleGlobalDrag);
    window.addEventListener('drop', handleGlobalDrop);

    return () => {
      window.removeEventListener('dragover', handleGlobalDrag);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, [handleDroppedFile, samplerEngine, audioCtx]);

  // Sample selection and loading to sampler engine
  useEffect(() => {
    if (!(samplerEngine && audioCtx)) return;
    const loadSamples = async () => {
      const ids: string[] = [];
      const loadPromises = selectedSlugsMemo.map(async (slug) => {
        const sample = allSamples.find((s) => s.slug === slug);
        if (sample && sample.id) {
          ids.push(sample.id);
          if (!samplerEngine.isSampleLoaded(sample.id)) {
            console.log('loading sample:', sample);

            try {
              const buffer = await getSampleAudioBuffer(sample, audioCtx);
              samplerEngine.loadSample(sample, buffer);

              addLoadedBuffer(sample.id, buffer);
            } catch (error) {
              console.error(`Error loading sample ${sample.id}:`, error);
            }
          }
        }
      });

      await Promise.all(loadPromises);
      samplerEngine.setSelectedSampleIds(ids);
    };

    loadSamples();

    return () => {
      samplerEngine.setSelectedSampleIds([]);
    };
  }, [selectedSlugsMemo, allSamples, audioCtx, samplerEngine, addLoadedBuffer]); // allSamples ?

  const selectedSamples = useMemo(
    () =>
      Array.from(
        allSamples
          .filter((sample) =>
            selectedSlugsMemo.some((slug) => isMatchingSlug(sample, slug))
          )
          .reduce((map, sample) => {
            const key = map.has(sample.slug)
              ? `${sample.slug}-${sample.id}` // adds id to slug if not unique (temp fix)
              : sample.slug;
            return map.set(key, sample);
          }, new Map<string, Sample_db>())
          .values()
      ),
    [selectedSlugsMemo, allSamples]
  );

  const latestSelectedSample = useMemo(() => {
    return selectedSamples.find((sample) =>
      isMatchingSlug(sample, selectedSlugsMemo[0])
    );
  }, [selectedSamples, selectedSlugsMemo]);

  const latestSelectedBuffer = useMemo(() => {
    return latestSelectedSample
      ? loadedBuffers.current.get(latestSelectedSample.id)
      : undefined;
  }, [latestSelectedSample, loadedBuffers]);

  /* SAMPLE SETTINGS */

  const updateSampleSettings = useCallback(
    (id: string, settings: Partial<Sample_settings>) => {
      if (!(samplerEngine && audioCtx)) return;

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
        console.error(
          `Error adjusting sample settings, sampleId: ${id}:`,
          error
        );
      }
    },
    [samplerEngine, audioCtx]
  );

  /* SAVE SAMPLES */

  function saveAll() {
    console.log(unsavedSampleIds.current);
    if (!(samplerEngine && audioCtx)) return;

    if (!unsavedSampleIds.current.size) {
      alert('No unsaved samples');
      console.warn('No unsaved samples');
      return;
    }

    unsavedSampleIds.current.forEach((id) => {
      const loadedSample = samplerEngine
        .getLoadedSamples()
        .find((isLoaded) => isLoaded.sample.id === id);
      const sample = loadedSample?.sample;
      if (!sample) return;

      if (id.includes('new-sample') || id.includes('dropped')) {
        const newName = promptUserForSampleName();
        if (!newName) return;

        const newSample = {
          ...sample,
          name: newName,
          slug: newName.toLowerCase().replace(/\s+/g, '-'),
        };

        createSampleRecord(newSample)
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

  async function updateSample(id: string) {
    const sample = allSamples.find((s) => s.id === id);
    if (!sample) return;
    await updateSampleRecord(id, { ...sample }).catch((error) =>
      console.error(`Error updating sample ${id} settings:`, error)
    );
  }

  async function deleteSample(id: string) {
    if (!(samplerEngine && audioCtx)) return;

    const name = allSamples.find((s) => s.id === id)?.name;

    const confirmDelete = confirm(`Delete ${name || 'this sample'}?`);
    if (!confirmDelete) return;

    await deleteSampleRecord(id).catch((error) =>
      console.error(`Error deleting sample ${id}:`, error)
    );
    samplerEngine.unloadSample(id);
    setAllSamples((prev) => prev.filter((s) => s.id !== id));
    unsavedSampleIds.current.delete(id);
    selectedSlugsMemo.splice(selectedSlugsMemo.indexOf(id), 1);
    router.replace(`?samples=${selectedSlugsMemo[0]}`, { scroll: false });
  }

  function promptUserForSampleName() {
    const sampleName = prompt('Enter a name for the sample:');
    if (sampleName) {
      return sampleName;
    } else {
      alert('Save cancelled. Please provide a name to save the sample.');
    }
  }

  async function renameSample(id: string, name: string) {
    await renameSampleRecord(id, name).catch((error) =>
      console.error(`Error renaming sample ${id}:`, error)
    );
    setAllSamples((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  }

  /* RECORDING */

  const startRecording = useCallback(async () => {
    if (!(samplerEngine && audioCtx)) return;

    await samplerEngine.startRecording();
  }, [samplerEngine, audioCtx]);

  const stopRecording = useCallback(async () => {
    if (!(samplerEngine && audioCtx)) return;

    const { sample, buffer } = await samplerEngine.stopRecording();
    if (sample && buffer) {
      samplerEngine.loadSample(sample, buffer);
      unsavedSampleIds.current.add(sample.id);
      setAllSamples((prev) => [...prev, sample]);
      router.replace(`?samples=${sample.slug}`, { scroll: false });
    }
  }, [samplerEngine, router, audioCtx]);

  const value = {
    samplerEngine,
    allSamples,
    selectedSamples,
    latestSelectedSample,
    latestSelectedBuffer,
    isSampleLoaded,
    isSampleSelected,
    saveAll,
    updateSample,
    deleteSample,
    hasUnsavedSamples: unsavedSampleIds.current.size > 0,
    isLooping,
    toggleLoop,
    setLoop,
    isHolding,
    toggleHold,
    setHold,
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
