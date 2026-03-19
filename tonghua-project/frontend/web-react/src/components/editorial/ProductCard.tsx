import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export default function ProductCard({
  product,
  index = 0,
  className = '',
}: ProductCardProps) {
  const { t } = useTranslation();
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
      <Link to={`/shop/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden border border-warm-gray/40 bg-aged-stock mb-4">
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-pale-gold/5 via-transparent to-archive-brown/5" />
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
            loading="lazy"
          />

          {/* Stock badge */}
          {!product.inStock && (
            <div className="absolute top-3 right-3 z-20 bg-ink/80 text-paper font-body text-caption px-3 py-1 tracking-wider">
              {t('shop.card.soldOut')}
            </div>
          )}

          {product.inStock && product.stockCount <= 5 && (
            <div className="absolute top-3 right-3 z-20 bg-rust/90 text-paper font-body text-caption px-3 py-1 tracking-wider">
              {t('shop.card.lowStock', { count: product.stockCount })}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="font-display text-base md:text-lg font-semibold text-ink group-hover:text-rust transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-body text-sm text-ink font-medium">
              {product.currency === 'CNY' ? '¥' : '$'}
              {product.price.toLocaleString()}
            </span>
            <span className="font-body text-xs text-sepia-mid capitalize">
              {product.category}
            </span>
          </div>

          {/* Sustainability score */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-warm-gray/30" />
            <span className="font-body text-[10px] text-sepia-mid tracking-wider uppercase">
              Sustainability: {product.sustainabilityScore}/100
            </span>
            <div className="flex-1 h-px bg-warm-gray/30" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
