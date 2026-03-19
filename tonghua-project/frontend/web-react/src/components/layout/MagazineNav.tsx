import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

const NAV_ITEMS = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'campaigns', path: '/campaigns' },
  { key: 'stories', path: '/stories' },
  { key: 'donate', path: '/donate' },
  { key: 'shop', path: '/shop' },
  { key: 'traceability', path: '/traceability' },
  { key: 'contact', path: '/contact' },
];

export default function MagazineNav() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { mobileNavOpen, toggleMobileNav, setMobileNavOpen, currentLocale, setLocale } =
    useUIStore();

  const toggleLocale = () => {
    const next = currentLocale === 'en' ? 'zh' : 'en';
    setLocale(next);
    i18n.changeLanguage(next);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-warm-gray/30">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-ink text-xl md:text-2xl font-bold tracking-tight"
          onClick={() => setMobileNavOpen(false)}
        >
          TONGHUA
        </Link>

        {/* Desktop Navigation - Magazine style numbered items */}
        {!isMobile && (
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`
                    relative font-body text-[11px] tracking-wide px-3 py-2 transition-colors duration-200
                    ${isActive ? 'text-rust' : 'text-ink-faded hover:text-ink'}
                  `}
                >
                  <span className="text-[9px] tracking-[0.2em] text-sepia-mid mr-1.5">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {t(`nav.${item.key}`)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-px bg-rust"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            className="font-body text-[10px] tracking-[0.1em] uppercase text-ink-faded hover:text-ink transition-colors px-2 py-1 border border-warm-gray/40 rounded cursor-pointer"
            aria-label="Toggle language"
          >
            {currentLocale === 'en' ? '中文' : 'EN'}
          </button>

          <Link
            to="/login"
            className="hidden md:inline-block font-body text-[11px] tracking-[0.05em] text-ink-faded hover:text-ink transition-colors px-3 py-1.5 border border-warm-gray/40 rounded"
          >
            {t('nav.login')}
          </Link>

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={toggleMobileNav}
              className="flex flex-col gap-1.5 p-2 cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
            >
              <motion.span
                animate={mobileNavOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block w-6 h-px bg-ink"
              />
              <motion.span
                animate={mobileNavOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="block w-6 h-px bg-ink"
              />
              <motion.span
                animate={mobileNavOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block w-6 h-px bg-ink"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
