import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { fetchDonations } from '../services/api';
import type { Donation } from '../types';
import dayjs from 'dayjs';

const paymentLabels: Record<string, string> = {
  wechat: 'WeChat Pay',
  alipay: 'Alipay',
  stripe: 'Stripe',
  paypal: 'PayPal',
};

export default function DonationPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['donations', page, statusFilter, search, paymentFilter],
    queryFn: () => fetchDonations({ page, pageSize: 10, status: statusFilter || undefined, search: search || undefined }),
  });

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    let items = data.data;
    if (paymentFilter) {
      items = items.filter((d) => d.paymentMethod === paymentFilter);
    }
    return items;
  }, [data, paymentFilter]);

  const totalAmount = useMemo(() => {
    return filteredData.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0);
  }, [filteredData]);

  const columns: Column<Donation>[] = [
    { key: 'id', title: 'ID', width: 90 },
    { key: 'donorName', title: 'Donor' },
    { key: 'amount', title: 'Amount', width: 120, sorter: true, render: (v, r) => (
      <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
        {r.currency === 'CNY' ? '\u00a5' : '$'}{v.toLocaleString()}
      </span>
    )},
    { key: 'paymentMethod', title: 'Payment Method', width: 100, render: (v) => paymentLabels[v] || v },
    { key: 'campaignTitle', title: 'Campaign', width: 160, render: (v) => v || '-' },
    { key: 'status', title: 'Status', width: 100, render: (v) => <StatusBadge status={v} /> },
    { key: 'isAnonymous', title: 'Anonymous', width: 60, render: (v) => v ? 'Yes' : 'No' },
    { key: 'createdAt', title: 'Donation Time', width: 160, sorter: true, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
  ];

  const handleExport = () => {
    const csvHeader = 'ID,Donor,Amount,Currency,Payment Method,Campaign,Status,Anonymous,Donation Time\n';
    const csvRows = filteredData.map((d) =>
      `${d.id},${d.donorName},${d.amount},${d.currency},${paymentLabels[d.paymentMethod]},${d.campaignTitle || ''},${d.status},${d.isAnonymous ? 'Yes' : 'No'},${dayjs(d.createdAt).format('YYYY-MM-DD HH:mm')}`
    ).join('\n');
    const blob = new Blob(['\ufeff' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Donation Management</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            View donation records and generate reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={handleExport}>Export CSV</Button>
          <Button variant="primary">Generate Report</Button>
        </div>
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20,
      }}>
        {[
          { label: 'Total Records', value: filteredData.length },
          { label: 'Total Amount', value: `\u00a5${totalAmount.toLocaleString()}` },
          { label: 'Completed', value: filteredData.filter((d) => d.status === 'completed').length },
          { label: 'Failed', value: filteredData.filter((d) => d.status === 'failed').length },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '16px 20px', background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search donors..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={filterStyle}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={filterStyle}>
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={filterStyle}>
          <option value="">All Payment Methods</option>
          <option value="wechat">WeChat Pay</option>
          <option value="alipay">Alipay</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredData} rowKey="id" loading={isLoading} />
      <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} pageSize={10} onPageChange={setPage} />
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: 13,
  background: 'var(--color-bg-card)', outline: 'none',
};
