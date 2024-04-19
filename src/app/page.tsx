import DropZone from '../components/DropZone/DropZone';
import Sampler from '../components/Sampler/Sampler';
import Shapes from '../components/Shapes/Shapes.jsx';
import KeyboardGUI from '../components/KeyboardGUI/KeyboardGUI';
import Login from '../components/Login/Login';

import styles from '../styles/page.module.scss';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <DropZone>
          {/* <Login /> */}
          <Sampler />
          <KeyboardGUI />
          {/* <Shapes /> */}
        </DropZone>
      </main>
    </>
  );
}
