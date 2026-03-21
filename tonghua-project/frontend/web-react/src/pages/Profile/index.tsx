import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import PaperTextureBackground from '@/components/editorial/PaperTextureBackground';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import { useAuthStore } from '@/stores/authStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <PageWrapper>
        <div className="min-h-[100dvh] flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <p className="font-body text-ink-faded mb-4">{t('profile.notLoggedIn')}</p>
            <motion.button
              whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              onClick={() => navigate('/login')}
              className="font-body text-sm tracking-[0.15em] uppercase bg-ink text-paper px-10 py-4 hover:bg-rust transition-colors duration-300 cursor-pointer"
            >
              {t('nav.login')}
            </motion.button>
          </div>
        </div>

        <div className="editorial-divider" aria-hidden="true" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PaperTextureBackground>
        <div className="min-h-[100dvh] py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <NumberedSectionHeading number="11" title={t('profile.title')} />

            {/* Profile Card */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              className="bg-paper border border-warm-gray/30 p-8"
            >
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-6 pb-6 border-b border-warm-gray/20">
                  <div className="w-16 h-16 bg-warm-gray/20 flex items-center justify-center">
                    <span className="font-display text-xl text-ink">
                      {user.nickname ? user.nickname.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-ink">{user.nickname || user.email}</h2>
                    <p className="font-body text-sm text-ink-faded">{user.email}</p>
                    <span className="inline-block mt-2 font-body text-overline tracking-[0.1em] uppercase text-sepia-mid bg-warm-gray/20 px-2 py-1">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="font-body text-sm tracking-[0.1em] uppercase text-sepia-mid">
                    {t('profile.accountDetails')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-body text-xs text-ink-faded mb-1">{t('profile.userId')}</p>
                      <p className="font-body text-sm text-ink">{user.id}</p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-ink-faded mb-1">{t('profile.role')}</p>
                      <p className="font-body text-sm text-ink capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    onClick={handleLogout}
                    className="flex-1 font-body text-sm tracking-[0.1em] uppercase border border-warm-gray/40 text-ink px-6 py-3 hover:bg-warm-gray/10 transition-colors duration-300 cursor-pointer"
                  >
                    {t('nav.logout')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </PaperTextureBackground>

      <div className="editorial-divider" aria-hidden="true" />
    </PageWrapper>
  );
}