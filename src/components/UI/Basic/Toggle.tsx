import React from 'react';
import styles from './Toggle.module.scss';

type ToggleProps = {
  isOn: boolean;
  onToggle: () => void;
  label: string;
  type?: 'default' | 'menu' | 'record' | 'loop' | 'hold' | 'lock' | 'link';
};

const Toggle: React.FC<ToggleProps> = ({
  isOn,
  onToggle,
  label,
  type = 'default',
}) => {
  return (
    <button
      className={`${styles.toggleButton} ${styles[type]} ${
        isOn ? styles.on : styles.off
      }`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
};

export default Toggle;

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
