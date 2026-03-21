import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin editorial reading progress bar fixed at the top of the viewport.
 * Uses rust accent color, matches the 1990s print-magazine aesthetic.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-rust origin-left z-overlay pointer-events-none"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
