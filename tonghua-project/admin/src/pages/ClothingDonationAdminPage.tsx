import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import v1Api from '../services/v1Api';

const STATUS_OPTIONS = [
  { value: '', label: '全部' }, { value: 'submitted', label: '已提交' }, { value: 'scheduled', label: '已安排取件' },
  { value: 'picked_up', label: '已取件' }, { value: 'processing', label: '处理中' },
  { value: 'converted', label: '已转化' }, { value: 'completed', label: '完成' }, { value: 'rejected', label: '已拒绝' },
];

const CONDITION_LABELS: Record<string, string> = { new: '全新', like_new: '近全新', good: '良好', fair: '一般' };
const STATUS_COLORS: Record<string, string> = {
  submitted: '#f59e0b', scheduled: '#3b82f6', picked_up: '#3b82f6',
  processing: '#8b5cf6', converted: '#10b981', completed: '#10b981', rejected: '#ef4444',
};

interface ClothingDonationItem {
  id: number; user_id: number; clothing_type: string; quantity: number;
  condition: string; status: string; pickup_address: string | null;
  converted_product_id: number | null; admin_note: string | null;
  description: string | null; created_at: string;
}

export default function ClothingDonationAdminPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [selected, setSelected] = useState<ClothingDonationItem | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [productId, setProductId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-clothing', page, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await v1Api.get('/ai/clothing-donations', { params });
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => { await v1Api.put(`/ai/clothing-donations/${id}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-clothing'] }); setShowModal(false); },
  });

  const records: ClothingDonationItem[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const openModal = (row: ClothingDonationItem) => {
    setSelected(row);
    setUpdateStatus(row.status);
    setProductId(row.converted_product_id ? String(row.converted_product_id) : '');
    setAdminNote(row.admin_note || '');
    setShowModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>衣物捐献管理</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={sel}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-table)' }}>
              {['ID', '用户', '类型', '件数', '状态', '衣物情况', '取件地址', '关联商品', '时间', '操作'].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={10} style={empty}>加载中…</td></tr>
              : records.length === 0 ? <tr><td colSpan={10} style={empty}>暂无记录</td></tr>
              : records.map((row) => (
              <tr key={row.id}>
                <td style={td}>{row.id}</td>
                <td style={td}>#{row.user_id}</td>
                <td style={td}>{row.clothing_type}</td>
                <td style={td}>{row.quantity}</td>
                <td style={td}><span style={{ ...badg, background: `${STATUS_COLORS[row.status]}20`, color: STATUS_COLORS[row.status] }}>{STATUS_OPTIONS.find(o => o.value === row.status)?.label || row.status}</span></td>
                <td style={td}>{CONDITION_LABELS[row.condition] || row.condition}</td>
                <td style={td}>{row.pickup_address ? <span title={row.pickup_address}>{row.pickup_address.slice(0, 12)}…</span> : '—'}</td>
                <td style={td}>{row.converted_product_id ? `#${row.converted_product_id}` : '—'}</td>
                <td style={td}>{new Date(row.created_at).toLocaleDateString('zh-CN')}</td>
                <td style={td}><button style={btnS} onClick={() => openModal(row)}>处理</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button style={btnG} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
          <span style={{ padding: '5px 10px', fontSize: 13, color: 'var(--color-text-muted)' }}>{page}/{totalPages}</span>
          <button style={btnG} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      )}

      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 12, padding: 24, width: 460, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>处理捐献申请 #{selected.id}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12, background: 'var(--color-bg-table)', borderRadius: 6, marginBottom: 16 }}>
              {[['衣物类型', selected.clothing_type], ['件数', String(selected.quantity)], ['衣物状态', CONDITION_LABELS[selected.condition] || selected.condition], ['取件地址', selected.pickup_address || '暂无']].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{l}</div><div style={{ fontSize: 13 }}>{v}</div></div>
              ))}
            </div>
            {selected.description && <div style={{ padding: 10, background: 'var(--color-bg-table)', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{selected.description}</div>}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>处理状态</label>
              <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} style={{ ...sel, width: '100%' }}>
                {STATUS_OPTIONS.filter(o => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {updateStatus === 'converted' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>关联商品ID</label>
                <input type="number" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="转化后的商品ID" style={{ ...sel, width: '100%', boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>备注</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} placeholder="处理备注（可选）"
                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12, resize: 'none', boxSizing: 'border-box', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={btnG} onClick={() => setShowModal(false)}>取消</button>
              <button style={{ ...btnP, padding: '8px 20px' }} onClick={() => updateMutation.mutate({ id: selected.id, data: { status: updateStatus, admin_note: adminNote, ...(productId ? { converted_product_id: parseInt(productId) } : {}) } })} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sel: React.CSSProperties = { padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 13 };
const tableWrap: React.CSSProperties = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' };
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' };
const empty: React.CSSProperties = { textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' };
const badg: React.CSSProperties = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 };
const btnS: React.CSSProperties = { padding: '5px 10px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-primary)' };
const btnG: React.CSSProperties = { padding: '5px 10px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-primary)' };
const btnP: React.CSSProperties = { background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 };
