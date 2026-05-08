import React, { useState, useEffect } from 'react';
import { CentralAccount, Account, VaultAccount, Service, VaultService, TabId } from '@/types';
import { Button, IconButton } from '@/components/UI/Button';
import { ConfirmDialog } from '@/components/UI/Modal';
import { AccountModal } from './AccountModal';
import { Badge } from '@/components/UI/Badge';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getAvatarInitial } from '@/utils/avatar';
import { useCountdown } from '@/hooks/useCountdown';

interface AccountProfilePageProps {
  account: CentralAccount;
  allAccounts: CentralAccount[];
  trackerAccounts: Account[];
  vaultAccounts: VaultAccount[];
  services: Service[];
  vaultServices: VaultService[];
  onBack: () => void;
  onUpdate: (ca: CentralAccount) => void;
  onNavigateToVault: (vaultServiceId: string) => void;
}

// Sub-component for a single tracker row
function TrackerServiceRow({ account, service }: { account: Account; service: Service }) {
  const { label: countdownLabel } = useCountdown(account.cooldownUntil);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: '8px',
      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
      marginBottom: '6px',
    }}>
      <span style={{ fontSize: '18px' }}>{service.icon}</span>
      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
        {service.name}
      </span>
      {account.status === 'available' && (
        <Badge variant="available">Available</Badge>
      )}
      {account.status === 'cooldown' && (
        <span style={{
          fontSize: '11px', padding: '3px 8px', borderRadius: '99px',
          background: 'rgba(210,153,34,0.15)', color: '#d29922',
          border: '1px solid rgba(210,153,34,0.3)', fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {countdownLabel || 'Cooling'}
        </span>
      )}
      {account.status === 'unknown' && (
        <Badge variant="unknown">Unknown</Badge>
      )}
    </div>
  );
}

export function AccountProfilePage({
  account, allAccounts, trackerAccounts, vaultAccounts,
  services, vaultServices,
  onBack, onUpdate, onNavigateToVault,
}: AccountProfilePageProps) {
  const [showEdit, setShowEdit] = useState(false);

  const myTrackerAccounts = trackerAccounts.filter((a) => a.centralAccountId === account.id);
  const myVaultAccounts = vaultAccounts.filter((a) => a.centralAccountId === account.id);

  const totalServices = myTrackerAccounts.length + myVaultAccounts.length;
  const availableCount = myTrackerAccounts.filter((a) => a.status === 'available').length;
  const cooldownCount = myTrackerAccounts.filter((a) => a.status === 'cooldown').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Topbar */}
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif',
            padding: '4px 0', transition: 'color 150ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Back to Accounts"
        >
          <ArrowLeft size={14} />
          Accounts
        </button>
        <div style={{ flex: 1 }} />
        <IconButton
          icon={<Pencil size={13} />}
          label="Edit account"
          onClick={() => setShowEdit(true)}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: account.color, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 700, color: '#fff',
            boxShadow: `0 0 0 3px ${account.color}33`,
          }}>
            {getAvatarInitial(account.label)}
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {account.label}
            </h1>
            {/* Browser pills */}
            {account.browsers.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {account.browsers.map((b) => (
                  <span key={b} style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontWeight: 500,
                  }}>
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {account.notes && (
          <div style={{
            padding: '10px 14px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px',
            lineHeight: 1.6,
          }}>
            {account.notes}
          </div>
        )}

        {/* Quick Stats */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total Services', value: totalServices, color: 'var(--text-primary)' },
            { label: 'Available', value: availableCount, color: 'var(--green)' },
            { label: 'On Cooldown', value: cooldownCount, color: '#d29922' },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: '1 1 80px', padding: '12px 16px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quota Tracker section */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px',
          }}>
            Quota Tracker
          </h2>
          {myTrackerAccounts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
              Not added to any service yet
            </p>
          ) : (
            myTrackerAccounts.map((ta) => {
              const svc = services.find((s) => s.id === ta.serviceId);
              if (!svc) return null;
              return <TrackerServiceRow key={ta.id} account={ta} service={svc} />;
            })
          )}
        </div>

        {/* AI Vault section */}
        <div>
          <h2 style={{
            fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px',
          }}>
            AI Vault
          </h2>
          {myVaultAccounts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
              No vault entries yet
            </p>
          ) : (
            myVaultAccounts.map((va) => {
              const svc = vaultServices.find((s) => s.id === va.vaultServiceId);
              if (!svc) return null;
              return (
                <button
                  key={va.id}
                  onClick={() => onNavigateToVault(va.vaultServiceId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    marginBottom: '6px', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 150ms', fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = svc.color;
                    e.currentTarget.style.background = `${svc.color}0d`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                  aria-label={`Go to ${svc.name} vault`}
                >
                  <span style={{ fontSize: '18px' }}>{svc.icon}</span>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {svc.name}
                  </span>
                  <span style={{
                    fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500,
                    padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: '99px',
                  }}>
                    {va.entries.length} {va.entries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Edit modal */}
      <AccountModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={onUpdate}
        existing={account}
        allAccounts={allAccounts}
      />
    </div>
  );
}
