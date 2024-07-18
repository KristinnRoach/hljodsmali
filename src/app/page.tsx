import React from 'react';
// import 'server-only';

import Sampler_cli from '../components/Sampler/Sampler';
import KeyboardGUI from '../components/UI/KeyboardGUI/KeyboardGUISpline';
import Auth from '../components/Auth/Auth';

import styles from '../styles/page.module.scss';

export default function Home() {
  // async?
  return (
    <>
      <main className={styles.main}>
        {/* <div className={styles.top}> */}
        <Auth />
        <Sampler_cli />
        {/* </div> */}
        <div className={styles.keyboardBox}>
          <KeyboardGUI />
        </div>
      </main>
    </>
  );
}

/* Refactor only if i want elements to be re-usable: 
1. Utility functions => ts files (lib/utils)
2. Reusable markup => separate components (tsx)
3. Logic with react hooks => custom hooks (ts)
4. state accessible everywhere => context (tsx)
/* TODO: REFACTOR TO MAKE COMPONENTS SERVER SIDE WHEN POSSIBLE */
/* TODO: DRAG N DROP COULD BE IN A CONTEXT */
