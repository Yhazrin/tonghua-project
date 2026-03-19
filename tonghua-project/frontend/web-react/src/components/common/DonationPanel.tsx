import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const TIERS = [
  { key: 'seedling', amount: 50 },
  { key: 'bloom', amount: 200 },
  { key: 'canopy', amount: 500 },
  { key: 'forest', amount: 2000 },
];

interface DonationPanelProps {
  className?: string;
}

export default function DonationPanel({ className = '' }: DonationPanelProps) {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<string | null>('bloom');
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeAmount = selectedTier
    ? TIERS.find((t) => t.key === selectedTier)?.amount ?? 0
    : Number(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount <= 0) return;
    setIsProcessing(true);
    // API call would go here
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className={`bg-aged-stock border border-warm-gray/40 p-8 md:p-12 ${className}`}>
      <h3 className="font-display text-h3 font-bold text-ink mb-8">
        {t('donate.form.title')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tier selection */}
        <div className="grid grid-cols-2 gap-3">
          {TIERS.map((tier) => {
            const isActive = selectedTier === tier.key;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => {
                  setSelectedTier(tier.key);
                  setCustomAmount('');
                }}
                className={`
                  text-left p-4 border transition-all duration-300
                  ${isActive
                    ? 'border-rust bg-paper shadow-sm'
                    : 'border-warm-gray/30 hover:border-sepia-mid/50'
                  }
                `}
              >
                <div className="font-display text-lg font-bold text-ink">
                  ¥{tier.amount}
                </div>
                <div className="font-body text-xs text-sepia-mid mt-1 tracking-wide uppercase">
                  {t(`donate.tiers.${tier.key}.label`)}
                </div>
                <div className="font-body text-xs text-ink-faded mt-2 leading-relaxed">
                  {t(`donate.tiers.${tier.key}.impact`)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom amount */}
        <div>
          <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-2">
            {t('donate.form.customAmount')}
          </label>
          <div className="flex items-baseline border-b border-warm-gray/40 focus-within:border-rust transition-colors">
            <span className="font-body text-lg text-sepia-mid mr-2">¥</span>
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedTier(null);
              }}
              placeholder={t('donate.form.placeholder')}
              className="flex-1 font-body text-lg py-3 bg-transparent"
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-3">
            {t('donate.form.frequency.title')}
          </label>
          <div className="flex gap-4">
            {(['once', 'monthly'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`
                  font-body text-sm px-5 py-2 border transition-all duration-200
                  ${frequency === freq
                    ? 'border-rust text-rust bg-paper'
                    : 'border-warm-gray/30 text-ink-faded hover:border-sepia-mid/50'
                  }
                `}
              >
                {t(`donate.form.frequency.${freq}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`
              w-5 h-5 border transition-all duration-200 flex items-center justify-center
              ${anonymous ? 'border-rust bg-rust' : 'border-warm-gray/50 group-hover:border-sepia-mid'}
            `}
          >
            {anonymous && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="sr-only"
          />
          <span className="font-body text-sm text-ink-faded">
            {t('donate.form.anonymous')}
          </span>
        </label>

        {/* Message */}
        <div>
          <label className="font-body text-xs text-sepia-mid tracking-wider uppercase block mb-2">
            {t('donate.form.message')}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full font-body text-sm py-3 border-b border-warm-gray/40 focus:border-rust transition-colors resize-none bg-transparent"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={activeAmount <= 0 || isProcessing}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full py-4 font-body text-sm tracking-[0.15em] uppercase transition-all duration-300
            ${activeAmount > 0
              ? 'bg-ink text-paper hover:bg-rust'
              : 'bg-warm-gray/30 text-sepia-mid cursor-not-allowed'
            }
          `}
        >
          {isProcessing
            ? t('donate.form.processing')
            : `${t('donate.form.submit')} — ¥${activeAmount.toLocaleString()}`
          }
        </motion.button>
      </form>
    </div>
  );
}
