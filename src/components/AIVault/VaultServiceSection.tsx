import { useState } from 'react';
import { VaultService, VaultAccount, CentralAccount } from '@/types';
import { VaultAccountCard } from './VaultAccountCard';
import { Modal, ConfirmDialog } from '@/components/UI/Modal';
import { Button, IconButton } from '@/components/UI/Button';
import { CentralAccountDropdown } from '@/components/Accounts/CentralAccountDropdown';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDown, ChevronRight, Plus, Search, X, Pencil, Trash2, GripVertical } from 'lucide-react';

interface VaultServiceSectionProps {
  service: VaultService;
  accounts: VaultAccount[];
  centralAccounts: CentralAccount[];
  flashInfo?: { accountId: string; entryId: string };
  allServices: VaultService[];
  accordionOpen: boolean;
  onAccordionToggle: (open: boolean) => void;
  onUpdateAccount: (va: VaultAccount) => void;
  onDeleteAccount: (id: string) => void;
  onAddAccount: (va: VaultAccount) => void;
  onEditService: (vs: VaultService) => void;
  onDeleteService: (id: string) => void;
  onGoToAccountsTab: () => void;
}

export function VaultServiceSection({
  service, accounts, centralAccounts, flashInfo, allServices,
  accordionOpen, onAccordionToggle,
  onUpdateAccount, onDeleteAccount, onAddAccount,
  onEditService, onDeleteService, onGoToAccountsTab,
}: VaultServiceSectionProps) {
  const [hovering, setHovering] = useState(false);
  const [showSectionSearch, setShowSectionSearch] = useState(false);
  const [sectionQuery, setSectionQuery] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showDeleteSvc, setShowDeleteSvc] = useState(false);
  const [selectedCA, setSelectedCA] = useState<CentralAccount | null>(null);
  const [addError, setAddError] = useState('');

  const totalEntries = accounts.reduce((s, a) => s + a.entries.length, 0);
  const canDelete = accounts.length === 0;
  const linkedCAIds = accounts.map((a) => a.centralAccountId);
  const expanded = accordionOpen;

  const handleAddAccount = () => {
    if (!selectedCA) { setAddError('Please select an account'); return; }
    const dupe = accounts.find((a) => a.centralAccountId === selectedCA.id);
    if (dupe) { setAddError(`This account is already in ${service.name}`); return; }

    const now = new Date().toISOString();
    onAddAccount({
      id: uuidv4(),
      vaultServiceId: service.id,
      centralAccountId: selectedCA.id,
      entries: [],
      createdAt: now,
      updatedAt: now,
    });
    setSelectedCA(null);
    setAddError('');
    setShowAddAccount(false);
  };

  return (
    <div style={{ border: `1px solid ${service.color}33`, borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
      {/* Header */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '16px 20px',
          background: hovering ? `${service.color}1a` : `${service.color}0d`,
          borderBottom: expanded ? `1px solid ${service.color}22` : 'none',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          userSelect: 'none',
        }}
        onClick={() => onAccordionToggle(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${service.name} vault section`}
      >
        {/* Drag handle */}
        <div
          title="Drag to reorder"
          style={{
            color: 'var(--text-muted)', flexShrink: 0, opacity: hovering ? 0.7 : 0,
            transition: 'opacity 150ms', cursor: 'grab', padding: '0 2px',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>

        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: `${service.color}22`, border: `1px solid ${service.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>
          {service.icon}
        </div>

        <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {service.name}
        </span>

        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: '99px' }}>
          {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
        </span>

        <div style={{ flex: 1 }} />

        {/* Section controls (hover) */}
        <div
          style={{ display: 'flex', gap: '4px', opacity: hovering ? 1 : 0, transition: 'opacity 150ms' }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            icon={<Search size={13} />}
            label="Search within section"
            onClick={() => { setShowSectionSearch((p) => !p); onAccordionToggle(true); }}
          />
          <IconButton icon={<Plus size={13} />} label="Add account" onClick={() => { setShowAddAccount(true); onAccordionToggle(true); }} />
          <IconButton icon={<Pencil size={13} />} label="Edit service" onClick={() => onEditService(service)} />
          <IconButton
            icon={<Trash2 size={13} />}
            label="Delete service"
            onClick={() => setShowDeleteSvc(true)}
            style={{ color: 'var(--red)' }}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {/* Section search */}
      {expanded && showSectionSearch && (
        <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            autoFocus
            placeholder={`Search in ${service.name}…`}
            value={sectionQuery}
            onChange={(e) => setSectionQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setSectionQuery(''); setShowSectionSearch(false); } }}
            aria-label={`Search within ${service.name}`}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          {sectionQuery && (
            <button onClick={() => setSectionQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Accounts */}
      {expanded && (
        <div style={{ padding: '12px', background: 'var(--bg-primary)' }}>
          {accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', marginBottom: '12px' }}>No accounts — add one</p>
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAddAccount(true)}>
                Add Account
              </Button>
            </div>
          ) : (
            accounts.map((acc) => {
              const ca = centralAccounts.find((c) => c.id === acc.centralAccountId);
              return (
                <VaultAccountCard
                  key={acc.id}
                  account={acc}
                  service={service}
                  centralAccount={ca}
                  sectionSearchQuery={sectionQuery}
                  flashEntryId={flashInfo?.accountId === acc.id ? flashInfo.entryId : undefined}
                  onUpdate={onUpdateAccount}
                  onDelete={onDeleteAccount}
                />
              );
            })
          )}
        </div>
      )}

      {/* Add account modal */}
      <Modal
        isOpen={showAddAccount}
        onClose={() => { setShowAddAccount(false); setSelectedCA(null); setAddError(''); }}
        title={`Add Account — ${service.name}`}
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '280px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Select Account *
            </label>
            <CentralAccountDropdown
              centralAccounts={centralAccounts}
              excludeIds={linkedCAIds}
              onSelect={(ca) => { setSelectedCA(ca); setAddError(''); }}
              onGoToAccountsTab={() => { setShowAddAccount(false); onGoToAccountsTab(); }}
            />
            {addError && (
              <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '6px' }}>{addError}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => { setShowAddAccount(false); setSelectedCA(null); setAddError(''); }}>Cancel</Button>
            <Button variant="primary" onClick={handleAddAccount} disabled={!selectedCA}>Add Account</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteSvc}
        onClose={() => setShowDeleteSvc(false)}
        onConfirm={() => canDelete && onDeleteService(service.id)}
        title="Delete Vault Service"
        message={canDelete
          ? `Delete "${service.name}"? This cannot be undone.`
          : `"${service.name}" has ${accounts.length} account(s). Remove them first.`}
        confirmLabel={canDelete ? 'Delete' : 'OK'}
        destructive={canDelete}
      />
    </div>
  );
}
