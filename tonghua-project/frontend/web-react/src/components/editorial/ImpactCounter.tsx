import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ImpactCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

function AnimatedNumber({
  value,
  duration = 2000,
  reducedMotion = false,
}: {
  value: number;
  duration: number;
  reducedMotion?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    if (reducedMotion) {
      setDisplayValue(value);
      if (spanRef.current) {
        spanRef.current.textContent = value.toLocaleString();
      }
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(eased * value);
      const formatted = currentValue.toLocaleString();

      // Update DOM directly to avoid ~120 unnecessary re-renders
      if (spanRef.current) {
        spanRef.current.textContent = formatted;
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Ensure React state is consistent at animation end
        setDisplayValue(currentValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration, reducedMotion]);

  return <span ref={ref}><span ref={spanRef}>{displayValue.toLocaleString()}</span></span>;
}

export default function ImpactCounter({
  value,
  label,
  prefix = '',
  suffix = '',
  duration = 2000,
  className = '',
}: ImpactCounterProps) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <motion.div
      role="status"
      aria-label={`${prefix}${value.toLocaleString()}${suffix} ${label}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={prefersReducedMotion ? undefined : { once: true, margin: '-80px' }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0, 0, 0.2, 1] }}
      className={`text-center ${className}`}
    >
      <div className="font-display text-5xl md:text-6xl font-bold text-ink leading-none tracking-tight">
        {prefix}
        <AnimatedNumber value={value} duration={duration} reducedMotion={prefersReducedMotion} />
        {suffix}
      </div>
      <div className="font-body text-caption text-sepia-mid tracking-[0.15em] uppercase mt-3">
        {label}
      </div>
    </motion.div>
  );
}
