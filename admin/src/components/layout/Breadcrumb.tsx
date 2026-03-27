import { useLocation, Link } from 'react-router-dom';

const pathNames: Record<string, string> = {
  '': 'Dashboard',
  artworks: 'Artworks',
  campaigns: 'Campaigns',
  donations: 'Donations',
  orders: 'Orders',
  users: 'Users',
  'child-audit': 'Child Audit',
  'audit-log': 'Audit Log',
  settings: 'Settings',
};

export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 20, fontSize: 13,
    }}>
      <Link
        to="/"
        style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
      >
        Home
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = pathNames[seg] || seg;
        const isLast = i === segments.length - 1;

        return (
          <span key={path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--color-text-light)' }}>/</span>
            {isLast ? (
              <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{label}</span>
            ) : (
              <Link to={path} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
