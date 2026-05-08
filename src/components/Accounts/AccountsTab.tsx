import React, { useState } from 'react';
import { CentralAccount, Account, VaultAccount, Service, VaultService, TabId } from '@/types';
import { Button } from '@/components/UI/Button';
import { ConfirmDialog } from '@/components/UI/Modal';
import { AccountModal } from './AccountModal';
import { AccountProfilePage } from './AccountProfilePage';
import { getAvatarInitial } from '@/utils/avatar';
import { useToast } from '@/components/UI/ToastContext';
import { Plus, Search, X } from 'lucide-react';

interface AccountsTabProps {
  centralAccounts: CentralAccount[];
  trackerAccounts: Account[];
  vaultAccounts: VaultAccount[];
  services: Service[];
  vaultServices: VaultService[];
  onAdd: (ca: CentralAccount) => void;
  onUpdate: (ca: CentralAccount) => void;
  onDelete: (id: string) => void;
  onNavigateToVault: (vaultServiceId: string) => void;
}

export function AccountsTab({
  centralAccounts, trackerAccounts, vaultAccounts,
  services, vaultServices,
  onAdd, onUpdate, onDelete, onNavigateToVault,
}: AccountsTabProps) {
  const { addToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const profileAccount = profileId ? centralAccounts.find((a) => a.id === profileId) : null;

  const filteredAccounts = centralAccounts.filter((a) =>
    a.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUsageCount = (caId: string): number => {
    const trackerCount = trackerAccounts.filter((a) => a.centralAccountId === caId).length;
    const vaultCount = vaultAccounts.filter((a) => a.centralAccountId === caId).length;
    return trackerCount + vaultCount;
  };

  const getDeletionWarning = (caId: string): string | null => {
    const count = getUsageCount(caId);
    if (count === 0) return null;
    return `This account is linked to ${count} service${count > 1 ? 's' : ''}. Deleting it will remove it from all of them. This cannot be undone.`;
  };

  const handleDelete = (id: string) => {
    const warning = getDeletionWarning(id);
    if (!warning) {
      onDelete(id);
      addToast('Account deleted', 'success');
    } else {
      setDeletingId(id);
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    onDelete(deletingId);
    // Also remove from tracker + vault
    addToast('Account deleted', 'success');
    setDeletingId(null);
  };

  // If profile page is open
  if (profileAccount) {
    return (
      <AccountProfilePage
        account={profileAccount}
        allAccounts={centralAccounts}
        trackerAccounts={trackerAccounts}
        vaultAccounts={vaultAccounts}
        services={services}
        vaultServices={vaultServices}
        onBack={() => setProfileId(null)}
        onUpdate={onUpdate}
        onNavigateToVault={onNavigateToVault}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Accounts
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Manage your identities
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowAdd(true)}
            id="add-central-account-btn"
          >
            Add Account
          </Button>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '7px 12px',
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            placeholder="Search accounts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search accounts"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Account list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filteredAccounts.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '48px' }}>👤</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {searchQuery ? 'No accounts match' : 'No accounts yet'}
              </p>
              <p style={{ fontSize: '13px', marginBottom: '20px' }}>
                {searchQuery ? 'Try a different search' : 'Add your first identity to get started'}
              </p>
              {!searchQuery && (
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
                  Add Your First Account
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredAccounts.map((ca) => {
              const usageCount = getUsageCount(ca.id);
              return (
                <AccountCard
                  key={ca.id}
                  account={ca}
                  usageCount={usageCount}
                  onOpen={() => setProfileId(ca.id)}
                  onDelete={() => handleDelete(ca.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      <AccountModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={onAdd}
        allAccounts={centralAccounts}
      />

      {/* Delete warning */}
      {deletingId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingId(null)}
          onConfirm={confirmDelete}
          title="Delete Account"
          message={getDeletionWarning(deletingId) ?? ''}
          confirmLabel="Delete anyway"
          destructive
        />
      )}
    </div>
  );
}

// Account card sub-component
interface AccountCardProps {
  account: CentralAccount;
  usageCount: number;
  onOpen: () => void;
  onDelete: () => void;
}

function AccountCard({ account, usageCount, onOpen, onDelete }: AccountCardProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '12px 16px', borderRadius: '10px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        cursor: 'pointer', transition: 'all 150ms',
        boxShadow: hovering ? '0 2px 12px rgba(0,0,0,0.2)' : 'none',
        transform: hovering ? 'translateY(-1px)' : 'none',
        borderColor: hovering ? account.color + '66' : 'var(--border)',
      }}
      onClick={onOpen}
      role="button"
      aria-label={`Open ${account.label} profile`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
    >
      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: account.color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', fontWeight: 700, color: '#fff',
        boxShadow: hovering ? `0 0 0 3px ${account.color}33` : 'none',
        transition: 'box-shadow 150ms',
      }}>
        {getAvatarInitial(account.label)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: '4px',
        }}>
          {account.label}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {account.browsers.map((b) => (
            <span key={b} style={{
              fontSize: '10px', padding: '1px 6px', borderRadius: '99px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontWeight: 500,
            }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Usage count */}
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
        {usageCount === 0 ? 'Unused' : `${usageCount} service${usageCount > 1 ? 's' : ''}`}
      </span>

      {/* Delete (hover only) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label={`Delete ${account.label}`}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex',
          opacity: hovering ? 1 : 0, transition: 'opacity 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <X size={13} />
      </button>
    </div>
  );
}
