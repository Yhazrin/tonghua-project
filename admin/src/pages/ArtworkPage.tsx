import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { fetchArtworks, updateArtworkStatus } from '../services/api';
import type { Artwork } from '../types';
import dayjs from 'dayjs';

const columns: Column<Artwork>[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'title', title: 'Title', sorter: true },
  { key: 'childName', title: 'Author', width: 100 },
  { key: 'category', title: 'Category', width: 100 },
  { key: 'votes', title: 'Votes', width: 80, sorter: true },
  { key: 'status', title: 'Status', width: 100, render: (v) => <StatusBadge status={v} /> },
  { key: 'createdAt', title: 'Submitted', width: 160, sorter: true, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
  { key: 'action', title: 'Actions', width: 200 },
];

export default function ArtworkPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [detailModal, setDetailModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['artworks', page, statusFilter, search, sortBy, sortOrder],
    queryFn: () => fetchArtworks({ page, pageSize: 10, status: statusFilter || undefined, search: search || undefined, sortBy, sortOrder }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Artwork['status'] }) => updateArtworkStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      toast.success(vars.status === 'approved' ? 'Artwork approved' : 'Artwork rejected');
    },
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const renderColumns: Column<Artwork>[] = columns.map((col) => {
    if (col.key === 'action') {
      return {
        ...col,
        render: (_: any, record: Artwork) => (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedArtwork(record); setDetailModal(true); }}>
              View
            </Button>
            {record.status === 'pending' && (
              <>
                <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: record.id, status: 'approved' }); }}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: record.id, status: 'rejected' }); }}>
                  Reject
                </Button>
              </>
            )}
          </div>
        ),
      };
    }
    return col;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Artwork Management</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Review and manage children's artworks
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Search artworks..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '8px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, width: 220, outline: 'none',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, outline: 'none',
            background: 'var(--color-bg-card)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DataTable
        columns={renderColumns}
        data={data?.data || []}
        rowKey="id"
        loading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(record) => { setSelectedArtwork(record); setDetailModal(true); }}
      />

      <Pagination
        page={page}
        totalPages={data?.totalPages || 1}
        total={data?.total || 0}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Detail Modal */}
      <Modal
        open={detailModal}
        title="Artwork Details"
        onClose={() => setDetailModal(false)}
        width={560}
        footer={
          selectedArtwork?.status === 'pending' ? (
            <>
              <Button variant="secondary" onClick={() => setDetailModal(false)}>Close</Button>
              <Button variant="danger" onClick={() => { updateMutation.mutate({ id: selectedArtwork.id, status: 'rejected' }); setDetailModal(false); }}>Reject</Button>
              <Button variant="primary" onClick={() => { updateMutation.mutate({ id: selectedArtwork.id, status: 'approved' }); setDetailModal(false); }}>Approve</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setDetailModal(false)}>Close</Button>
          )
        }
      >
        {selectedArtwork && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              width: '100%', height: 200,
              background: '#f5f3f0', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-light)', fontSize: 13,
            }}>
              [Artwork Image Preview]
            </div>
            <DetailRow label="Artwork ID" value={selectedArtwork.id} />
            <DetailRow label="Title" value={selectedArtwork.title} />
            <DetailRow label="Author" value={`${selectedArtwork.childName} (age ${selectedArtwork.childAge})`} />
            <DetailRow label="Category" value={selectedArtwork.category} />
            <DetailRow label="Votes" value={selectedArtwork.votes.toString()} />
            <DetailRow label="Status" value={<StatusBadge status={selectedArtwork.status} />} />
            <DetailRow label="Submitted" value={dayjs(selectedArtwork.createdAt).format('YYYY-MM-DD HH:mm:ss')} />
            {selectedArtwork.reviewedAt && (
              <>
                <DetailRow label="Reviewed At" value={dayjs(selectedArtwork.reviewedAt).format('YYYY-MM-DD HH:mm:ss')} />
                <DetailRow label="Reviewed By" value={selectedArtwork.reviewedBy || '-'} />
              </>
            )}
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedArtwork.description}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
