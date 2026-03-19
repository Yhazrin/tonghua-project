import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
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
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        ease: [0, 0, 0.2, 1],
        delay: index * 0.1,
      }}
      className={`group ${className}`}
    >
      <Link to={`/artworks/${artwork.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden border border-warm-gray/40 bg-aged-stock mb-4">
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-pale-gold/5 via-transparent to-archive-brown/5" />
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-base md:text-lg font-semibold text-ink truncate group-hover:text-rust transition-colors">
              {artwork.title}
            </h3>
            <p className="font-body text-xs text-sepia-mid mt-1">
              Age {artwork.childParticipant.age} &middot;{' '}
              {new Date(artwork.createdAt).getFullYear()}
            </p>
          </div>

          <span className="font-body text-xs text-sepia-mid whitespace-nowrap flex-shrink-0">
            {artwork.voteCount} votes
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
