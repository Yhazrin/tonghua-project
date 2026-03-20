import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { VintageInput } from '@/components/editorial/VintageInput';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isRegistering, registerError } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

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

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <VintageInput
              label={t('register.nickname')}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />

            <VintageInput
              label={t('register.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <VintageInput
              label={t('register.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <VintageInput
              label={t('register.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {(localError || registerError) && (
              <div role="alert" aria-live="assertive" className="border-l-2 border-rust pl-4 text-rust text-sm text-center">
                {localError || registerError}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isRegistering}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full font-body text-sm tracking-[0.15em] uppercase bg-ink text-paper px-10 py-4 hover:bg-rust transition-colors duration-300 disabled:opacity-50"
            >
              {isRegistering ? t('common.loading') : t('register.submit')}
            </motion.button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-gray/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-paper px-4 font-body text-xs text-sepia-mid">
                  {t('register.orContinueWith')}
                </span>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full font-body text-sm tracking-[0.1em] border border-warm-gray/40 text-ink px-10 py-4 hover:border-ink transition-colors duration-300"
            >
              {t('register.wechat')}
            </motion.button>

            <p className="text-center pt-4">
              <span className="font-body text-xs text-sepia-mid mr-2">
                {t('register.alreadyHaveAccount')}
              </span>
              <Link
                to="/login"
                className="font-body text-xs text-rust hover:text-ink transition-colors tracking-[0.1em] uppercase"
              >
                {t('register.login')}
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </PageWrapper>
  );
}
