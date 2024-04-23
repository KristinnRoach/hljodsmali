import { useEffect, useRef, useState } from 'react';

import {
  createSampleRecord,
  fetchSamples,
  deleteSample,
  getPocketBase,
} from '../../db/samplesPb';
import { fetchBlobFromUrl } from '../../utils/fetch';
import { Sample } from '../../types';
import styles from './Samples.module.scss';

interface SamplesProps {
  currentSampleUrl: string;
  handleChooseSample: (audioUrl: string) => void;
}

const Samples: React.FC<SamplesProps> = ({
  currentSampleUrl,
  handleChooseSample,
}) => {
  const pocketBase = getPocketBase();

  const [currentSampleSrc, setCurrentSampleSrc] = useState<string>('');
  const [userSamples, setUserSamples] = useState<Sample[]>([]);
  const [showSampleList, setShowSampleList] = useState<boolean>(false);

  async function loadUserSamples() {
    const sampleObjArray = await fetchSamples();
    setUserSamples(sampleObjArray);
  }

  useEffect(() => {
    setCurrentSampleSrc(currentSampleUrl); // Set currentSampleSrc whenever currentSampleUrl changes
    console.log('currentSampleUrl: ', currentSampleUrl);
  }, [currentSampleUrl]);

  const toggleShowSamples = async (): Promise<void> => {
    setShowSampleList((prevShowSampleList) => !prevShowSampleList);
    if (!showSampleList) {
      await loadUserSamples();
    }
  };

  const handleSave = async (): Promise<void> => {
    const name = prompt('Enter a name for the sample:');
    if (name !== null && name.trim() !== '') {
      if (currentSampleUrl) {
        // currentSampleUrl ?
        const newBlob = await fetchBlobFromUrl(currentSampleUrl);
        await createSampleRecord(name, newBlob);
      } else {
        console.error('No sample to save.');
        alert('No sample to save.');
      }
      await loadUserSamples();
    } else {
      console.error('Invalid name or cancelled.');
      alert('Invalid name or cancelled.');
    }
  };

  const handleDelete = async (sample: Sample): Promise<void> => {
    const isConfirmed = window.confirm('Delete this sample?'); // create custom
    if (isConfirmed && sample.id) {
      try {
        await deleteSample(sample.id);
        await loadUserSamples();
      } catch {
        console.error('Delete sample failed');
        alert('Delete sample failed');
      }
    }
  };

  const downloadAudio = () => {
    // nota pocketbase frekar
    if (currentSampleSrc) {
      const link = document.createElement('a');
      link.href = currentSampleSrc;
      link.download = 'sample-hljodsmali.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.controlsBox}>
        <button onClick={handleSave}>&#x1F4BE;</button>
        <button className={styles.downloadButton} onClick={downloadAudio}>
          &#x2B07;
        </button>
        <button onClick={toggleShowSamples}>🎵</button>
      </div>
      {showSampleList && (
        <ul
          className={`${styles.samplesList} 
          ${showSampleList ? styles.visible : ''}
          `}
        >
          {userSamples.map(
            (
              sample,
              index // use index?
            ) => (
              <li key={sample.id}>
                <button
                  onClick={() => handleChooseSample(sample.audioUrl!)}
                  className={styles.singleSample}
                  data-src={sample.audioUrl}
                >
                  {sample.name}
                </button>

                {/* <audio src={sample.audioUrl}></audio> */}

                <button
                  onClick={() => handleDelete(sample)}
                  id={sample.id}
                  className={styles.deleteButton}
                >
                  x
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default Samples;
