// src/components/Sampler/Library_SSR.tsx

'use client';

import React from 'react';
import LinkList from '../UI/LinkList';
import { useSamplerCtx } from '../../contexts/sampler-context';

// async
function Library_cli() {
  const { allSamples, isLoading } = useSamplerCtx();

  if (isLoading) {
    return <div>Loading samples...</div>;
  }

  return (
    <div>
      {allSamples.length > 0 && (
        <LinkList items={allSamples} title='Samples' paramName='samples' />
      )}
    </div>
  );
}

export default Library_cli;

// 'use server';

// import React from 'react';

// import { fetchSampleAudio, fetchSamples } from '../../app/server-actions';
// import LinkList_CSR from '../UI/LinkList_CSR';

// import { Sample } from '../../types';

// async function Library_SSR() {
//   const samples: Sample[] = await fetchSamples();

//   return (
//     <div>
//       {samples.length > 0 && (
//         <LinkList_CSR items={samples} title='Samples' paramName='sample' />
//       )}
//     </div>
//   );
// }

// export default Library_SSR;
