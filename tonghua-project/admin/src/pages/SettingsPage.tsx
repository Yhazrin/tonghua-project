import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { fetchSystemSettings, updateSystemSettings } from '../services/api';
import type { SystemSettings } from '../types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  const { data } = useQuery({ queryKey: ['settings'], queryFn: fetchSystemSettings });

  useEffect(() => {
    if (data) setForm(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
  });

  if (!form) return <div>Loading...</div>;

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const tabs = [
    { key: 'general', label: 'General Settings' },
    { key: 'payment', label: 'Payment Config' },
    { key: 'security', label: 'Security Settings' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>System Settings</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Manage platform configuration and API keys
          </p>
        </div>
        <Button variant="primary" loading={updateMutation.isPending} onClick={handleSave}>
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        borderBottom: '2px solid var(--color-border)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 500,
              color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: activeTab === tab.key ? -2 : 0,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div style={{
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: 24,
        }}>
          <Section title="Site Information">
            <Field label="Site Name">
              <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Site Description">
              <textarea value={form.siteDescription} onChange={(e) => setForm({ ...form, siteDescription: e.target.value })} style={{ ...inputStyle, height: 80 }} />
            </Field>
            <Field label="Contact Email">
              <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} style={inputStyle} type="email" />
            </Field>
          </Section>

          <Section title="Feature Toggles">
            <Toggle label="Donations" checked={form.donationEnabled} onChange={(v) => setForm({ ...form, donationEnabled: v })} />
            <Toggle label="Shop" checked={form.shopEnabled} onChange={(v) => setForm({ ...form, shopEnabled: v })} />
            <Toggle label="User Registration" checked={form.registrationEnabled} onChange={(v) => setForm({ ...form, registrationEnabled: v })} />
            <Toggle label="Maintenance Mode" checked={form.maintenanceMode} onChange={(v) => setForm({ ...form, maintenanceMode: v })} description="When enabled, the front-end will display a maintenance page" />
          </Section>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div style={{
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: 24,
        }}>
          {(['wechat', 'alipay', 'stripe', 'paypal'] as const).map((method) => (
            <Section key={method} title={method === 'wechat' ? 'WeChat Pay' : method === 'alipay' ? 'Alipay' : method.charAt(0).toUpperCase() + method.slice(1)}>
              <Toggle
                label="Enabled"
                checked={form.paymentMethods[method].enabled}
                onChange={(v) => setForm({
                  ...form,
                  paymentMethods: {
                    ...form.paymentMethods,
                    [method]: { ...form.paymentMethods[method], enabled: v },
                  },
                })}
              />
              {(form.paymentMethods[method] as any).appId !== undefined && (
                <Field label="App ID">
                  <input
                    type="password"
                    value={(form.paymentMethods[method] as any).appId || ''}
                    onChange={(e) => setForm({
                      ...form,
                      paymentMethods: {
                        ...form.paymentMethods,
                        [method]: { ...form.paymentMethods[method], appId: e.target.value },
                      },
                    })}
                    style={inputStyle}
                    placeholder="Enter App ID"
                  />
                </Field>
              )}
              {(form.paymentMethods[method] as any).merchantId !== undefined && (
                <Field label="Merchant ID">
                  <input
                    type="password"
                    value={(form.paymentMethods[method] as any).merchantId || ''}
                    onChange={(e) => setForm({
                      ...form,
                      paymentMethods: {
                        ...form.paymentMethods,
                        [method]: { ...form.paymentMethods[method], merchantId: e.target.value },
                      },
                    })}
                    style={inputStyle}
                    placeholder="Enter Merchant ID"
                  />
                </Field>
              )}
              {(form.paymentMethods[method] as any).publicKey !== undefined && (
                <Field label="Public Key">
                  <input
                    type="password"
                    value={(form.paymentMethods[method] as any).publicKey || ''}
                    onChange={(e) => setForm({
                      ...form,
                      paymentMethods: {
                        ...form.paymentMethods,
                        [method]: { ...form.paymentMethods[method], publicKey: e.target.value },
                      },
                    })}
                    style={inputStyle}
                    placeholder="pk_test_..."
                  />
                </Field>
              )}
              {(form.paymentMethods[method] as any).clientId !== undefined && (
                <Field label="Client ID">
                  <input
                    type="password"
                    value={(form.paymentMethods[method] as any).clientId || ''}
                    onChange={(e) => setForm({
                      ...form,
                      paymentMethods: {
                        ...form.paymentMethods,
                        [method]: { ...form.paymentMethods[method], clientId: e.target.value },
                      },
                    })}
                    style={inputStyle}
                    placeholder="Enter Client ID"
                  />
                </Field>
              )}
            </Section>
          ))}
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div style={{
          background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: 24,
        }}>
          <Section title="Authentication Config">
            <Field label="Access Token Expiry">
              <input value="15 minutes" disabled style={{ ...inputStyle, opacity: 0.6 }} />
            </Field>
            <Field label="Refresh Token Expiry">
              <input value="7 days" disabled style={{ ...inputStyle, opacity: 0.6 }} />
            </Field>
          </Section>
          <Section title="API Security">
            <Field label="Global Rate Limit">
              <input value="1000 QPS" disabled style={{ ...inputStyle, opacity: 0.6 }} />
            </Field>
            <Field label="User Rate Limit">
              <input value="60 QPM" disabled style={{ ...inputStyle, opacity: 0.6 }} />
            </Field>
          </Section>
          <div style={{ padding: '12px 16px', background: 'var(--color-info-light)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#1e40af', marginTop: 8 }}>
            Security settings are configured at the code level by security engineers. Admins cannot modify them here. Please contact the technical team for changes.
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--color-border-light)' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? 'var(--color-accent)' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2,
          left: checked ? 22 : 2,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
};
