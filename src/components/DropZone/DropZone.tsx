'use client';
import React, { useContext, useState } from 'react';

//import Samples from '../Samples/Samples';
import Recorder from '../Sampler/Recorder';
import SamplePlayer from '../Sampler/SamplePlayer';
// import SampleSlicer from '../Sampler/SampleSlicer';

import { handleDrop, handleDragOver } from '../../utils/dragNdrop';

import styles from '../../styles/page.module.scss';

export default function DropZone() {
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={styles.samplerBox}
    >
      <SamplePlayer />
      <Recorder />
      {/* <SampleSlicer /> */}
      {/* <Samples /> */}
    </div>
  );
}
