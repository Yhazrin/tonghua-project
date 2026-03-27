import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { fetchCampaigns, createCampaign, updateCampaign } from '../services/api';
import type { Campaign } from '../types';
import dayjs from 'dayjs';

export default function CampaignPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', targetAmount: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, statusFilter],
    queryFn: () => fetchCampaigns({ page, pageSize: 10, status: statusFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
      setShowCreate(false);
      setForm({ title: '', description: '', startDate: '', endDate: '', targetAmount: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) => updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
      setEditCampaign(null);
    },
  });

  const columns: Column<Campaign>[] = [
    { key: 'title', title: 'Campaign Name', sorter: true },
    { key: 'status', title: 'Status', width: 100, render: (v) => <StatusBadge status={v} /> },
    { key: 'targetAmount', title: 'Target Amount', width: 120, render: (v) => `\u00a5${v.toLocaleString()}` },
    { key: 'raisedAmount', title: 'Raised Amount', width: 120, render: (v) => <span style={{ color: 'var(--color-success)' }}>\u00a5{v.toLocaleString()}</span> },
    { key: 'participantCount', title: 'Participants', width: 100 },
    { key: 'artworkCount', title: 'Artworks', width: 80 },
    { key: 'startDate', title: 'Start Date', width: 110 },
    { key: 'endDate', title: 'End Date', width: 110 },
    {
      key: 'action', title: 'Actions', width: 180,
      render: (_: any, record: Campaign) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditCampaign(record); }}>
            Edit
          </Button>
          {record.status === 'draft' && (
            <Button size="sm" variant="primary" onClick={(e) => {
              e.stopPropagation();
              updateMutation.mutate({ id: record.id, data: { status: 'active' } });
            }}>
              Activate
            </Button>
          )}
          {record.status === 'active' && (
            <Button size="sm" variant="secondary" onClick={(e) => {
              e.stopPropagation();
              updateMutation.mutate({ id: record.id, data: { status: 'ended' } });
            }}>
              End
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Please fill in the required fields');
      return;
    }
    createMutation.mutate({
      title: form.title,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      targetAmount: Number(form.targetAmount) || 0,
    });
  };

  const openEdit = (campaign: Campaign) => {
    setEditCampaign(campaign);
    setForm({
      title: campaign.title,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      targetAmount: String(campaign.targetAmount),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Campaign Management</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Create and manage charity campaigns
          </p>
        </div>
        <Button variant="primary" onClick={() => { setShowCreate(true); setForm({ title: '', description: '', startDate: '', endDate: '', targetAmount: '' }); }}>
          + Create Campaign
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--color-bg-card)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.data || []} rowKey="id" loading={isLoading} />
      <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} pageSize={10} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        open={showCreate || !!editCampaign}
        title={editCampaign ? 'Edit Campaign' : 'Create Campaign'}
        onClose={() => { setShowCreate(false); setEditCampaign(null); }}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreate(false); setEditCampaign(null); }}>Cancel</Button>
            <Button
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (editCampaign) {
                  updateMutation.mutate({ id: editCampaign.id, data: { title: form.title, description: form.description, startDate: form.startDate, endDate: form.endDate, targetAmount: Number(form.targetAmount) || 0 } });
                } else {
                  handleSubmit(e as any);
                }
              }}
            >
              {editCampaign ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Campaign Name *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Enter campaign name" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Enter campaign description" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={inputStyle} required />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Target Amount (\u00a5)</label>
            <input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} style={inputStyle} placeholder="0" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};
