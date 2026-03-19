import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SepiaImage from '@/components/ui/SepiaImage';
import type { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
  index?: number;
}

export default function CampaignCard({ campaign, index = 0 }: CampaignCardProps) {
  const { t } = useTranslation();
  const progress = Math.min(
    Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
    100
  );

  const statusColors = {
    active: 'bg-archive-brown text-paper',
    upcoming: 'bg-pale-gold text-ink',
    completed: 'bg-warm-gray text-ink-faded',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/campaigns/${campaign.id}`} className="block">
        <div className="relative">
          <SepiaImage
            src={campaign.coverImageUrl}
            alt={campaign.title}
            aspectRatio="16/10"
            className="w-full"
          />
          <div className="absolute top-4 left-4">
            <span
              className={`font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 ${statusColors[campaign.status]}`}
            >
              {t(`campaigns.status.${campaign.status}`)}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <h3 className="font-display text-xl md:text-2xl text-ink group-hover:text-rust transition-colors leading-tight">
            {campaign.title}
          </h3>
          <p className="font-body text-sm text-ink-faded mt-2 line-clamp-2">
            {campaign.subtitle}
          </p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-body text-xs text-sepia-mid">
                {campaign.participantCount} {t('campaigns.detail.participants')}
              </span>
              <span className="font-body text-xs text-sepia-mid">
                {progress}% {t('campaigns.detail.progress')}
              </span>
            </div>
            <div className="w-full h-1 bg-warm-gray/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-archive-brown rounded-full"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
