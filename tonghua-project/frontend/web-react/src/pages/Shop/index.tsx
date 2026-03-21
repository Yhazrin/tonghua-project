import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionContainer from '@/components/layout/SectionContainer';
import EditorialHero from '@/components/editorial/EditorialHero';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import ProductCard from '@/components/editorial/ProductCard';
import SepiaImageFrame from '@/components/editorial/SepiaImageFrame';
import StoryQuoteBlock from '@/components/editorial/StoryQuoteBlock';
import { ScrollPathDrawInline } from '@/components/animations/ScrollPathDraw';
import VintageSelect from '@/components/editorial/VintageSelect';
import { productsApi } from '@/services/products';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Product } from '@/types';

type Category = 'all' | 'apparel' | 'accessories' | 'stationery' | 'prints';
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'sustainability';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Dreamscape Tee',
    description: 'A children\'s ocean painting transformed into a wearable story.',
    price: 298,
    currency: 'CNY',
    imageUrls: ['https://picsum.photos/seed/dreamscape-tee/600/800'],
    category: 'apparel',
    inStock: true,
    stockCount: 24,
    sustainabilityScore: 87,
    supplyChain: [],
    artworkBy: { childName: 'Xiao Lin', age: 8, campaign: 'Ocean Dreams' },
  },
  {
    id: '2',
    name: 'Bloom Tote Bag',
    description: 'Hand-printed organic cotton tote featuring spring campaign artwork.',
    price: 168,
    currency: 'CNY',
    imageUrls: ['https://picsum.photos/seed/bloom-tote/600/800'],
    category: 'accessories',
    inStock: true,
    stockCount: 3,
    sustainabilityScore: 92,
    supplyChain: [],
    artworkBy: { childName: 'Mei Hua', age: 7, campaign: 'Spring Garden' },
  },
  {
    id: '3',
    name: 'Little Artists Sketchbook',
    description: 'Recycled paper sketchbook with cover art from our winter campaign.',
    price: 58,
    currency: 'CNY',
    imageUrls: ['https://picsum.photos/seed/sketchbook/600/800'],
    category: 'stationery',
    inStock: true,
    stockCount: 156,
    sustainabilityScore: 95,
    supplyChain: [],
    artworkBy: { childName: 'Tong Tong', age: 6, campaign: 'Winter Wonders' },
  },
  {
    id: '4',
    name: 'Ocean Dreams Art Print',
    description: 'Museum-quality giclee print on archival paper.',
    price: 128,
    currency: 'CNY',
    imageUrls: ['https://picsum.photos/seed/ocean-print/600/800'],
    category: 'prints',
    inStock: true,
    stockCount: 42,
    sustainabilityScore: 88,
    supplyChain: [],
    artworkBy: { childName: 'Xiao Yu', age: 9, campaign: 'Ocean Dreams' },
  },
  {
    id: '5',
    name: 'Cityscape Hoodie',
    description: 'Organic cotton hoodie with embroidered children\'s city drawings.',
    price: 458,
    currency: 'CNY',
    imageUrls: ['https://picsum.photos/seed/cityscape-hoodie/600/800'],
    category: 'apparel',
    inStock: false,
    stockCount: 0,
    sustainabilityScore: 84,
    supplyChain: [],
    artworkBy: { childName: 'Jia Wei', age: 10, campaign: 'My City' },
  },
  {
    id: '6',
    name: 'Rainbow Pin Set',
    description: 'Enamel pin set featuring five winning artworks from 2025.',
    price: 48,
    currency: 'CNY',
    imageUrls: ['https://picsum.photos/seed/rainbow-pins/600/800'],
    category: 'accessories',
    inStock: true,
    stockCount: 89,
    sustainabilityScore: 90,
    supplyChain: [],
    artworkBy: { childName: 'An Qi', age: 8, campaign: 'Colors of Hope' },
  },
];

