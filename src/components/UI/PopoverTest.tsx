'use client';
import useClickOutside from '../../hooks/useClickOutside';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';
import { useRef, useState, useEffect, useId } from 'react';

const TRANSITION = {
  type: 'spring',
  bounce: 0.05,
  duration: 0.3,
};

interface PopoverProps {
  children: React.ReactNode;
  label?: string;
}

export default function Popover({ children, label = '' }: PopoverProps) {
  const uniqueId = useId();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState<null | string>(null);

  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setNote(null);
  };

  useClickOutside(formContainerRef, () => {
    closeMenu();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <MotionConfig transition={TRANSITION}>
      <div className='relative flex items-center justify-center'>
        <motion.button
          key='button'
          layoutId={`popover-${uniqueId}`}
          className='flex h-9 items-center border border-zinc-950/10 bg-white px-3 text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50'
          style={{
            borderRadius: 8,
          }}
          onClick={openMenu}
        >
          <motion.span
            layoutId={`popover-label-${uniqueId}`}
            className='text-sm'
          >
            {label}
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={formContainerRef}
              layoutId={`popover-${uniqueId}`}
              className='absolute h-[200px] w-[364px] overflow-hidden border border-zinc-950/10 bg-white outline-none dark:bg-zinc-700'
              style={{
                borderRadius: 12,
              }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
