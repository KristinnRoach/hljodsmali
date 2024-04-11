import { useEffect, useRef, useState } from 'react';

import {
  createSample,
  fetchSamples,
  deleteSample,
  getPocketBase,
} from '../../db/db_samples';
import { fetchBlobFromUrl } from '../../utils/fetch';
import { Sample } from '../../types';
import styles from './Samples.module.scss';

interface SamplesProps {
  currentSampleUrl: string;
  currentSampleBlob: Blob;
  chooseSample: (audioUrl: string) => void;
}

const Samples: React.FC<SamplesProps> = ({
  currentSampleUrl,
  currentSampleBlob,
  chooseSample,
}) => {
  const pocketBase = getPocketBase();

  const [userSamples, setUserSamples] = useState<Sample[]>([]);

  async function loadUserSamples() {
    const sampleObjArray = await fetchSamples();
    setUserSamples(sampleObjArray);
  }

  const [showSampleList, setShowSampleList] = useState<boolean>(false);

  const toggleShowSamples = (): void => {
    loadUserSamples();
    setShowSampleList((prevShowSampleList) => !prevShowSampleList);
  };

  const handleSave = async (): Promise<void> => {
    const name = prompt('Enter a name for the sample:');
    if (name !== null && name.trim() !== '') {
      if (currentSampleBlob) {
        await createSample(name, currentSampleBlob);
      } else if (currentSampleUrl) {
        const newBlob = await fetchBlobFromUrl(currentSampleUrl);
        await createSample(name, newBlob);
      }
      await loadUserSamples();
    } else {
      console.error('Invalid name or cancelled.');
      alert('Invalid name or cancelled.');
    }
  };

  const confirmDelete = (sample: Sample) => {
    const isConfirmed = window.confirm('Delete this sample?');
    if (isConfirmed) {
      handleDelete(sample);
    }
  };

  async function handleDelete(sample: Sample): Promise<void> {
    if (sample.id) {
      try {
        await deleteSample(sample.id);
        await loadUserSamples();
      } catch {
        console.error('Delete sample failed');
        alert('Delete sample failed');
      }
    }
  }

  const downloadAudio = () => {
    // nota pocketbase frekar
    if (currentSampleUrl) {
      const link = document.createElement('a');
      link.href = currentSampleUrl;
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
          className={`${styles.samplesList} ${
            showSampleList ? styles.visible : ''
          }`}
        >
          {userSamples.map((sample, index) => (
            <li key={index}>
              <button
                onClick={() => chooseSample(sample.audioUrl!)}
                className={styles.singleSample}
                data-src={sample.audioUrl}
              >
                {sample.name}
              </button>

              <audio src={sample.audioUrl}></audio>

              <button
                onClick={() => confirmDelete(sample)}
                id={sample.id}
                className={styles.deleteButton}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Samples;
