interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  // Artwork
  pending: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', label: 'Pending' },
  approved: { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Approved' },
  rejected: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', label: 'Rejected' },
  archived: { bg: 'var(--color-info-light)', color: 'var(--color-info)', label: 'Archived' },
  // Campaign
  draft: { bg: '#f3f4f6', color: '#6b7280', label: 'Draft' },
  active: { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'In Progress' },
  ended: { bg: '#f3f4f6', color: '#6b7280', label: 'Ended' },
  // Order
  paid: { bg: 'var(--color-info-light)', color: 'var(--color-info)', label: 'Paid' },
  shipped: { bg: 'var(--color-accent-light)', color: 'var(--color-accent)', label: 'Shipped' },
  delivered: { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Delivered' },
  cancelled: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', label: 'Cancelled' },
  refunded: { bg: '#f3f4f6', color: '#6b7280', label: 'Refunded' },
  // Donation
  completed: { bg: 'var(--color-success-light)', color: 'var(--color-success)', label: 'Completed' },
  failed: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', label: 'Failed' },
  // User
  disabled: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', label: 'Disabled' },
  // Child participant
  withdrawn: { bg: '#f3f4f6', color: '#6b7280', label: 'Withdrawn' },
  pending_review: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', label: 'Under Review' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = statusStyles[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {label || style.label}
    </span>
  );
}
