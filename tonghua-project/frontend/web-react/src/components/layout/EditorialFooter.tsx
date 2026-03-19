import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function EditorialFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper mt-auto relative overflow-hidden">
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url(/textures/paper.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24 relative z-10">
        {/* Top section — Magazine colophon style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand column */}
          <div className="md:col-span-4">
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              TONGHUA
            </h3>
            <p className="font-body text-sm text-warm-gray leading-relaxed max-w-xs mb-6">
              {t('footer.tagline')}
            </p>
            <div className="w-12 h-px bg-pale-gold mb-6" aria-hidden="true" />
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sepia-mid">
              {t('footer.issueNo')}
            </p>
          </div>

          {/* Publication */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-sepia-mid mb-6">
              {t('footer.sections.publication')}
            </h4>
            <ul className="space-y-3">
              {['about', 'campaigns', 'stories'].map((key) => (
                <li key={key}>
                  <Link
                    to={`/${key}`}
                    className="font-body text-sm text-warm-gray hover:text-paper transition-colors duration-200"
                  >
                    {t(`footer.links.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-sepia-mid mb-6">
              {t('footer.sections.connect')}
            </h4>
            <ul className="space-y-3">
              {['shop', 'donate', 'contact'].map((key) => (
                <li key={key}>
                  <Link
                    to={`/${key}`}
                    className="font-body text-sm text-warm-gray hover:text-paper transition-colors duration-200"
                  >
                    {t(`footer.links.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-sepia-mid mb-6">
              {t('footer.sections.legal')}
            </h4>
            <ul className="space-y-3">
              {['privacy', 'terms', 'children'].map((key) => (
                <li key={key}>
                  <Link
                    to={`/${key}`}
                    className="font-body text-sm text-warm-gray hover:text-paper transition-colors duration-200"
                  >
                    {t(`footer.links.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-sepia-mid mb-6">
              Newsletter
            </h4>
            <p className="font-body text-xs text-warm-gray mb-4 leading-relaxed">
              Quarterly dispatches from the editor's desk. No spam, only stories.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-transparent border-b border-sepia-mid/30 text-paper font-body text-xs py-2 outline-none focus:border-pale-gold transition-colors placeholder:text-sepia-mid/40"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="font-body text-[10px] tracking-[0.15em] uppercase text-pale-gold hover:text-paper transition-colors text-left cursor-pointer"
              >
                Subscribe &rarr;
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sepia-mid/20 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="font-body text-[11px] text-sepia-mid">
            &copy; {year} Tonghua Public Welfare. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-body text-[11px] text-sepia-mid">
              Shanghai, China
            </span>
            <span className="font-body text-[11px] text-sepia-mid">
              Built with care
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
