import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { fetchChildParticipants } from '../services/api';
import type { ChildParticipant } from '../types';
import dayjs from 'dayjs';

export default function ChildAuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<ChildParticipant | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['childParticipants', page, search, statusFilter],
    queryFn: () => fetchChildParticipants({ page, pageSize: 10, search: search || undefined, status: statusFilter || undefined }),
    enabled: accessGranted,
  });

  const handleAccess = async () => {
    try {
      const response = await fetch('/api/v1/admin/auth/verify-audit-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accessCode }),
      });
      if (response.ok) {
        setAccessGranted(true);
      } else {
        alert('Invalid access code. Please contact the administrator.');
      }
    } catch {
      alert('Verification failed. Please try again.');
    }
  };

  // Access control gate
  if (!accessGranted) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Child Participant Audit</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Review child participant data (protected by strict access controls)
          </p>
        </div>

        <div style={{
          maxWidth: 440, margin: '80px auto', padding: 32,
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
            background: 'var(--color-danger-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-danger)">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Sensitive Data Area</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This page contains children's personal information, protected by the Personal Information Protection Law.<br />
            Please enter the audit access code to continue.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
              placeholder="Enter access code"
              style={{
                flex: 1, padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none',
              }}
            />
            <Button variant="primary" onClick={handleAccess}>Verify</Button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
            Contact the administrator for the access code
          </p>
        </div>
      </div>
    );
  }

  const columns: Column<ChildParticipant>[] = [
    { key: 'id', title: 'ID', width: 90 },
    { key: 'childName', title: 'Child Name' },
    { key: 'age', title: 'Age', width: 60 },
    { key: 'guardianName', title: 'Guardian' },
    { key: 'region', title: 'Region', width: 100 },
    { key: 'school', title: 'School', width: 120, render: (v) => v || '-' },
    { key: 'artworkCount', title: 'Artworks', width: 80 },
    { key: 'consentGiven', title: 'Consent', width: 80, render: (v) => v ? (
      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Signed</span>
    ) : (
      <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Not Signed</span>
    )},
    { key: 'status', title: 'Status', width: 100, render: (v) => <StatusBadge status={v} /> },
    {
      key: 'action', title: 'Actions', width: 80,
      render: (_: any, record: ChildParticipant) => (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(record); }}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Child Participant Audit</h1>
          <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: 'var(--color-danger-light)', color: 'var(--color-danger)',
          }}>
            Restricted Access
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          All access activities are logged in the audit trail. Viewing child information requires secondary approval.
        </p>
      </div>

      {/* Notice */}
      <div style={{
        padding: '12px 16px', background: 'var(--color-warning-light)',
        borderRadius: 'var(--radius-sm)', marginBottom: 16,
        fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        You are accessing a protected area containing children's personal information. Your actions will be logged.
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text" placeholder="Search by child name or guardian..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={filterStyle}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={filterStyle}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="pending_review">Pending Review</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.data || []} rowKey="id" loading={isLoading} />
      <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} pageSize={10} onPageChange={setPage} />

      {/* Detail Modal */}
      <Modal open={!!selected} title="Participant Details" onClose={() => setSelected(null)} width={520}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: '#991b1b' }}>
              The following information is protected by the Personal Information Protection Law. Unauthorized disclosure is prohibited.
            </div>
            <Row label="Child Name" value={selected.childName} />
            <Row label="Age" value={`${selected.age} years old`} />
            <Row label="Guardian" value={selected.guardianName} />
            <Row label="Guardian Phone" value={selected.guardianPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')} />
            <Row label="Guardian Email" value={selected.guardianEmail.replace(/(.{2}).+(@.+)/, '$1***$2')} />
            <Row label="Region" value={selected.region} />
            <Row label="School" value={selected.school || '-'} />
            <Row label="Consent" value={selected.consentGiven ? `Signed (${dayjs(selected.consentDate).format('YYYY-MM-DD')})` : 'Not Signed'} />
            <Row label="Artworks" value={selected.artworkCount.toString()} />
            <Row label="Status" value={<StatusBadge status={selected.status} />} />
            <Row label="Joined" value={dayjs(selected.createdAt).format('YYYY-MM-DD')} />
            {selected.lastActivity && <Row label="Last Activity" value={dayjs(selected.lastActivity).format('YYYY-MM-DD HH:mm')} />}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: 13,
  background: 'var(--color-bg-card)', outline: 'none',
};
