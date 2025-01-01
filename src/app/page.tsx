import React from 'react';

import Sampler_cli from '../components/Sampler/Sampler';

import styles from '../styles/page.module.scss';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div>
          <Sampler_cli />
        </div>
      </main>
    </>
  );
}
