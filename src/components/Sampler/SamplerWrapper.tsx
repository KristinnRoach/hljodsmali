import React from 'react';

import SampleSelector from './SampleSelector';
// import SampleSlicer from '../components/Sampler/SampleSlicer';
import Recorder from './Recorder';
import SamplePlayer from './SamplePlayer';

// import { handleDrop, handleDragOver } from '../../utils/dragNdrop';

//import styles from '../../styles/page.module.scss';

function SamplerWrapper() {
  return (
    <div>
      {/* onDragOver={handleDragOver} onDrop={handleDrop} className={''} */}
      <SamplePlayer />
      <Recorder />
      {/* <SampleSlicer /> */}
      {/* <SampleSelector /> */}
    </div>
  );
}

export default SamplerWrapper;
