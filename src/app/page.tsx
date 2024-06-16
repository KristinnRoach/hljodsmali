import React from 'react';

import DropZone from '../components/DropZone/DropZone';
import KeyboardGUI from '../components/KeyboardGUI/KeyboardGUISpline';
import ControlsUI from '../components/Sampler/ControlsUI';
import Auth from '../components/Auth/Auth';

import styles from '../styles/page.module.scss';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.top}>
          <Auth />
          <DropZone />
        </div>
        <ControlsUI />
        <div className={styles.keyboardBox}>
          <KeyboardGUI />
        </div>
      </main>
    </>
  );
}