export default function Shop() {
  const { t } = useTranslation();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const sustainabilityRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { category: activeCategory }],
    queryFn: async () => {
      try {
        const result = await productsApi.getAll({
          category: activeCategory === 'all' ? undefined : activeCategory,
        });
        return result;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] = ['all', 'apparel', 'accessories', 'stationery', 'prints'];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: t('shop.sort.default') },
    { value: 'price-asc', label: t('shop.sort.priceAsc') },
    { value: 'price-desc', label: t('shop.sort.priceDesc') },
    { value: 'sustainability', label: t('shop.sort.sustainability') },
  ];

  const filtered = useMemo(() => {
    let list = data?.items ?? MOCK_PRODUCTS;

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'sustainability':
        return [...list].sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
      default:
        return list;
    }
  }, [data, activeCategory, sortBy]);

  return (
    <PageWrapper>
      <EditorialHero
        title={t('shop.hero.title')}
        subtitle={t('shop.hero.subtitle')}
        hideHero={true}
      />

      <SectionContainer noTopSpacing>
        {/* Grain overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'var(--grain-overlay)' }}
          aria-hidden="true"
        />

        <NumberedSectionHeading number="01" title={t('shop.collection')} />

        {/* Filters and sort row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          {/* Category filter */}
          <div className="flex items-center gap-1 border-b border-warm-gray/30 overflow-x-auto flex-1">
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05 }}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                className={`
                  font-body text-xs tracking-[0.15em] uppercase px-4 py-3 transition-all duration-200 border-b-2 -mb-px whitespace-nowrap relative cursor-pointer
                  ${activeCategory === cat
                    ? 'border-rust text-rust'
                    : 'border-transparent text-sepia-mid hover:text-ink'
                  }
                `}
              >
                {t(`shop.filters.${cat}`)}
                {activeCategory === cat && (
                  <motion.span
                    layoutId={prefersReducedMotion ? undefined : "category-indicator"}
                    className="absolute bottom-0 left-0 right-0 h-px bg-rust"
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <VintageSelect
              label={t('shop.sort.label')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              options={sortOptions}
              className="w-auto"
            />
          </div>
        </div>

        {/* Results count */}
        <p className="font-body text-caption text-sepia-mid mb-8 tracking-wider">
          {t('shop.results', { count: filtered.length })}
        </p>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className={`aspect-[3/4] bg-aged-stock ${prefersReducedMotion ? '' : 'animate-pulse'} border border-warm-gray/30`} />
                <div className={`h-4 bg-aged-stock ${prefersReducedMotion ? '' : 'animate-pulse'} w-3/4`} />
                <div className={`h-3 bg-aged-stock ${prefersReducedMotion ? '' : 'animate-pulse'} w-1/2`} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20" role="alert" aria-live="assertive">
            <p className="font-body text-sm text-rust">{t('common.error')}</p>
            <p className="font-body text-xs text-sepia-mid mt-2">{t('common.retry')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-body text-sm text-sepia-mid py-20 text-center">
            {t('shop.empty')}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${sortBy}`}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-14"
            >
              {filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </SectionContainer>

      {/* Sustainability note */}
      <SectionContainer>
        <div ref={sustainabilityRef} className="border-t border-warm-gray/30 pt-12 mt-8 relative">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-rust/30 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-rust/30 pointer-events-none" aria-hidden="true" />

          {/* Scroll path connector */}
          <ScrollPathDrawInline
            path="M 0 20 C 30 0, 60 40, 90 20 S 150 60, 180 30"
            strokeColor="var(--color-pale-gold)"
            strokeWidth={1}
            className="absolute left-0 top-1/2 h-20 w-full pointer-events-none opacity-15"
            containerRef={sustainabilityRef}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { key: 'materials', titleKey: 'shop.sustainability.materials', descKey: 'shop.sustainability.materialsDesc' },
              { key: 'production', titleKey: 'shop.sustainability.production', descKey: 'shop.sustainability.productionDesc' },
              { key: 'carbon', titleKey: 'shop.sustainability.carbon', descKey: 'shop.sustainability.carbonDesc' },
            ].map((item, i) => (
              <motion.div
                key={item.key}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={prefersReducedMotion ? undefined : { once: true }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 * (i + 1) }}
              >
                <span className="font-body text-overline tracking-[0.2em] uppercase text-sepia-mid">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h4 className="font-display text-lg font-bold text-ink mt-2 mb-2">
                  {t(item.titleKey)}
                </h4>
                <p className="font-body text-xs text-ink-faded leading-relaxed">
                  {t(item.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Behind the Collection */}
      <SectionContainer>
        <NumberedSectionHeading number="02" title={t('shop.behind.title')} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mt-10">
          {/* Left: Workshop image — 8/12 columns */}
          <motion.div
            className="md:col-span-8"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0, 0, 0.2, 1] }}
          >
            <SepiaImageFrame
              src="https://picsum.photos/seed/vicoo-workshop-art/800/500"
              alt={t('shop.behind.alt')}
              caption={t('shop.behind.caption')}
              aspectRatio="wide"
              size="full"
              showCornerAccents={true}
              accentPosition="diagonal"
            />
          </motion.div>

          {/* Right: Editorial text — 4/12 columns */}
          <motion.div
            className="md:col-span-4 flex flex-col justify-center"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 30 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.15, ease: [0, 0, 0.2, 1] }}
          >
            <p className="font-body text-xs text-ink-faded leading-relaxed mb-4">
              {t('shop.behind.body1')}
            </p>
            <p className="font-body text-xs text-ink-faded leading-relaxed mb-6">
              {t('shop.behind.body2')}
            </p>

            <StoryQuoteBlock
              quote={t('shop.behind.quote')}
              author={t('shop.behind.quoteAuthor')}
              role={t('shop.behind.quoteRole')}
            />
          </motion.div>
        </div>
      </SectionContainer>

      <div className="editorial-divider" aria-hidden="true" />
    </PageWrapper>
  );
}
