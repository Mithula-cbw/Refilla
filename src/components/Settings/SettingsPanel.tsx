import { useState } from 'react';
import { X, FolderOpen, Download, Upload, RotateCcw, Bell, BellOff, Info } from 'lucide-react';
import { AppStore } from '@/types';
import { useToast } from '@/components/UI/ToastContext';
import { Button } from '@/components/UI/Button';
import { ConfirmDialog } from '@/components/UI/Modal';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  store: AppStore;
  onPersist: (updates: Partial<AppStore>) => Promise<void>;
  onTestNotification: () => void;
  version: string;
}

export function SettingsPanel({
  isOpen, onClose, store, onPersist, onTestNotification, version
}: SettingsPanelProps) {
  const { addToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetConfirm2, setShowResetConfirm2] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('replace');

  if (!isOpen) return null;

  const handleExport = async () => {
    const data = JSON.stringify(store, null, 2);
    const ok = await window.electronAPI.exportData(data);
    if (ok) addToast('Data exported successfully!', 'success');
    else addToast('Export cancelled', 'info');
  };

  const handleImport = async () => {
    const raw = await window.electronAPI.importData();
    if (!raw) { addToast('Import cancelled', 'info'); return; }
    try {
      const parsed = JSON.parse(raw);
      if (importMode === 'replace') {
        await onPersist(parsed);
        addToast('Data imported and replaced successfully!', 'success');
      } else {
        // Merge: concatenate arrays by id
        const merged: Partial<AppStore> = {};
        const arrKeys: (keyof AppStore)[] = ['services', 'accounts', 'vaultServices', 'vaultAccounts'];
        for (const key of arrKeys) {
          const existing = (store[key] as any[]) ?? [];
          const incoming = (parsed[key] as any[]) ?? [];
          const existingIds = new Set(existing.map((i: any) => i.id));
          merged[key] = [...existing, ...incoming.filter((i: any) => !existingIds.has(i.id))] as any;
        }
        await onPersist(merged);
        addToast('Data merged successfully!', 'success');
      }
    } catch {
      addToast('Invalid JSON file — import failed', 'error');
    }
  };

  const handleReset = async () => {
    setShowResetConfirm2(true);
  };

  const confirmReset = async () => {
    await onPersist({
      services: [], accounts: [], vaultServices: [], vaultAccounts: [],
      quotaFilter: 'all', quotaSort: 'name',
    });
    addToast('All data has been reset', 'warning');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90, backdropFilter: 'blur(1px)' }}
      />

      {/* Panel */}
      <div
        className="settings-panel"
        role="dialog"
        aria-label="Settings"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '340px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          zIndex: 91,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} aria-label="Close settings" style={closeBtnStyle}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ── Appearance ─────────────────────────────── */}
          <Section title="Appearance">
            <Row label="Theme">
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onPersist({ theme: t });
                      document.documentElement.classList.toggle('light', t === 'light');
                    }}
                    aria-pressed={store.theme === t}
                    style={{
                      padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                      background: store.theme === t ? 'rgba(56,139,253,0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${store.theme === t ? 'var(--blue)' : 'var(--border)'}`,
                      color: store.theme === t ? 'var(--blue)' : 'var(--text-secondary)',
                      transition: 'all 150ms',
                    }}
                  >
                    {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                ))}
              </div>
            </Row>
          </Section>

          {/* ── Notifications ──────────────────────────── */}
          <Section title="Notifications">
            <Row label="Desktop Notifications">
              <Toggle
                checked={store.notificationsEnabled}
                onChange={(v) => onPersist({ notificationsEnabled: v })}
                aria-label="Toggle desktop notifications"
              />
            </Row>
            <Row label="">
              <Button
                variant="secondary"
                size="sm"
                icon={store.notificationsEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                onClick={onTestNotification}
              >
                Test Notification
              </Button>
            </Row>
          </Section>

          {/* ── Data ───────────────────────────────────── */}
          <Section title="Data">
            <Row label="Open data folder">
              <Button variant="secondary" size="sm" icon={<FolderOpen size={13} />}
                onClick={() => window.electronAPI.openDataFolder()}>
                Open
              </Button>
            </Row>
            <Row label="Export all data">
              <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={handleExport}>
                Export JSON
              </Button>
            </Row>
            <Row label="Import mode">
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                aria-label="Import mode"
                style={{
                  padding: '5px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: '5px', color: 'var(--text-secondary)', fontSize: '12px',
                  cursor: 'pointer', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <option value="replace">Replace all</option>
                <option value="merge">Merge (keep existing)</option>
              </select>
            </Row>
            <Row label="Import data">
              <Button variant="secondary" size="sm" icon={<Upload size={13} />} onClick={handleImport}>
                Import JSON
              </Button>
            </Row>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <Button variant="danger" size="sm" icon={<RotateCcw size={13} />}
                onClick={() => setShowResetConfirm(true)}>
                Reset All Data
              </Button>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                This will delete all services, accounts, and vault entries permanently.
              </p>
            </div>
          </Section>

          {/* ── About ──────────────────────────────────── */}
          <Section title="About">
            <div style={{
              padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px',
              border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Refilla</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Version {version}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Built with Electron + React + TypeScript.<br />
                All data stored locally. No internet connection required.
              </p>
            </div>
          </Section>
        </div>
      </div>

      {/* First reset confirm */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => setShowResetConfirm2(true)}
        title="Reset All Data?"
        message="This will permanently delete all services, accounts, and vault entries. Are you sure?"
        confirmLabel="Yes, continue"
        destructive
      />

      {/* Second confirm (double confirmation) */}
      <ConfirmDialog
        isOpen={showResetConfirm2}
        onClose={() => setShowResetConfirm2(false)}
        onConfirm={confirmReset}
        title="Final Confirmation"
        message="This is irreversible. All your data will be gone. Type of confirm: click Delete."
        confirmLabel="Delete Everything"
        destructive
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '32px' }}>
      {label && <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, 'aria-label': ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; 'aria-label': string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        width: '40px', height: '22px', borderRadius: '99px', border: 'none',
        background: checked ? 'var(--green)' : 'var(--bg-tertiary)',
        cursor: 'pointer', position: 'relative', transition: 'background 200ms',
        boxShadow: `inset 0 0 0 1px ${checked ? 'transparent' : 'var(--border)'}`,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary)',
  cursor: 'pointer', padding: '4px', borderRadius: '5px', display: 'flex',
  transition: 'color 150ms',
};
