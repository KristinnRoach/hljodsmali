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
import {
  SampleRecord,
  Sample_settings,
  getDefaultSampleSettings,
} from '../types/sample';

import SamplerEngine from '../lib/SamplerEngine';

import {
  fetchSamples,
  updateSampleRecord,
  deleteSampleRecord,
  getSampleAudioBuffer,
  saveNewSampleRecord,
  renameSampleRecord,
} from '../lib/db/pocketbase';

import { useReactAudioCtx } from './react-audio-context';

type SamplerCtxType = {
  samplerEngine: SamplerEngine | null;
  sampleRecords: SampleRecord[];
  sampleSwitchFlag: number;
  selectedSamples: SampleRecord[];
  latestSelectedSample: SampleRecord | undefined;
  latestSelectedBuffer: AudioBuffer | undefined;
  isSampleLoaded: (id: string) => boolean;
  isSampleSelected: (id: string) => boolean;
  saveAll: () => void;
  updateSample: (id: string) => void;
  deleteSample: (id: string) => void;
  hasUnsavedSamples: boolean;
  isLooping: boolean;
  toggleLoop: () => void;
  isHolding: boolean;
  toggleHold: () => void;
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
  // const samplerEngine = audioCtx
  //   ? useMemo(() => SamplerEngine.getInstance(audioCtx), [audioCtx])
  //   : null;

  // State
  const [sampleRecords, setSampleRecords] = useState<SampleRecord[]>([]);
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const [sampleSwitchFlag, setSampleSwitchFlag] = useState(0);

  useEffect(() => {
    setSampleSwitchFlag((prev) => prev + 1);
  }, [selectedSlugsMemo]);

  const isMatchingSlug = (sample: SampleRecord, slug: string) =>
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

    samplerEngine.toggleLoop();
    setIsLooping(samplerEngine.isLooping()); // for use in UI and for mouse events
    console.log('isLooping:', samplerEngine.isLooping());
  };

  const toggleHold = () => {
    if (!(samplerEngine && audioCtx)) return;

    samplerEngine.toggleHold();
    setIsHolding(samplerEngine.isHolding());
    console.log('isHolding:', samplerEngine.isHolding());
  };

  // const handleHoldKey = (tabActive: boolean, spaceDown: boolean) => {
  //   if (!(samplerEngine && audioCtx)) return;

  //   const newHoldState = tabActive !== spaceDown;
  //   if (newHoldState !== isHolding) {
  //     setIsHolding(newHoldState);
  //     samplerEngine.toggleHold();

  //     // toggleHold();
  //   }
  // };

  /* Do it this way for clarity! */

  // const handleCaps = (active: boolean) => {
  //   // caps / button
  //   if (!(samplerEngine && audioCtx)) return;
  //   samplerEngine.toggleLoop();
  //   // samplerEngine.handleMainLoopKeypress(active);
  // };

  // const isMomentaryLoopDown(down: boolean) { // space

  // const isMainHoldActive(active: boolean) { // tab / button

  // const isMomentaryHoldDown(down: boolean) { // space for now, separate function for clarity and easy expansion

  // if isHolding && isLooping -> space releases hold
  // if !isHolding && isLooping -> space holds
  // if isHolding && !isLooping -> space starts looping
  // if !isHolding && !isLooping -> space does nothing

  /* this is a bit messy - implement the above */
  // const handleLoopKeys = (capsActive: boolean, spaceDown: boolean) => {
  //   if (!(samplerEngine && audioCtx)) return;

  //   // if (isLooping && isHolding && spaceDown) {
  //   //   toggleHold(); // space should release hold when looping, why does it not?
  //   //   return;
  //   // }

  //   console.log('handleLoopKeys:', capsActive, spaceDown, isHolding);

  //   samplerEngine.handleLoopKeys(capsActive, spaceDown);
  //   setIsLooping(samplerEngine.isLooping());
  // };

  // // move handleLoopKeys to samplerCtx, only toggle loop neccessary
  // handleLoopKeys(loopToggle: boolean, loopMomentary: boolean): void {
  //   const newLoopState = loopToggle !== loopMomentary;
  //   if (newLoopState !== this.globalLoop) {
  //     this.toggleGlobalLoop();
  //   }
  // }

  // Fetch samples
  useEffect(() => {
    setIsLoading(true);
    fetchSamples()
      .then(setSampleRecords)
      .catch((error) => console.error('Error fetching samples:', error))
      .finally(() => setIsLoading(false));
  }, []);

  // DRAG N DROP

  const handleDroppedFile = useCallback(
    async (file: File) => {
      if (!(samplerEngine && audioCtx)) return;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer); // if loadSamples is already called, it should create a buffer and record?
        // const sampleId = `dropped-${Date.now()}`;
        const sampleSettings = getDefaultSampleSettings(audioBuffer.duration);

        const sampleRecord: SampleRecord = await saveNewSampleRecord(
          file.name,
          file,
          sampleSettings
        );

        if (!(sampleRecord && sampleSettings))
          // && audioBuffer
          throw new Error('Error saving sample record');

        // samplerEngine.loadSample(sampleRecord, audioBuffer); // loadSamples is already called on drop ?
        addLoadedBuffer(sampleRecord.id, audioBuffer);

        // unsavedSampleIds.current.add(sampleId);
        setSampleRecords((prev) => [...prev, sampleRecord]); // triggers loadSamples useEffect

        router.replace(`?samples=${sampleRecord.slug}`, { scroll: false }); // FIX: triggers loadSamples useEffect again ?
      } catch (error) {
        console.error('Error decoding dropped audio file:', error);
      }
    },
    [audioCtx, samplerEngine, router] // needs all functions as dependencies?
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
      // TODO: fix edge case where slug is not unique (e.g. slug to id map) ?

      const ids: string[] = [];
      const loadPromises = selectedSlugsMemo.map(async (slug) => {
        const foundSample = sampleRecords.find((s) => s.slug === slug);

        if (foundSample && foundSample.id) {
          ids.push(foundSample.id);
          if (!samplerEngine.isSampleLoaded(foundSample.id)) {
            console.log('loading sample:', foundSample);

            try {
              const buffer = await getSampleAudioBuffer(foundSample, audioCtx); // VERIFY: sample needs to be already in database for this to work
              samplerEngine.loadSample(foundSample, buffer);

              addLoadedBuffer(foundSample.id, buffer);
            } catch (error) {
              console.error(`Error loading sample ${foundSample.id}:`, error);
            }
          }
        }
      });

      await Promise.all(loadPromises);
      samplerEngine.setSelectedSampleIds(ids);

      // console.log('ids: ', ids);
    };

    loadSamples();

    return () => {
      samplerEngine.setSelectedSampleIds([]);
    };
  }, [selectedSlugsMemo, sampleRecords, audioCtx, samplerEngine]); // allSamples ?

  const selectedSamples = useMemo(
    () =>
      Array.from(
        sampleRecords
          .filter((sample) =>
            selectedSlugsMemo.some((slug) => isMatchingSlug(sample, slug))
          )
          .reduce((map, sample) => {
            const key = map.has(sample.slug)
              ? `${sample.slug}-${sample.id}` // adds id to slug if not unique (temp fix)
              : sample.slug;
            return map.set(key, sample);
          }, new Map<string, SampleRecord>())
          .values()
      ),
    [selectedSlugsMemo, sampleRecords]
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

        setSampleRecords((prev) =>
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
        .find((isLoaded) => isLoaded.id === id);
      const sample = loadedSample;
      // const sample = allSamples.find((s) => s.id === id);
      if (!sample) return;

      // if (id.includes('new-sample') || id.includes('dropped')) {
      //   const newName = promptUserForSampleName();
      //   if (!newName) return;

      //   const newSample = {
      //     ...sample,
      //     name: newName,
      //     slug: newName.toLowerCase().replace(/\s+/g, '-'),
      //   };

      //   saveNewSampleRecord(newSample.name, newSample.sample_file, newSample.sample_settings)
      //     .then((savedSample) => {
      //       setSampleRecords((prev) =>
      //         prev.map((s) => (s.id === id ? savedSample : s))
      //       );
      //       unsavedSampleIds.current.delete(id);
      //       router.replace(`?samples=${savedSample.slug}`);
      //     })
      //     .catch((error) => console.error('Error saving sample:', error));
      // } else {
      updateSampleRecord(id, { ...sample })
        .then(() => {
          unsavedSampleIds.current.delete(id);
        })
        .catch((error) => console.error('Error saving sample:', error));
      // }
    });
    // unsavedSampleIds.current.clear(); // should not be necessary
  }

  async function updateSample(id: string) {
    const sample = sampleRecords.find((s) => s.id === id);
    if (!sample) return;
    await updateSampleRecord(id, { ...sample }).catch((error) =>
      console.error(`Error updating sample ${id} settings:`, error)
    );
  }

  async function deleteSample(id: string) {
    if (!(samplerEngine && audioCtx)) return;

    const name = sampleRecords.find((s) => s.id === id)?.name;

    const confirmDelete = confirm(`Delete ${name || 'this sample'}?`);
    if (!confirmDelete) return;

    await deleteSampleRecord(id).catch((error) =>
      console.error(`Error deleting sample ${id}:`, error)
    );
    samplerEngine.unloadSample(id);
    setSampleRecords((prev) => prev.filter((s) => s.id !== id));
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
    setSampleRecords((prev) =>
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

    const { savedSampleRecord: sample, buffer } =
      await samplerEngine.stopRecording();
    if (sample && buffer) {
      // samplerEngine.loadSample(sample, buffer);
      // unsavedSampleIds.current.add(sample.id);
      setSampleRecords((prev) => [...prev, sample]); // triggers loadSamples useEffect
      router.replace(`?samples=${sample.slug}`, { scroll: false }); // FIX: triggers loadSamples useEffect again ?
    }
  }, [samplerEngine, router, audioCtx]);

  const value = {
    samplerEngine,
    sampleRecords,
    sampleSwitchFlag,
    selectedSamples,
    latestSelectedSample,
    latestSelectedBuffer,
    isSampleLoaded,
    isSampleSelected,
    saveAll,
    updateSample,
    deleteSample,
    hasUnsavedSamples: unsavedSampleIds.current.size > 0,
    // handleLoopKeys,
    isLooping,
    toggleLoop,
    // handleHoldKey,
    isHolding,
    toggleHold,
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
