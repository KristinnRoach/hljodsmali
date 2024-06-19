'use client';

import React, { useEffect, useState } from 'react';

import { useMediaSourceCtx } from '../../contexts/media-source-context';
import {
  createSampleRecord,
  fetchUserSamples,
  deleteSample,
} from '../../lib/db';
import { Sample } from '../../types';
import { useSearchParams } from 'next/navigation';

import styles from './Samples.module.scss';
import Link from 'next/link';

function SampleSelector() {
  const { theSample, setNewAudioSrc } = useMediaSourceCtx();
  const searchParams = useSearchParams();
  // const sampleId = searchParams.get('sample-id');

  const [userSamples, setUserSamples] = useState<Sample[]>([]);
  const [showList, setShowList] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  useEffect(() => {
    // useOptimistic ?
    loadUserSamples();
    console.log('loadUserSamples: ', userSamples);
  }, [hasChanged]);

  async function loadUserSamples() {
    const sampleObjArray = await fetchUserSamples();
    setUserSamples(sampleObjArray);
  }

  function toggleList(): boolean {
    setShowList((prev) => !prev);
    return showList;
  }

  function onSelectSample(sample: Sample) {
    setNewAudioSrc(sample);
  }

  return;
  // (
  //   <ul className={''}>
  //     {userSamples.map((sample) => {
  //       return (
  //         <li key={sample.id}>
  //           <Link
  //             href={`/sampler?sample-id=${sample.name}`}
  //             replace
  //             scroll={false}
  //             shallow={true}
  //             legacyBehavior
  //           >
  //             <a
  //               onClick={() => {
  //                 onSelectSample(sample);
  //               }}
  //             >
  //               {sample.name}
  //             </a>
  //           </Link>
  //           <button
  //             onClick={() => {
  //               deleteSample(sample.id);
  //               setHasChanged((prev) => !prev);
  //             }}
  //           >
  //             Delete
  //           </button>
  //         </li>
  //       );
  //     })}
  //   </ul>
  // );
}

export default SampleSelector;
