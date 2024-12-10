import React from 'react';

import Sampler_cli from '../components/Sampler/Sampler';
import Auth from '../components/Auth/Auth';

import styles from '../styles/page.module.scss';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.login}>
          <Auth />
        </div>
        <div className={styles.topBar}>
          <Sampler_cli />
        </div>
      </main>
    </>
  );
}
