import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionContainer from '@/components/layout/SectionContainer';
import EditorialHero from '@/components/editorial/EditorialHero';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import StoryQuoteBlock from '@/components/editorial/StoryQuoteBlock';
import SepiaImageFrame from '@/components/editorial/SepiaImageFrame';
import DonationPanel from '@/components/editorial/DonationPanel';
import ImpactCounter from '@/components/editorial/ImpactCounter';
import FAQAccordion from '@/components/editorial/FAQAccordion';
import MagneticButton from '@/components/animations/MagneticButton';
import { donationsApi } from '@/services/donations';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const GRAIN_STYLE: React.CSSProperties = { backgroundImage: 'var(--grain-overlay)' };

/* ─── Impact Area Data ─── */

const IMPACT_AREAS = [
  { key: 'artSupplies', pct: 60, icon: 'brush' },
  { key: 'production', pct: 20, icon: 'fabric' },
  { key: 'operations', pct: 15, icon: 'gear' },
  { key: 'community', pct: 5, icon: 'heart' },
];

/* ─── Impact Icon ─── */

function ImpactIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    brush: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.37 2.63a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L9.12 17.88a4 4 0 0 1-2.83 1.17H4v-2.25a4 4 0 0 1 1.17-2.83L17.42 1.68z" />
        <path d="M4 20h4" />
      </svg>
    ),
    fabric: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    ),
    gear: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    heart: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  };
  return <span className="text-rust/60">{icons[type] || null}</span>;
}

/* ─── Impact Progress Bar ─── */

function ImpactProgressBar({
  label,
  description,
  pct,
  icon,
  index,
}: {
  label: string;
  description: string;
  pct: number;
  icon: string;
  index: number;
}) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={prefersReducedMotion ? undefined : { once: true }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.12,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <ImpactIcon type={icon} />
        <div className="flex-1 flex items-baseline justify-between">
          <span className="font-body text-body-sm text-ink font-medium">
            {label}
          </span>
          <span className="font-display text-body-sm font-bold text-rust">
            {pct}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-warm-gray/15 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <motion.div
          initial={prefersReducedMotion ? false : { width: 0 }}
          whileInView={prefersReducedMotion ? undefined : { width: `${pct}%` }}
          viewport={prefersReducedMotion ? undefined : { once: true }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            type: 'spring',
            stiffness: 80,
            damping: 20,
            delay: index * 0.12 + 0.2,
          }}
          className="h-full"
          style={{
            width: prefersReducedMotion ? `${pct}%` : undefined,
            background: 'linear-gradient(90deg, var(--color-rust), var(--color-archive-brown))',
          }}
        />
      </div>
      <p className="font-body text-caption text-ink-faded mt-1.5 leading-relaxed pl-8">
        {description}
      </p>
    </motion.div>
  );
}

/* ─── Trust Badge ─── */

function TrustBadge({ label, index }: { label: string; index: number }) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={prefersReducedMotion ? undefined : { once: true }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        type: 'spring',
        stiffness: 380,
        damping: 30,
        delay: index * 0.08,
      }}
      className="flex items-center gap-2 border border-warm-gray/30 px-4 py-2.5 bg-paper"
    >
      <span className="w-2 h-2 bg-rust/60 rotate-45" />
      <span className="font-body text-caption text-ink tracking-[0.08em] uppercase">
        {label}
      </span>
    </motion.div>
  );
}

/* ─── Donation Story Card ─── */

