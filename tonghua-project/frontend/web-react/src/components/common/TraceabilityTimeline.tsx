import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { SupplyChainRecord } from '@/types';

interface TraceabilityTimelineProps {
  records: SupplyChainRecord[];
  className?: string;
}

export default function TraceabilityTimeline({
  records,
  className = '',
}: TraceabilityTimelineProps) {
  const { t } = useTranslation();
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-warm-gray/40" />

      <div className="space-y-0">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: [0, 0, 0.2, 1],
              delay: index * 0.12,
            }}
            className="relative pl-12 md:pl-16 pb-10 last:pb-0"
          >
            {/* Node */}
            <div
              className={`
                absolute left-2.5 md:left-4.5 top-1 w-3 h-3 rounded-full border-2
                ${record.verified
                  ? 'border-rust bg-rust'
                  : 'border-warm-gray bg-paper'
                }
              `}
            />

            {/* Content */}
            <div className="border-l border-warm-gray/20 pl-6 md:pl-8">
              {/* Stage label */}
              <div className="flex items-center gap-3 mb-2">
                <span className="font-body text-caption text-sepia-mid tracking-[0.15em] uppercase">
                  {t(`traceability.stages.${record.stage}`, { defaultValue: record.stage })}
                </span>
                {record.verified && (
                  <span className="inline-flex items-center gap-1 font-body text-[10px] text-rust tracking-wider uppercase">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {t('traceability.verified')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="font-body text-sm text-ink-faded leading-relaxed mb-2">
                {record.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-body text-xs text-sepia-mid">
                  {record.location}
                </span>
                <span className="font-body text-xs text-warm-gray">|</span>
                <span className="font-body text-xs text-sepia-mid">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="font-body text-xs text-warm-gray">|</span>
                <span className="font-body text-xs text-sepia-mid">
                  {record.partnerName}
                </span>
                {record.carbonFootprint !== undefined && (
                  <>
                    <span className="font-body text-xs text-warm-gray">|</span>
                    <span className="font-body text-xs text-sepia-mid">
                      {t('traceability.carbon')}: {record.carbonFootprint} kg CO₂
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
