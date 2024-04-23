import DropZone from '../components/DropZone/DropZone';
// import Sampler from '../components/Sampler/Sampler';
// import Shapes from '../components/Shapes/Shapes.jsx';
import KeyboardGUISpline from '../components/KeyboardGUI/KeyboardGUISpline';
import Auth from '../components/Login/Login';

import styles from '../styles/page.module.scss';

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <Auth />
        <DropZone />
        <KeyboardGUISpline />
      </main>
    </>
  );
}
