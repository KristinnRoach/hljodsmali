import styles from '../styles/page.module.scss';
import Sampler from '../components/Sampler/Sampler';
import Nav from '../components/Nav/Nav';
import Shapes from '../components/Shapes/Shapes.jsx';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.controls}>
          <Sampler />
        </div>
        <div className={styles.animation}>
          <Shapes />
        </div>
      </main>
    </>
  );
}
