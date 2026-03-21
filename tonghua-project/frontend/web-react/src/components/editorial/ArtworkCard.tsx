import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ImageSkeleton from '@/components/editorial/ImageSkeleton';
import type { Artwork } from '@/types';

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
  className?: string;
}

export default function ArtworkCard({
  artwork,
  index = 0,
  className = '',
}: ArtworkCardProps) {
  const { t } = useTranslation();
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
      animate={prefersReducedMotion ? undefined : (isVisible ? { opacity: 1, y: 0 } : {})}
      transition={prefersReducedMotion ? { duration: 0 } : {
        duration: 0.7,
        ease: [0, 0, 0.2, 1],
        delay: index * 0.1,
      }}
      className={`group relative ${className}`}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rust/30 z-20" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rust/30 z-20" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rust/30 z-20" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rust/30 z-20" aria-hidden="true" />

      <Link to={`/artworks/${artwork.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden border-2 border-rust/30 bg-aged-stock mb-4">
          {/* Grain overlay */}
          <div
            className="absolute inset-0 z-10 pointer-events-none opacity-10"
            aria-hidden="true"
            style={{
              backgroundImage: 'var(--grain-overlay)'
            }}
          />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-pale-gold/5 via-transparent to-archive-brown/5" aria-hidden="true" />

          {/* Loading skeleton */}
          {!imageLoaded && <ImageSkeleton className="absolute inset-0" />}

          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className={`w-full h-full object-cover sepia-[0.08] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Info */}
        <div className="flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-base md:text-lg font-semibold text-ink truncate group-hover:text-rust transition-colors">
              {artwork.title}
            </h3>
            <p className="font-body text-xs text-sepia-mid mt-1">
              {t('artwork.card.age', { age: artwork.childParticipant.age })} &middot;{' '}
              {new Date(artwork.createdAt).getFullYear()}
            </p>
          </div>

          <span className="font-body text-xs text-sepia-mid whitespace-nowrap flex-shrink-0">
            {t('artwork.card.votes', { count: artwork.voteCount })}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
