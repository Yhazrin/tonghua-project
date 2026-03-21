import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0, 0, 0.2, 1] }}
      className={`relative z-[1] ${className}`}
    >
      {children}
    </motion.div>
  );
}
