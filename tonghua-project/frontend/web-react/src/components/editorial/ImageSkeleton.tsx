import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const GRAIN_STYLE: React.CSSProperties = { backgroundImage: 'var(--grain-overlay)' };

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: string;
}

export default function ImageSkeleton({
  className = '',
  aspectRatio = 'aspect-square',
}: ImageSkeletonProps) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div
      className={`relative overflow-hidden bg-aged-stock ${aspectRatio} ${className}`}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-10"
        aria-hidden="true"
        style={GRAIN_STYLE}
      />

      {/* Animated shimmer effect */}
      {prefersReducedMotion ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      ) : (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Placeholder icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-warm-gray/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}
