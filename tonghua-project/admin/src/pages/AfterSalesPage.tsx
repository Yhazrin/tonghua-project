import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import v1Api from '../services/v1Api';

const TYPE_LABELS: Record<string, string> = { return: '退货退款', exchange: '换货', repair: '维修', complaint: '投诉', inquiry: '咨询' };

const STATUS_OPTIONS = [
  { value: '', label: '全部' }, { value: 'submitted', label: '已提交' }, { value: 'reviewing', label: '审核中' },
  { value: 'approved', label: '已批准' }, { value: 'rejected', label: '已拒绝' }, { value: 'processing', label: '处理中' }, { value: 'completed', label: '已完成' },
];

const STATUS_COLORS: Record<string, string> = {
  submitted: '#f59e0b', reviewing: '#3b82f6', approved: '#10b981',
  rejected: '#ef4444', processing: '#3b82f6', completed: '#10b981',
};

interface AfterSalesItem {
  id: number; order_id: number; user_id: number; request_type: string;
  reason: string; status: string; refund_amount: string | null; created_at: string;
}

interface Message { id: number; sender_role: string; content: string; created_at: string; }

interface Detail extends AfterSalesItem { description: string | null; messages: Message[]; admin_note: string | null; }

export default function AfterSalesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [selected, setSelected] = useState<AfterSalesItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-after-sales', page, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await v1Api.get('/after-sales', { params });
      return res.data;
    },
  });

  const { data: detailData } = useQuery<Detail>({
    queryKey: ['after-sales-detail', selected?.id],
    queryFn: async () => { const res = await v1Api.get(`/after-sales/${selected!.id}`); return res.data.data; },
    enabled: !!selected,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => { await v1Api.post(`/after-sales/${id}/messages`, { content }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['after-sales-detail'] }); setReplyText(''); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => { await v1Api.put(`/after-sales/${id}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-after-sales', 'after-sales-detail'] }); },
  });

  const records: AfterSalesItem[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* List */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>售后管理</h1>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={sel}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-table)' }}>
                {['ID', '订单', '用户', '类型', '原因', '状态', '提交时间', '操作'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>加载中…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>暂无售后申请</td></tr>
              ) : records.map((row) => (
                <tr key={row.id} style={{ cursor: 'pointer', background: selected?.id === row.id ? 'var(--color-accent-light)' : 'transparent' }} onClick={() => { setSelected(row); setUpdateStatus(row.status); setAdminNote(''); }}>
                  <td style={td}>{row.id}</td>
                  <td style={td}>#{row.order_id}</td>
                  <td style={td}>#{row.user_id}</td>
                  <td style={td}>{TYPE_LABELS[row.request_type] || row.request_type}</td>
                  <td style={td}><span title={row.reason}>{row.reason.slice(0, 16)}{row.reason.length > 16 ? '…' : ''}</span></td>
                  <td style={td}><span style={{ ...badge, background: `${STATUS_COLORS[row.status]}20`, color: STATUS_COLORS[row.status] }}>{STATUS_OPTIONS.find(o => o.value === row.status)?.label || row.status}</span></td>
                  <td style={td}>{new Date(row.created_at).toLocaleDateString('zh-CN')}</td>
                  <td style={td}><button style={btnS} onClick={(e) => { e.stopPropagation(); setSelected(row); setUpdateStatus(row.status); setAdminNote(''); }}>处理</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button style={btnG} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
            <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>{page}/{totalPages}</span>
            <button style={btnG} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && detailData && (
        <div style={{ width: 360, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 20, height: 'fit-content', flexShrink: 0, maxHeight: '80vh', overflowY: 'auto' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>售后申请 #{detailData.id}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[['类型', TYPE_LABELS[detailData.request_type]], ['原因', detailData.reason], ['状态', STATUS_OPTIONS.find(o => o.value === detailData.status)?.label || detailData.status]].map(([label, value]) => (
              <div key={label}><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</div><div style={{ fontSize: 13 }}>{value}</div></div>
            ))}
          </div>

          {detailData.description && (
            <div style={{ padding: 10, background: 'var(--color-bg-table)', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{detailData.description}</div>
          )}

          {/* Messages */}
          {detailData.messages?.length > 0 && (
            <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 12 }}>
              {detailData.messages.map((m) => (
                <div key={m.id} style={{ padding: '6px 10px', marginBottom: 6, borderRadius: 4, background: m.sender_role === 'admin' ? 'var(--color-accent)15' : 'var(--color-bg-table)', borderLeft: `3px solid ${m.sender_role === 'admin' ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{m.sender_role === 'admin' ? '客服' : '用户'}</div>
                  <div style={{ fontSize: 13 }}>{m.content}</div>
                </div>
              ))}
            </div>
          )}

          {!['completed', 'rejected'].includes(detailData.status) && (
            <div style={{ marginBottom: 16 }}>
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="回复内容…" rows={2}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12, resize: 'none', boxSizing: 'border-box', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }} />
              <button style={{ ...btnS, marginTop: 6 }} onClick={() => replyMutation.mutate({ id: detailData.id, content: replyText })} disabled={!replyText.trim() || replyMutation.isPending}>发送</button>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} style={{ ...sel, flex: 1 }}>
                {STATUS_OPTIONS.filter(o => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input type="number" placeholder="退款金额" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)}
                style={{ width: 100, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }} />
            </div>
            <input type="text" placeholder="备注（可选）" value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
              style={{ ...sel, width: '100%', marginBottom: 8, boxSizing: 'border-box' }} />
            <button style={btnP} onClick={() => updateMutation.mutate({ id: detailData.id, data: { status: updateStatus, admin_note: adminNote, ...(refundAmount ? { refund_amount: parseFloat(refundAmount), refund_status: 'processing' } : {}) } })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '更新中…' : '更新状态'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const sel: React.CSSProperties = { padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 13 };
const tableWrap: React.CSSProperties = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' };
const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' };
const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' };
const badge: React.CSSProperties = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 };
const btnS: React.CSSProperties = { padding: '5px 10px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-primary)' };
const btnG: React.CSSProperties = { padding: '5px 10px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 5, fontSize: 12, cursor: 'pointer', color: 'var(--color-text-primary)' };
const btnP: React.CSSProperties = { width: '100%', padding: '8px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 };
