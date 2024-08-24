import React from 'react';
// import 'server-only';

import Sampler from '../components/Sampler/Sampler';

import styles from '../styles/page.module.scss';

export default function Home() {
  return (
    <main className={styles.main}>
      <Sampler />
    </main>
  );
}
