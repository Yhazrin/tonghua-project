import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import SectionContainer from '@/components/layout/SectionContainer';
import EditorialHero from '@/components/editorial/EditorialHero';
import NumberedSectionHeading from '@/components/editorial/NumberedSectionHeading';
import SepiaImageFrame from '@/components/editorial/SepiaImageFrame';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // API call would go here
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PageWrapper>
      <EditorialHero
        number="08"
        title={t('contact.hero.title')}
        subtitle={t('contact.hero.subtitle')}
      />

      <SectionContainer>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          {/* Form */}
          <div className="md:col-span-7">
            <NumberedSectionHeading number="01" title="Write to Us" />

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-2">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full font-body text-sm py-3 border-b border-warm-gray/40 focus:border-rust transition-colors bg-transparent"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full font-body text-sm py-3 border-b border-warm-gray/40 focus:border-rust transition-colors bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-2">
                  {t('contact.form.subject')}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full font-body text-sm py-3 border-b border-warm-gray/40 focus:border-rust transition-colors bg-transparent"
                />
              </div>

              <div>
                <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full font-body text-sm py-3 border-b border-warm-gray/40 focus:border-rust transition-colors resize-none bg-transparent"
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === 'sending'}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="font-body text-sm tracking-[0.15em] uppercase bg-ink text-paper px-10 py-4 hover:bg-rust transition-colors duration-300 disabled:opacity-50"
              >
                {status === 'sending'
                  ? t('contact.form.sending')
                  : t('contact.form.submit')
                }
              </motion.button>

              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-body text-sm text-rust"
                >
                  {t('contact.form.success')}
                </motion.p>
              )}

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-body text-sm text-archive-brown"
                >
                  {t('contact.form.error')}
                </motion.p>
              )}
            </form>
          </div>

          {/* Contact info */}
          <div className="md:col-span-5">
            <NumberedSectionHeading number="02" title={t('contact.info.title')} />

            <div className="space-y-8">
              <div>
                <span className="font-body text-caption text-sepia-mid tracking-[0.2em] uppercase">
                  Email
                </span>
                <a
                  href={`mailto:${t('contact.info.email')}`}
                  className="block font-display text-xl font-semibold text-ink mt-2 hover:text-rust transition-colors"
                >
                  {t('contact.info.email')}
                </a>
              </div>

              <div>
                <span className="font-body text-caption text-sepia-mid tracking-[0.2em] uppercase">
                  WeChat
                </span>
                <p className="font-display text-xl font-semibold text-ink mt-2">
                  {t('contact.info.wechat')}
                </p>
              </div>

              <div>
                <span className="font-body text-caption text-sepia-mid tracking-[0.2em] uppercase">
                  Location
                </span>
                <p className="font-display text-xl font-semibold text-ink mt-2">
                  {t('contact.info.address')}
                </p>
              </div>
            </div>

            {/* Decorative image */}
            <div className="mt-12">
              <SepiaImageFrame
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80"
                alt="Team meeting"
                caption="Our Shanghai office"
                aspectRatio="landscape"
                size="full"
              />
            </div>
          </div>
        </div>
      </SectionContainer>

      <div className="editorial-divider" />
    </PageWrapper>
  );
}
