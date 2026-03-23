import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import v1Api from '../services/v1Api';

type LogisticsStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

const STATUS_LABELS: Record<LogisticsStatus | string, string> = {
  pending: '待揽收',
  picked_up: '已揽收',
  in_transit: '运输中',
  out_for_delivery: '派送中',
  delivered: '已签收',
  exception: '异常',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#6b7280',
  picked_up: '#3b82f6',
  in_transit: '#3b82f6',
  out_for_delivery: '#f59e0b',
  delivered: '#10b981',
  exception: '#ef4444',
};

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待揽收' },
  { value: 'picked_up', label: '已揽收' },
  { value: 'in_transit', label: '运输中' },
  { value: 'out_for_delivery', label: '派送中' },
  { value: 'delivered', label: '已签收' },
  { value: 'exception', label: '异常' },
];

interface Logistics {
  id: number;
  order_id: number;
  tracking_no: string | null;
  carrier: string | null;
  status: string;
  current_location: string | null;
  updated_at: string;
}

export default function LogisticsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Logistics | null>(null);
  const [modalType, setModalType] = useState<'update' | 'event' | null>(null);
  const [updateForm, setUpdateForm] = useState({ status: '', current_location: '', tracking_no: '', carrier: '' });
  const [eventForm, setEventForm] = useState({ status: '', location: '', description: '', event_time: new Date().toISOString().slice(0, 16) });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logistics', page, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await v1Api.get('/logistics', { params });
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, string> }) => {
      await v1Api.put(`/logistics/${id}`, data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-logistics'] }); setModalType(null); },
  });

  const addEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, string> }) => {
      await v1Api.post(`/logistics/${id}/events`, { ...data, event_time: new Date(data.event_time).toISOString() });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-logistics'] }); setModalType(null); },
  });

  const records: Logistics[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>物流管理</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-table)' }}>
              {['ID', '订单ID', '运单号', '快递公司', '状态', '当前位置', '更新时间', '操作'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>加载中…</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>暂无物流记录</td></tr>
            ) : records.map((row) => (
              <tr key={row.id} style={trStyle}>
                <td style={tdStyle}>{row.id}</td>
                <td style={tdStyle}>{row.order_id}</td>
                <td style={tdStyle}>{row.tracking_no || '—'}</td>
                <td style={tdStyle}>{row.carrier || '—'}</td>
                <td style={tdStyle}>
                  <span style={{ ...badgeStyle, background: `${STATUS_COLORS[row.status]}20`, color: STATUS_COLORS[row.status] }}>
                    {STATUS_LABELS[row.status] || row.status}
                  </span>
                </td>
                <td style={tdStyle}>{row.current_location || '—'}</td>
                <td style={tdStyle}>{new Date(row.updated_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={tdStyle}>
                  <button style={btnSecondary} onClick={() => { setSelected(row); setUpdateForm({ status: row.status, current_location: row.current_location || '', tracking_no: row.tracking_no || '', carrier: row.carrier || '' }); setModalType('update'); }}>更新</button>
                  <button style={{ ...btnGhost, marginLeft: 6 }} onClick={() => { setSelected(row); setEventForm({ status: row.status, location: '', description: '', event_time: new Date().toISOString().slice(0, 16) }); setModalType('event'); }}>+事件</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button style={btnGhost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>{page} / {totalPages}</span>
          <button style={btnGhost} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</button>
        </div>
      )}

      {/* Update Modal */}
      {modalType === 'update' && selected && (
        <div style={overlay}>
          <div style={modalCard}>
            <h3 style={modalTitle}>更新物流状态 #{selected.id}</h3>
            {[
              { key: 'status', label: '状态', type: 'select' as const },
              { key: 'tracking_no', label: '运单号', type: 'text' as const, placeholder: '运单号' },
              { key: 'carrier', label: '快递公司', type: 'text' as const, placeholder: '快递公司名称' },
              { key: 'current_location', label: '当前位置', type: 'text' as const, placeholder: '当前位置' },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={updateForm[f.key as keyof typeof updateForm]} onChange={(e) => setUpdateForm((p) => ({ ...p, [f.key]: e.target.value }))} style={inputStyle}>
                    {STATUS_OPTIONS.filter(o => o.value).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : (
                  <input type="text" value={updateForm[f.key as keyof typeof updateForm]} onChange={(e) => setUpdateForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button style={btnGhost} onClick={() => setModalType(null)}>取消</button>
              <button style={btnPrimary} onClick={() => updateMutation.mutate({ id: selected.id, data: updateForm })} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {modalType === 'event' && selected && (
        <div style={overlay}>
          <div style={modalCard}>
            <h3 style={modalTitle}>添加物流事件 #{selected.id}</h3>
            {[
              { key: 'status', label: '事件状态', type: 'select' as const },
              { key: 'location', label: '事件地点', type: 'text' as const, placeholder: '事件地点' },
              { key: 'description', label: '事件描述', type: 'text' as const, placeholder: '描述此物流节点' },
              { key: 'event_time', label: '事件时间', type: 'datetime-local' as const },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={eventForm[f.key as keyof typeof eventForm]} onChange={(e) => setEventForm((p) => ({ ...p, [f.key]: e.target.value }))} style={inputStyle}>
                    {STATUS_OPTIONS.filter(o => o.value).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={eventForm[f.key as keyof typeof eventForm]} onChange={(e) => setEventForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={'placeholder' in f ? f.placeholder : undefined} style={inputStyle} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button style={btnGhost} onClick={() => setModalType(null)}>取消</button>
              <button style={btnPrimary} onClick={() => addEventMutation.mutate({ id: selected.id, data: eventForm })} disabled={addEventMutation.isPending}>
                {addEventMutation.isPending ? '添加中…' : '添加事件'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const selectStyle: React.CSSProperties = { padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 13 };
const tableWrap: React.CSSProperties = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' };
const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' };
const trStyle: React.CSSProperties = {};
const badgeStyle: React.CSSProperties = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 };
const btnPrimary: React.CSSProperties = { padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 };
const btnSecondary: React.CSSProperties = { padding: '5px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-primary)' };
const btnGhost: React.CSSProperties = { padding: '5px 12px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-primary)' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalCard: React.CSSProperties = { background: 'var(--color-bg-card)', borderRadius: 12, padding: 24, width: 480, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' };
const modalTitle: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 13, boxSizing: 'border-box' };
