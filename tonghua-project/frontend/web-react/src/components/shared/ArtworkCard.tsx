import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SepiaImage from '@/components/ui/SepiaImage';
import type { Artwork } from '@/types';

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
}

export default function ArtworkCard({ artwork, index = 0 }: ArtworkCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative">
        <SepiaImage
          src={artwork.imageUrl}
          alt={artwork.title}
          aspectRatio="3/4"
          className="w-full"
        />
        <div className="absolute top-3 left-3">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase bg-paper/90 text-ink-faded px-2 py-1">
            {artwork.status === 'featured' ? 'Featured' : 'Gallery'}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-lg md:text-xl text-ink group-hover:text-rust transition-colors">
          <Link to={`/artworks/${artwork.id}`}>{artwork.title}</Link>
        </h3>
        <p className="font-body text-xs text-sepia-mid mt-1">
          Age {artwork.childParticipant.age} &middot; {artwork.voteCount} votes
        </p>
        <div className="flex gap-2 mt-2">
          {artwork.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-body text-[10px] tracking-wider uppercase text-ink-faded bg-warm-gray/30 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
