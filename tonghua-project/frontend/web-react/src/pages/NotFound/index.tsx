import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import PaperTextureBackground from '@/components/editorial/PaperTextureBackground';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';

const NAV_SUGGESTIONS = [
  { key: 'home', path: '/' },
  { key: 'campaigns', path: '/campaigns' },
  { key: 'shop', path: '/shop' },
  { key: 'stories', path: '/stories' },
];

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <PaperTextureBackground variant="paper" className="min-h-[100dvh] flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
            {/* Left: Large 404 */}
            <div className="md:col-span-5">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
                className="font-body text-[10px] tracking-[0.3em] uppercase text-sepia-mid mb-4 block"
              >
                {t('notFound.subtitle')}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: 0.1 }}
                className="font-display text-[10rem] md:text-[14rem] leading-none font-black text-ink/10 select-none"
                aria-hidden="true"
              >
                404
              </motion.h1>
            </div>

            {/* Right: Message + suggestions */}
            <div className="md:col-span-5 md:col-start-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              >
                <NumberedSectionHeading number="--" title={t('notFound.subtitle')} />
                <p className="font-body text-sm text-ink-faded leading-[1.8] mb-10 max-w-sm">
                  {t('notFound.body', { defaultValue: 'The page you are looking for may have been moved, renamed, or no longer exists. Here are some places to start.' })}
                </p>

                <div className="space-y-0 mb-10">
                  {NAV_SUGGESTIONS.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                    >
                      <Link
                        to={item.path}
                        className="group flex items-center justify-between py-4 border-b border-warm-gray/20 hover:border-rust/40 transition-colors"
                      >
                        <span className="font-body text-sm text-ink group-hover:text-rust transition-colors">
                          {t(`nav.${item.key}`)}
                        </span>
                        <span className="font-mono text-[10px] text-sepia-mid group-hover:text-rust transition-colors">
                          &rarr;
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link
                    to="/"
                    className="inline-block font-body text-xs tracking-[0.15em] uppercase bg-ink text-paper px-8 py-3.5 hover:bg-rust transition-colors duration-300"
                  >
                    {t('notFound.cta')}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </PaperTextureBackground>
    </PageWrapper>
  );
}
