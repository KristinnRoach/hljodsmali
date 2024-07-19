import React from 'react';

import styles from './pno.module.scss';

type Props = {
  color: string;
  note: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const Note: React.FC<Props> = ({ color, note, onClick }) =>
  color === 'white' ? (
    <button value={note} onClick={onClick} className={styles.whiteNote} />
  ) : (
    <button value={note} onClick={onClick} className={styles.blackNote} />
  );

export default Note;
