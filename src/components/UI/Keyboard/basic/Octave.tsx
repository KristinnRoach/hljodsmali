import React from 'react';
import Note from './PnoNote';
import { NoteType } from './note';

import styles from './pno.module.scss';

type Props = {
  notes: NoteType[];
  clickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const Octave: React.FC<Props> = ({ notes, clickHandler }) => (
  <div className={styles.wrapper}>
    {notes.map((element: any) => (
      <Note
        key={element.note}
        color={element.color}
        note={element.note}
        onClick={clickHandler}
      />
    ))}
  </div>
);

export default Octave;
