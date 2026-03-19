import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface DonationPanelProps {
  onSubmit?: (data: {
    amount: number;
    frequency: 'once' | 'monthly';
    anonymous: boolean;
    message: string;
  }) => void;
  isSubmitting?: boolean;
  className?: string;
}

const AMOUNT_PRESETS = [50, 100, 200, 500];

export default function DonationPanel({
  onSubmit,
  isSubmitting = false,
  className = '',
}: DonationPanelProps) {
  const { t } = useTranslation();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const activeAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount > 0 && onSubmit) {
      onSubmit({
        amount: activeAmount,
        frequency,
        anonymous,
        message,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <h3 className="font-display text-[clamp(24px,3vw,36px)] font-bold text-ink mb-8">
        {t('donate.form.title')}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Amount Presets */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {AMOUNT_PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`
                border p-4 text-center transition-all duration-200 cursor-pointer
                ${
                  selectedAmount === amount && !customAmount
                    ? 'border-rust bg-rust/[0.04]'
                    : 'border-warm-gray hover:border-rust'
                }
              `}
            >
              <span className="block font-display text-[clamp(20px,2.5vw,28px)] font-extrabold text-ink">
                {amount}
              </span>
              <span className="block font-body text-[10px] tracking-[0.1em] uppercase text-sepia-mid mt-1">
                {t('donate.form.currency')}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-8">
          <label className="block font-body text-xs tracking-[0.05em] text-sepia-mid mb-2">
            {t('donate.form.customAmount')}
          </label>
          <input
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={t('donate.form.placeholder')}
            className="w-full p-4 font-display text-[clamp(24px,3vw,36px)] font-extrabold text-ink border-b-2 border-ink bg-transparent outline-none transition-colors focus:border-rust placeholder:text-warm-gray"
          />
        </div>

        {/* Frequency */}
        <div className="mb-8">
          <label className="block font-body text-xs tracking-[0.05em] text-sepia-mid mb-3">
            {t('donate.form.frequency.title')}
          </label>
          <div className="flex">
            {(['once', 'monthly'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`
                  flex-1 py-3 font-body text-xs tracking-[0.05em] uppercase text-center border transition-all cursor-pointer
                  ${freq === 'once' ? 'border-r-0' : ''}
                  ${
                    frequency === freq
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-transparent text-sepia-mid border-warm-gray hover:border-ink'
                  }
                `}
              >
                {t(`donate.form.frequency.${freq}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-8">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('donate.form.message')}
            className="w-full p-4 font-body text-sm text-ink border-b border-warm-gray bg-transparent outline-none transition-colors focus:border-rust placeholder:text-sepia-mid/60"
          />
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-rust)] cursor-pointer"
            />
            <span className="font-body text-xs text-sepia-mid">
              {t('donate.form.anonymous')}
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={activeAmount <= 0 || isSubmitting}
          className="w-full py-4 font-body text-xs tracking-[0.1em] uppercase bg-rust text-paper border-none cursor-pointer transition-colors hover:bg-archive-brown disabled:bg-warm-gray disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('donate.form.processing') : t('donate.form.submit')}
        </button>
      </form>
    </motion.div>
  );
}
