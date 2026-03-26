import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SectionGrainOverlay from '@/components/editorial/SectionGrainOverlay';

/**
 * ScrollNarrative — A scroll-driven hero section that reveals the brand story
 * through layered parallax text and imagery, replacing a static hero banner.
 *
 * Design: 1990s editorial magazine aesthetic with sepia tones and grain overlay.
 */
export default function ScrollNarrative() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax layers
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const subtitleY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.3, 0.5, 0.8]);
  const scaleValue = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[120vh] flex items-center justify-center overflow-hidden bg-ink"
    >
      {/* Background image with parallax zoom */}
      <motion.div
        className="absolute inset-0 z-0"
        style={prefersReducedMotion ? {} : { scale: scaleValue }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/hero-children-art.jpg')`,
            filter: 'sepia(0.4) contrast(1.1) brightness(0.85)',
          }}
        />
      </motion.div>

      {/* Dark overlay for text readability */}
      <motion.div
        className="absolute inset-0 z-[1] bg-ink"
        style={{ opacity: prefersReducedMotion ? 0.5 : overlayOpacity }}
      />

      {/* Grain texture overlay */}
      <SectionGrainOverlay />

      {/* Content layers */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Overline */}
        <motion.p
          className="font-mono text-xs tracking-[0.35em] uppercase text-rust mb-6 opacity-80"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('home.hero.overline', 'Tonghua Public Welfare × Sustainable Fashion')}
        </motion.p>

        {/* Main title with parallax */}
        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-paper leading-[0.9] mb-8"
          style={prefersReducedMotion ? {} : { y: titleY }}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {t('home.hero.title', 'Where Children\'s Art Meets Sustainable Fashion')}
        </motion.h1>

        {/* Subtitle with slower parallax */}
        <motion.p
          className="font-mono text-base md:text-lg text-paper/70 max-w-2xl mx-auto leading-relaxed"
          style={prefersReducedMotion ? {} : { y: subtitleY }}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          {t(
            'home.hero.subtitle',
            'Transforming children\'s creative expressions into wearable art — every purchase supports mountain-area children and drives the circular fashion movement.'
          )}
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            className="w-px h-16 bg-paper/30 mx-auto"
            animate={prefersReducedMotion ? {} : { scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-paper/40 mt-3">
            {t('home.hero.scroll', 'Scroll to explore')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
