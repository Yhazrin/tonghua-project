import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { fetchUsers, updateUserRole, updateUserStatus } from '../services/api';
import type { User } from '../types';
import dayjs from 'dayjs';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Visitor',
  auditor: 'Auditor',
};

export default function UserPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [statusConfirm, setStatusConfirm] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => fetchUsers({ page, pageSize: 10, search: search || undefined }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User['role'] }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
      setSelectedUser(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: User['status'] }) => updateUserStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(vars.status === 'disabled' ? 'User disabled' : 'User enabled');
    },
  });

  const columns: Column<User>[] = [
    { key: 'id', title: 'ID', width: 90 },
    { key: 'username', title: 'Username', sorter: true },
    { key: 'email', title: 'Email', width: 200 },
    { key: 'role', title: 'Role', width: 100, render: (v) => (
      <span style={{
        padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
        background: v === 'admin' ? 'var(--color-accent-light)' : '#f3f4f6',
        color: v === 'admin' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      }}>
        {roleLabels[v] || v}
      </span>
    )},
    { key: 'status', title: 'Status', width: 100, render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', title: 'Registered', width: 140, render: (v) => dayjs(v).format('YYYY-MM-DD') },
    { key: 'lastLogin', title: 'Last Login', width: 140, render: (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      key: 'action', title: 'Actions', width: 200,
      render: (_: any, record: User) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedUser(record); setEditRole(record.role); }}>
            Edit Role
          </Button>
          <Button
            size="sm"
            variant={record.status === 'active' ? 'danger' : 'secondary'}
            onClick={(e) => {
              e.stopPropagation();
              setStatusConfirm(record);
            }}
          >
            {record.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>User Management</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Manage platform users and role permissions
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text" placeholder="Search username or email..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={filterStyle}
        />
      </div>

      <DataTable columns={columns} data={data?.data || []} rowKey="id" loading={isLoading} />
      <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} pageSize={10} onPageChange={setPage} />

      {/* Role Edit Modal */}
      <Modal
        open={!!selectedUser}
        title="Edit User Role"
        onClose={() => setSelectedUser(null)}
        width={400}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button variant="primary" loading={roleMutation.isPending} onClick={() => {
              if (selectedUser && editRole) {
                roleMutation.mutate({ id: selectedUser.id, role: editRole as User['role'] });
              }
            }}>
              Save
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px', background: '#f9f9f7', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedUser.username}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedUser.email}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Select Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                style={{ ...filterStyle, width: '100%' }}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Visitor</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-light)', padding: '8px 12px', background: 'var(--color-warning-light)', borderRadius: 'var(--radius-sm)' }}>
              Note: Role changes take effect immediately. Please proceed with caution.
            </div>
          </div>
        )}
      </Modal>

      {/* Status Confirm Modal */}
      <Modal
        open={!!statusConfirm}
        title={statusConfirm?.status === 'active' ? 'Confirm Disable User' : 'Confirm Enable User'}
        onClose={() => setStatusConfirm(null)}
        width={400}
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusConfirm(null)}>Cancel</Button>
            <Button
              variant={statusConfirm?.status === 'active' ? 'danger' : 'primary'}
              loading={statusMutation.isPending}
              onClick={() => {
                if (statusConfirm) {
                  statusMutation.mutate({
                    id: statusConfirm.id,
                    status: statusConfirm.status === 'active' ? 'disabled' : 'active',
                  }, { onSuccess: () => setStatusConfirm(null) });
                }
              }}
            >
              {statusConfirm?.status === 'active' ? 'Confirm Disable' : 'Confirm Enable'}
            </Button>
          </>
        }
      >
        {statusConfirm && (
          <div>
            <p style={{ fontSize: 14, margin: '0 0 8px' }}>
              {statusConfirm.status === 'active'
                ? `Are you sure you want to disable user "${statusConfirm.username}"? The user will not be able to log in after being disabled.`
                : `Are you sure you want to enable user "${statusConfirm.username}"?`}
            </p>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '8px 12px', background: '#f9f9f7', borderRadius: 'var(--radius-sm)' }}>
              Email: {statusConfirm.email}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: 13,
  background: 'var(--color-bg-card)', outline: 'none',
};