function DonationStoryCard({
  amount,
  impact,
  caption,
  imageSeed,
  index,
}: {
  amount: string;
  impact: string;
  caption: string;
  imageSeed: string;
  index: number;
}) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={prefersReducedMotion ? undefined : { once: true }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        type: 'spring',
        stiffness: 380,
        damping: 30,
        delay: index * 0.12,
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
      className="group"
    >
      <SepiaImageFrame
        src={`https://picsum.photos/seed/${imageSeed}/400/300`}
        alt={impact}
        aspectRatio="landscape"
        size="full"
        showCornerAccents={true}
      />
      <div className="mt-4">
        <span className="font-display text-body-lg font-bold text-rust">
          {amount}
        </span>
        <p className="font-body text-body-sm text-ink mt-1 leading-relaxed">
          {impact}
        </p>
        <span className="font-body text-caption text-sepia-mid tracking-[0.1em] mt-2 block">
          {caption}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function Donate() {
  const { t } = useTranslation();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleDonate = async (data: {
    amount: number;
    frequency: 'once' | 'monthly';
    anonymous: boolean;
    message: string;
  }) => {
    setIsSubmitting(true);
    setDonationSuccess(false);
    setDonationError(null);
    try {
      await donationsApi.create({
        amount: data.amount,
        currency: 'CNY',
        anonymous: data.anonymous,
        message: data.message,
        frequency: data.frequency,
      });
      setDonationSuccess(true);
      // Scroll to success feedback area
      requestAnimationFrame(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } catch (error) {
      console.error('Donation failed:', error);
      setDonationError(
        error instanceof Error ? error.message : t('donate.form.error', 'Donation failed. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const donationStories = useMemo(() => [
    {
      amount: t('donate.stories.items.0.amount'),
      impact: t('donate.stories.items.0.impact'),
      caption: t('donate.stories.items.0.caption'),
      imageSeed: 'donation-school-art',
    },
    {
      amount: t('donate.stories.items.1.amount'),
      impact: t('donate.stories.items.1.impact'),
      caption: t('donate.stories.items.1.caption'),
      imageSeed: 'donation-tote-bags',
    },
    {
      amount: t('donate.stories.items.2.amount'),
      impact: t('donate.stories.items.2.impact'),
      caption: t('donate.stories.items.2.caption'),
      imageSeed: 'donation-workshop-rural',
    },
  ], [t]);

  return (
    <PageWrapper>
      <EditorialHero
        title={t('donate.hero.title')}
        subtitle={t('donate.hero.subtitle')}
        fullHeight={true}
      />

      {/* Emotional Introduction */}
      <SectionContainer narrow>
        <StoryQuoteBlock
          quote={t('donate.emotional.quote')}
          author={t('donate.emotional.author')}
          role={t('donate.emotional.role')}
        />
      </SectionContainer>

      {/* Main donation area */}
      <SectionContainer noTopSpacing>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          {/* Left: Impact Breakdown */}
          <div className="md:col-span-5">
            <NumberedSectionHeading
              number="01"
              title={t('donate.impact.title')}
            />

            {/* Enhanced impact progress bars */}
            <div className="space-y-7 mt-8">
              {IMPACT_AREAS.map((area, index) => (
                <ImpactProgressBar
                  key={area.key}
                  label={t(`donate.impact.${area.key}`)}
                  description={t(`donate.impact.${area.key}Desc`)}
                  pct={area.pct}
                  icon={area.icon}
                  index={index}
                />
              ))}
            </div>

            {/* Impact counters */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <ImpactCounter value={890000} label={t('donate.impact.fundsRaised')} prefix={t('common.currency.cny')} />
              <ImpactCounter value={2847} label={t('donate.impact.childrenHelped')} />
            </div>
          </div>

          {/* Right: Donation panel */}
          <div className="md:col-span-7">
            <DonationPanel
              onSubmit={handleDonate}
              isSubmitting={isSubmitting}
            />

            {/* Error feedback */}
            {donationError && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
                className="mt-6 p-5 border-l-2 border-rust bg-rust/5"
                role="alert"
                aria-live="assertive"
              >
                <p className="font-body text-body-sm text-rust font-medium">
                  {donationError}
                </p>
                <button
                  onClick={() => setDonationError(null)}
                  className="font-body text-caption text-rust/70 mt-2 underline hover:text-rust transition-colors cursor-pointer"
                >
                  {t('common.dismiss', 'Dismiss')}
                </button>
              </motion.div>
            )}

            {/* Success feedback */}
            {donationSuccess && (
              <motion.div
                ref={successRef}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
                className="mt-6 p-5 border-2 border-eco-green/30 bg-eco-green/5"
                role="status"
              >
                <p className="font-body text-body-sm text-eco-green font-medium">
                  {t('donate.form.success', 'Thank you for your donation!')}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </SectionContainer>

      {/* Donation Success Stories */}
      <SectionContainer>
        <NumberedSectionHeading
          number="02"
          title={t('donate.stories.title')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {donationStories.map((story, i) => (
            <DonationStoryCard
              key={story.imageSeed}
              amount={story.amount}
              impact={story.impact}
              caption={story.caption}
              imageSeed={story.imageSeed}
              index={i}
            />
          ))}
        </div>
      </SectionContainer>

      {/* Transparency */}
      <section className="bg-aged-stock section-spacing relative">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]"
          style={GRAIN_STYLE}
          aria-hidden="true"
        />

        <SectionContainer>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
            <div className="md:col-span-5 relative">
              {/* Decorative corner accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-rust/30 pointer-events-none" aria-hidden="true" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-rust/30 pointer-events-none" aria-hidden="true" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-rust/30 pointer-events-none" aria-hidden="true" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-rust/30 pointer-events-none" aria-hidden="true" />

              <h3 className="font-display text-h3 font-bold text-ink mb-4">
                {t('donate.transparency.title')}
              </h3>
              <p className="font-body text-body-sm text-ink-faded leading-relaxed mb-6">
                {t('donate.transparency.subtitle')}
              </p>

              {/* Specific transparency data points */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-rust/60 rotate-45 mt-2 shrink-0" />
                  <span className="font-body text-body-sm text-ink">
                    {t('donate.transparency.lastAudit')}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-rust/60 rotate-45 mt-2 shrink-0" />
                  <span className="font-body text-body-sm text-ink">
                    {t('donate.transparency.onChain')}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-rust/60 rotate-45 mt-2 shrink-0" />
                  <span className="font-body text-body-sm text-ink">
                    {t('donate.transparency.quarterly')}
                  </span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mb-8">
                <span className="font-body text-caption text-sepia-mid tracking-[0.15em] uppercase block mb-3">
                  {t('donate.transparency.trustIndicators')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    t('donate.transparency.trust.audited'),
                    t('donate.transparency.trust.verified'),
                    t('donate.transparency.trust.transparent'),
                    t('donate.transparency.trust.impactReported'),
                  ].map((badge, i) => (
                    <TrustBadge key={badge} label={badge} index={i} />
                  ))}
                </div>
              </div>

              <motion.button
                className="font-body text-caption text-rust tracking-[0.15em] uppercase hover:text-ink transition-colors cursor-pointer"
                whileHover={prefersReducedMotion ? undefined : { x: 4 }}
              >
                {t('donate.transparency.viewReport')} &rarr;
              </motion.button>
            </div>
            <div className="md:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                {['Q1 2026', 'Q4 2025', 'Q3 2025', 'Q2 2025'].map((quarter, index) => (
                  <motion.div
                    key={quarter}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={prefersReducedMotion ? undefined : { once: true }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.1 }}
                    whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                    className="border border-warm-gray/30 p-6 bg-paper hover:border-rust/30 transition-colors relative"
                  >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rust/30 pointer-events-none" aria-hidden="true" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rust/30 pointer-events-none" aria-hidden="true" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rust/30 pointer-events-none" aria-hidden="true" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rust/30 pointer-events-none" aria-hidden="true" />

                    <span className="font-body text-caption text-sepia-mid tracking-[0.15em]">
                      {t('donate.transparency.financialReport')}
                    </span>
                    <h4 className="font-display text-body-lg font-bold text-ink mt-2">
                      {quarter}
                    </h4>
                    <span className="font-body text-caption text-sepia-mid mt-2 block">
                      {t('donate.transparency.pdfSize')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* Quote */}
      <SectionContainer narrow>
        <StoryQuoteBlock
          quote={t('donate.transparency.quote')}
          author={t('donate.transparency.quoteAuthor')}
        />
      </SectionContainer>

      {/* FAQ Section */}
      <SectionContainer>
        <div className="max-w-3xl mx-auto">
          <NumberedSectionHeading
            number="03"
            title={t('donate.faq.title')}
          />
          <div className="mt-8">
            <FAQAccordion
              items={[
                {
                  question: t('donate.faq.q1'),
                  answer: t('donate.faq.a1'),
                },
                {
                  question: t('donate.faq.q2'),
                  answer: t('donate.faq.a2'),
                },
                {
                  question: t('donate.faq.q3'),
                  answer: t('donate.faq.a3'),
                },
                {
                  question: t('donate.faq.q4'),
                  answer: t('donate.faq.a4'),
                },
              ]}
            />
          </div>
        </div>
      </SectionContainer>

      {/* Final CTA */}
      <section className="bg-ink text-paper section-spacing relative overflow-hidden">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]"
          style={GRAIN_STYLE}
          aria-hidden="true"
        />

        <SectionContainer>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Decorative line above */}
            <motion.div
              initial={prefersReducedMotion ? false : { width: 0 }}
              whileInView={prefersReducedMotion ? undefined : { width: '80px' }}
              viewport={prefersReducedMotion ? undefined : { once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0, 0, 0.2, 1] }}
              className="h-px bg-rust/50 mx-auto mb-10"
              style={prefersReducedMotion ? { width: '80px' } : undefined}
            />

            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={prefersReducedMotion ? undefined : { once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
              className="font-display text-h2 md:text-h1 font-bold leading-[0.95] mb-10"
            >
              {t('donate.cta.title')}
            </motion.h2>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={prefersReducedMotion ? undefined : { once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <MagneticButton strength={0.35}>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-block font-body text-body-sm tracking-[0.15em] uppercase bg-rust text-paper px-10 py-4 hover:bg-pale-gold hover:text-ink transition-all duration-300 cursor-pointer"
                >
                  {t('donate.cta.donate')}
                </button>
              </MagneticButton>
              <MagneticButton strength={0.35}>
                <Link
                  to="/about"
                  className="inline-block font-body text-body-sm tracking-[0.15em] uppercase border border-warm-gray/40 text-paper px-10 py-4 hover:border-pale-gold hover:text-pale-gold transition-all duration-300 cursor-pointer"
                >
                  {t('donate.cta.learnMore')}
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Decorative line below */}
            <motion.div
              initial={prefersReducedMotion ? false : { width: 0 }}
              whileInView={prefersReducedMotion ? undefined : { width: '80px' }}
              viewport={prefersReducedMotion ? undefined : { once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0, 0, 0.2, 1], delay: 0.3 }}
              className="h-px bg-rust/50 mx-auto mt-10"
              style={prefersReducedMotion ? { width: '80px' } : undefined}
            />
          </div>
        </SectionContainer>
      </section>

      <div className="editorial-divider" aria-hidden="true" />
    </PageWrapper>
  );
}
