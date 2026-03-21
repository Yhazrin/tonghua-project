import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { VintageInput } from '@/components/editorial/VintageInput';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const GRAIN_STYLE: React.CSSProperties = { backgroundImage: 'var(--grain-overlay)' };

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isRegistering, registerError } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError(t('register.errors.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setLocalError(t('register.errors.passwordTooShort'));
      return;
    }

    register(
      { email, password, nickname },
      {
        onSuccess: () => {
          navigate('/');
        },
      }
    );
  };

  return (
    <PageWrapper>
      {/* Centered auth layout - no hero section */}
      <div className="min-h-[100dvh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <NumberedSectionHeading
            number="10"
            title={t('register.title')}
            subtitle={t('register.subtitle')}
            centered
            immediate
          />

          {/* Form card with editorial grain + corners */}
          <div className="bg-paper border border-warm-gray/30 p-8 md:p-10 relative overflow-hidden">
            {/* Grain overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]" style={GRAIN_STYLE} aria-hidden="true" />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-rust/30 pointer-events-none z-10" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-rust/30 pointer-events-none z-10" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-rust/30 pointer-events-none z-10" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-rust/30 pointer-events-none z-10" aria-hidden="true" />

            <motion.form
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6 relative z-[1]"
            >
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
              >
                <VintageInput
                  label={t('register.nickname')}
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.4 }}
              >
                <VintageInput
                  label={t('register.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.5 }}
              >
                <VintageInput
                  label={t('register.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.6 }}
              >
                <VintageInput
                  label={t('register.confirmPassword')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </motion.div>

              {(localError || registerError) && (
                <div role="alert" aria-live="assertive" className="border-l-2 border-rust pl-4 text-rust text-body-sm text-center">
                  {localError || registerError}
                </div>
              )}

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.65 }}
              >
                <motion.button
                  type="submit"
                  disabled={isRegistering}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  className="w-full font-body text-body-sm tracking-[0.15em] uppercase bg-ink text-paper px-10 py-4 hover:bg-rust transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {isRegistering ? t('common.loading') : t('register.submit')}
                </motion.button>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.7 }}
                className="relative py-4"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-warm-gray/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-paper px-4 font-body text-caption text-sepia-mid">
                    {t('register.orContinueWith')}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.75 }}
              >
                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  className="w-full font-body text-body-sm tracking-[0.1em] border border-warm-gray/40 text-ink px-10 py-4 hover:border-ink transition-colors duration-300 cursor-pointer"
                >
                  {t('register.wechat')}
                </motion.button>
              </motion.div>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
                className="text-center pt-4"
              >
                <span className="font-body text-caption text-sepia-mid mr-2">
                  {t('register.alreadyHaveAccount')}
                </span>
                <Link
                  to="/login"
                  className="font-body text-caption text-rust hover:text-ink transition-colors tracking-[0.1em] uppercase cursor-pointer"
                >
                  {t('register.login')}
                </Link>
              </motion.p>
            </motion.form>
          </div>
        </div>
      </div>

      <div className="editorial-divider" aria-hidden="true" />
    </PageWrapper>
  );
}
