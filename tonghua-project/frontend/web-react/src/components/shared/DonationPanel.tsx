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
  onDonate?: (amount: number) => void;
}

export default function DonationPanel({ onDonate }: DonationPanelProps) {
  const { t } = useTranslation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(200);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [anonymous, setAnonymous] = useState(false);

  const activeAmount = selectedAmount ?? Number(customAmount) ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount > 0 && onDonate) {
      onDonate(activeAmount);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Frequency Toggle */}
      <div>
        <p className="font-body text-xs tracking-[0.15em] uppercase text-sepia-mid mb-3">
          {t('donate.form.frequency.title')}
        </p>
        <div className="flex gap-2">
          {(['once', 'monthly'] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequency(freq)}
              className={`font-body text-sm px-5 py-2.5 border transition-all duration-200 ${
                frequency === freq
                  ? 'border-ink bg-ink text-paper'
                  : 'border-warm-gray/50 text-ink-faded hover:border-ink'
              }`}
            >
              {t(`donate.form.frequency.${freq}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Selection */}
      <div className="grid grid-cols-2 gap-3">
        {TIERS.map((tier) => {
          const isSelected = selectedAmount === tier.amount;
          return (
            <motion.button
              key={tier.key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedAmount(tier.amount);
                setCustomAmount('');
              }}
              className={`text-left p-4 border transition-all duration-200 ${
                isSelected
                  ? 'border-ink bg-ink/[0.04]'
                  : 'border-warm-gray/40 hover:border-sepia-mid'
              }`}
            >
              <span className="font-display text-xl font-bold text-ink">
                {t(`donate.form.currency`)}{tier.amount}
              </span>
              <span className={`block font-body text-xs mt-1 ${
                isSelected ? 'text-rust' : 'text-sepia-mid'
              }`}>
                {t(`donate.tiers.${tier.key}.label`)}
              </span>
              <span className="block font-body text-[11px] text-ink-faded mt-2 leading-relaxed">
                {t(`donate.tiers.${tier.key}.impact`)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div>
        <label className="font-body text-xs tracking-[0.15em] uppercase text-sepia-mid block mb-2">
          {t('donate.form.customAmount')}
        </label>
        <div className="flex items-center border border-warm-gray/50 focus-within:border-ink transition-colors">
          <span className="font-body text-sm text-sepia-mid px-4">
            {t('donate.form.currency')}
          </span>
          <input
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder={t('donate.form.placeholder')}
            className="flex-1 font-body text-sm bg-transparent py-3 pr-4 focus:outline-none text-ink placeholder:text-warm-gray"
          />
        </div>
      </div>

      {/* Anonymous */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`w-5 h-5 border flex items-center justify-center transition-colors ${
            anonymous ? 'bg-ink border-ink' : 'border-warm-gray/50 group-hover:border-sepia-mid'
          }`}
        >
          {anonymous && (
            <svg className="w-3 h-3 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className="font-body text-sm text-ink-faded">
          {t('donate.form.anonymous')}
        </span>
      </label>

      {/* Submit */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={activeAmount <= 0}
        className="w-full font-body text-sm tracking-[0.15em] uppercase bg-ink text-paper py-4 hover:bg-ink-faded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('donate.form.submit')} — {t('donate.form.currency')}{activeAmount > 0 ? activeAmount : '___'}
        {frequency === 'monthly' ? '/mo' : ''}
      </motion.button>
    </form>
  );
}
