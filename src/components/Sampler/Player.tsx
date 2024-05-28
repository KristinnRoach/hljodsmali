'use client';

import { useEffect, useRef, useState } from 'react';

import ConditionClassButton from '../Button/ConditionClassButton';
import { Sample, Voice, KeyMap } from '../../types';
import { keyMap } from '../../utils/keymap';
import Samples from '../Samples/Samples';
import styles from './Sampler.module.scss';


const Player: React.FC<{
    voice: Voice | undefined,
    createNextVoice: () => void
  }> = ({ voice, createNextVoice }) => {

    
  
    const keysPressedRef = useRef<string[]>([]);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      const note: number | undefined = keyMap[key];
  
      if (!keysPressedRef.current.includes(key) && note) {
        // for avoiding retriggers
        keysPressedRef.current.push(key);
        playSample(note);
      }
    };
  
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.code;
      const note = keyMap[key];
      keysPressedRef.current = keysPressedRef.current.filter((k) => k !== key);
    };
  
  
    const playSample = (note: number) => {
      // const voice = latestVoice();
      console.log('enter playSample, note: ', note, ' voice: ', voice);

      if (voice && voice.audioEl) {

        console.log('src: ', voice.audioEl.src)

        voice.audioEl.playbackRate = 2 ** ((note - 60) / 12);
        voice.audioEl.play();
        createNextVoice();
      } else {
        console.error('latestVoice not found');
      }
    };
  
    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
  
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  

return (<></>);};

export default Player;


