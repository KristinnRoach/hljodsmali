import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from './Toggle';

type MenuToggleProps = {
  label: string;
  children: React.ReactNode;
};

const MenuToggle: React.FC<MenuToggleProps> = ({ label, children }) => {
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

export default MenuToggle;
