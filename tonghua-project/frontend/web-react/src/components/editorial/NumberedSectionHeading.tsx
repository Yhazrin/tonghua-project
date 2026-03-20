import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface NumberedSectionHeadingProps {
  number: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  immediate?: boolean;
  className?: string;
}

export default function NumberedSectionHeading({
  number,
  title,
  subtitle,
  centered = false,
  immediate = false,
  className = '',
}: NumberedSectionHeadingProps) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  const animateState = immediate ? true : isVisible;
  const wrapperAlign = centered ? 'text-center' : '';
  const numberAlign = centered ? 'flex items-center justify-center gap-3 mb-4' : 'flex items-baseline gap-3 mb-4';

  return (
    <div ref={ref} className={`mb-12 md:mb-16 ${wrapperAlign} ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: centered ? 0 : -20, y: centered ? 10 : 0 }}
        animate={animateState ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        className={numberAlign}
      >
        <span className="font-body text-caption text-sepia-mid tracking-[0.2em]">
          {number}
        </span>
        {!centered && <span className="flex-1 h-px bg-warm-gray/40" aria-hidden="true" />}
        {centered && <span className="w-16 h-px bg-warm-gray/40" aria-hidden="true" />}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={animateState ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        className={`font-display text-h2 md:text-h1 font-bold leading-[0.95] tracking-[-0.025em] text-ink ${centered ? 'mx-auto' : ''}`}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={animateState ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.25 }}
          className={`font-body text-sm md:text-base text-ink-faded mt-4 leading-relaxed ${centered ? 'mx-auto' : 'max-w-lg'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
