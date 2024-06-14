import DropZone from '../components/DropZone/DropZone';
import KeyboardGUI from '../components/KeyboardGUI/KeyboardGUISpline';
import Auth from '../components/Auth/Auth';

import styles from '../styles/page.module.scss';
import React from 'react';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.top}>
          <Auth />
          <DropZone />
        </div>
        <div className={styles.keyboardBox}>
          <KeyboardGUI />
        </div>
      </main>
    </>
  );
}
