import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface FlipPageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    rotateY: -3,
    transformPerspective: 1200,
    x: -20,
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    rotateY: 3,
    x: 20,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function FlipPageTransition({ children }: FlipPageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          transformOrigin: 'left center',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
