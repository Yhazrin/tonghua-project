import { type ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface FlipPageTransitionProps {
  children: ReactNode;
}

const motionPageVariants = {
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

const reducedPageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export default function FlipPageTransition({ children }: FlipPageTransitionProps) {
  const location = useLocation();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const variants = useMemo(
    () => (prefersReducedMotion ? reducedPageVariants : motionPageVariants),
    [prefersReducedMotion]
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
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
