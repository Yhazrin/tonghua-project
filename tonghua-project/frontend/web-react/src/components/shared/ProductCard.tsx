import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SepiaImage from '@/components/ui/SepiaImage';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/shop/${product.id}`} className="block">
        <div className="relative">
          <SepiaImage
            src={product.imageUrls[0]}
            alt={product.name}
            aspectRatio="4/5"
            className="w-full"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-paper border border-paper px-4 py-2">
                {t('shop.card.soldOut')}
              </span>
            </div>
          )}
          {product.inStock && product.stockCount <= 5 && (
            <div className="absolute top-3 left-3">
              <span className="font-body text-[10px] tracking-wider uppercase bg-rust text-paper px-2 py-1">
                {t('shop.card.lowStock', { count: product.stockCount })}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="font-display text-lg text-ink group-hover:text-rust transition-colors">
            {product.name}
          </h3>
          <p className="font-body text-xs text-sepia-mid mt-1">
            {product.currency} {product.price.toFixed(2)}
          </p>
          {product.sustainabilityScore > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= product.sustainabilityScore / 20
                        ? 'bg-archive-brown'
                        : 'bg-warm-gray/40'
                    }`}
                  />
                ))}
              </div>
              <span className="font-body text-[10px] text-sepia-mid ml-1">
                Sustainability
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
