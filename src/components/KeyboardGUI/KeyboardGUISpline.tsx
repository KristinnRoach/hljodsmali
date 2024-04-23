/* eslint-disable @next/next/no-sync-scripts */
'use client';

import Spline from '@splinetool/react-spline';

import { keyMap } from '../../utils/keymap';
import styles from './KeyboardGUI.module.scss';

export default function KeyboardGUISpline() {
  return (
    <>
      <Spline
        // className={styles.container}
        scene="https://prod.spline.design/6LVJIfCH1KYHCxND/scene.splinecode"
      />

      {/* <script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.1.2/build/spline-viewer.js"
      ></script>

      <spline-viewer
        //className={styles.container}
        loading-anim-type="spinner-small-light"
        url="https://prod.spline.design/6LVJIfCH1KYHCxND/scene.splinecode"
      ></spline-viewer> */}
    </>
  );
}
