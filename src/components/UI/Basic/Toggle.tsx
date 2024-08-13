// src/components/UI/Basic/Toggle.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../../styles/Toggle.module.scss';

type ToggleProps = {
  isOn: boolean;
  onToggle: () => void;
  label: string;
  type?: 'default' | 'menu' | 'record' | 'loop' | 'hold' | 'lock' | 'link';
  children?: React.ReactNode;
};

const Toggle: React.FC<ToggleProps> = ({
  isOn,
  onToggle,
  label,
  type = 'default',
  children,
}) => {
  return (
    <button
      className={`${styles.toggleButton} ${styles[type]} ${
        isOn ? styles.on : styles.off
      }`}
      onClick={onToggle}
    >
      {label && label}
      {children}
    </button>
  );
};

export default Toggle;

type ToggleMultiStateProps = {
  currentState: string;
  states: string[];
  onToggle: (newState: string) => void;
  label: string;
  type?: 'arm' | 'recordArm'; // add more types as needed
};

export const ToggleMultiState: React.FC<ToggleMultiStateProps> = ({
  currentState,
  states,
  onToggle,
  label,
  type = 'arm',
}) => {
  const handleToggle = () => {
    const currentIndex = states.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    onToggle(states[nextIndex]);
  };

  return (
    <button
      className={`${styles.toggleMulti} ${styles[type]} ${styles[currentState]}`}
      onClick={handleToggle}
    >
      {label}
    </button>
  );
};

type ToggleMenuProps = {
  label: string;
  children: React.ReactNode;
};

export const ToggleMenu: React.FC<ToggleMenuProps> = ({ label, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <Toggle
        isOn={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        label={label}
        type='menu'
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// type MenuToggleProps = {
//   label: string;
//   children: React.ReactNode;
// };

// export const MenuToggle: React.FC<MenuToggleProps> = ({ label, children }) => {
//   const [isOpen, setIsOpen] = React.useState(false);

//   return (
//     <>
//       <Toggle
//         isOn={isOpen}
//         onToggle={() => setIsOpen(!isOpen)}
//         label={label}
//         type='menu'
//       />
//       <div
//         className={`${styles.dropdown_content} ${isOpen ? styles.open : ''}`}
//       >
//         {children}
//       </div>
//     </>
//   );
// };
