import Image from 'next/image';
import styles from '../styles/page.module.scss';

import SamplerComp from '../components/SamplerComp/SamplerComp';
import Nav from '../components/Nav/Nav';
import Shapes from '../components/Shapes/Shapes.jsx';

export default function Home() {
  return (
    <>
      {/* <div className={styles.top}>
        <Nav />
      </div> */}
      <main className={styles.main}>
        <div className={styles.controls}>
          <SamplerComp />
        </div>
        <div className={styles.animation}>
          <Shapes />
        </div>
      </main>
    </>
  );
}
