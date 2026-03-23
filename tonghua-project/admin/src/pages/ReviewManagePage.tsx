import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import v1Api from '../services/v1Api';

const STATUS_OPTS = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

const STATUS_COLORS: Record<string, string> = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };

interface Review {
  id: number; product_id: number; user_id: number; order_id: number;
  rating: number; sustainability_rating: number | null;
  title: string | null; content: string | null; status: string; created_at: string;
}

export default function ReviewManagePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, statusFilter],
    queryFn: async () => {
      const res = await v1Api.get('/reviews/pending', { params: { page, page_size: 20 } });
      return res.data;
    },
    enabled: statusFilter === 'pending',
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { await v1Api.put(`/reviews/${id}`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  const records: Review[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>评价审核</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUS_OPTS.map((opt) => (
            <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              style={{ padding: '7px 14px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: statusFilter === opt.value ? 'var(--color-accent)' : 'var(--color-bg-card)', color: statusFilter === opt.value ? '#fff' : 'var(--color-text-primary)' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-table)' }}>
              {['ID', '商品', '用户', '评分', '可持续', '标题', '内容摘要', '状态', '时间', '操作'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>加载中…</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>暂无评价</td></tr>
            ) : records.map((row) => (
              <tr key={row.id}>
                {[row.id, `#${row.product_id}`, `#${row.user_id}`].map((v, i) => (
                  <td key={i} style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}>{v}</td>
                ))}
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: '#f59e0b' }}>{'★'.repeat(row.rating)}</span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                  {row.sustainability_rating ? <span style={{ color: '#10b981' }}>{'✦'.repeat(row.sustainability_rating)}</span> : '—'}
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}>{row.title || '—'}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}>
                  {row.content ? <span title={row.content}>{row.content.slice(0, 30)}{row.content.length > 30 ? '…' : ''}</span> : '—'}
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: `${STATUS_COLORS[row.status]}20`, color: STATUS_COLORS[row.status] }}>
                    {STATUS_OPTS.find(o => o.value === row.status)?.label || row.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}>{new Date(row.created_at).toLocaleDateString('zh-CN')}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '4px 10px', background: 'var(--color-success-light)', color: 'var(--color-success)', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
                      onClick={() => updateMutation.mutate({ id: row.id, status: 'approved' })}>通过</button>
                    <button style={{ padding: '4px 10px', background: 'var(--color-danger-light)', color: 'var(--color-danger)', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
                      onClick={() => updateMutation.mutate({ id: row.id, status: 'rejected' })}>拒绝</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button style={{ padding: '5px 10px', border: '1px solid var(--color-border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--color-text-primary)' }} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
          <span style={{ padding: '5px 10px', fontSize: 13, color: 'var(--color-text-muted)' }}>{page}/{totalPages}</span>
          <button style={{ padding: '5px 10px', border: '1px solid var(--color-border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--color-text-primary)' }} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      )}
    </div>
  );
}
