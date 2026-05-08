import { useState } from 'react';
import { Account, Service, FilterType, CentralAccount } from '@/types';
import { AccountCard } from './AccountCard';
import { Badge } from '@/components/UI/Badge';
import { Button, IconButton } from '@/components/UI/Button';
import { ConfirmDialog, Modal } from '@/components/UI/Modal';
import { Select } from '@/components/UI/Input';
import { CentralAccountDropdown } from '@/components/Accounts/CentralAccountDropdown';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatResetInterval } from '@/utils/time';

interface ServiceSectionProps {
  service: Service;
  accounts: Account[];
  filter: FilterType;
  allServices: Service[];
  centralAccounts: CentralAccount[];
  accordionOpen: boolean;
  onAccordionToggle: (open: boolean) => void;
  onUpdateAccount: (a: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddAccount: (a: Account) => void;
  onEditService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onNotify: (title: string, body: string) => void;
  onGoToAccountsTab: () => void;
}

export function ServiceSection({
  service, accounts, filter, allServices, centralAccounts,
  accordionOpen, onAccordionToggle,
  onUpdateAccount, onDeleteAccount, onAddAccount,
  onEditService, onDeleteService, onNotify, onGoToAccountsTab,
}: ServiceSectionProps) {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showDeleteSvc, setShowDeleteSvc] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Add account form state
  const [selectedCA, setSelectedCA] = useState<CentralAccount | null>(null);
  const [newStatus, setNewStatus] = useState<Account['status']>('available');
  const [newNotes, setNewNotes] = useState('');
  const [addError, setAddError] = useState('');

  const filteredAccounts = accounts.filter((a) => filter === 'all' || a.status === filter);

  const availableCount = accounts.filter((a) => a.status === 'available').length;
  const cooldownCount = accounts.filter((a) => a.status === 'cooldown').length;

  const linkedCAIds = accounts.map((a) => a.centralAccountId);

  const handleAddAccount = () => {
    if (!selectedCA) { setAddError('Please select an account'); return; }

    // Uniqueness check
    const dupe = accounts.find((a) => a.centralAccountId === selectedCA.id);
    if (dupe) { setAddError(`This account is already in ${service.name}`); return; }

    const now = new Date().toISOString();
    onAddAccount({
      id: uuidv4(),
      serviceId: service.id,
      centralAccountId: selectedCA.id,
      status: newStatus,
      cooldownUntil: null,
      notes: newNotes.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setSelectedCA(null); setNewStatus('available'); setNewNotes(''); setAddError('');
    setShowAddAccount(false);
  };

  const canDeleteService = accounts.length === 0;
  const expanded = accordionOpen;

  return (
    <div style={{
      border: `1px solid ${service.color}33`,
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '10px',
    }}>
      {/* Section header */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
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
        aria-label={`${service.name} section`}
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

        {/* Service icon */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: `${service.color}22`, border: `1px solid ${service.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>
          {service.icon}
        </div>

        {/* Name + optional reset interval hint */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {service.name}
          </span>
          {service.resetIntervalHours && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              {formatResetInterval(service.resetIntervalHours)}
            </span>
          )}
        </div>

        {/* Status count pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {availableCount > 0 && (
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(76,175,110,0.15)', color: '#4caf6e', border: '1px solid rgba(76,175,110,0.3)', fontWeight: 600 }}>
              {availableCount} available
            </span>
          )}
          {cooldownCount > 0 && (
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(210,153,34,0.15)', color: '#d29922', border: '1px solid rgba(210,153,34,0.3)', fontWeight: 600 }}>
              {cooldownCount} cooling
            </span>
          )}
          {accounts.length === 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px' }}>0 accounts</span>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Section controls (hover) */}
        <div
          style={{ display: 'flex', gap: '4px', opacity: hovering ? 1 : 0, transition: 'opacity 150ms' }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton icon={<Plus size={13} />} label="Add account" onClick={() => setShowAddAccount(true)} />
          <IconButton icon={<Pencil size={13} />} label="Edit service" onClick={() => onEditService(service)} />
          <IconButton
            icon={<Trash2 size={13} />}
            label="Delete service"
            onClick={() => setShowDeleteSvc(true)}
            style={{ color: 'var(--red)' }}
          />
        </div>

        {/* Chevron */}
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {/* Accounts list */}
      {expanded && (
        <div style={{ padding: '12px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAccounts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              {accounts.length === 0 ? (
                <div>
                  <p style={{ fontSize: '14px', marginBottom: '12px' }}>No accounts yet</p>
                  <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAddAccount(true)}>
                    Add Account
                  </Button>
                </div>
              ) : (
                <p style={{ fontSize: '13px' }}>No accounts match the current filter</p>
              )}
            </div>
          )}

          {filteredAccounts.map((account) => {
            const ca = centralAccounts.find((c) => c.id === account.centralAccountId);
            return (
              <AccountCard
                key={account.id}
                account={account}
                service={service}
                centralAccount={ca}
                onUpdate={onUpdateAccount}
                onDelete={onDeleteAccount}
                onNotify={onNotify}
              />
            );
          })}

          {/* Add account button (bottom) */}
          {accounts.length > 0 && (
            <button
              onClick={() => setShowAddAccount(true)}
              aria-label="Add account to this service"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '6px',
                border: '1px dashed var(--border)', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px',
                fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--green)';
                e.currentTarget.style.color = 'var(--green)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Plus size={13} /> Add account
            </button>
          )}
        </div>
      )}

      {/* Add account modal */}
      <Modal isOpen={showAddAccount} onClose={() => { setShowAddAccount(false); setSelectedCA(null); setAddError(''); }} title={`Add Account — ${service.name}`} width={440}>
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

          {selectedCA && (
            <>
              <Select
                id="acc-status"
                label="Initial Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Account['status'])}
              >
                <option value="available">Available</option>
                <option value="unknown">Unknown</option>
              </Select>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Notes for this service (optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes about this account in this service..."
                  rows={2}
                  style={{
                    width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px',
                    padding: '7px 10px', resize: 'vertical', outline: 'none',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => { setShowAddAccount(false); setSelectedCA(null); setAddError(''); }}>Cancel</Button>
            <Button variant="primary" onClick={handleAddAccount} disabled={!selectedCA}>Add Account</Button>
          </div>
        </div>
      </Modal>

      {/* Delete service confirm */}
      <ConfirmDialog
        isOpen={showDeleteSvc}
        onClose={() => setShowDeleteSvc(false)}
        onConfirm={() => canDeleteService && onDeleteService(service.id)}
        title="Delete Service"
        message={
          canDeleteService
            ? `Delete "${service.name}"? This cannot be undone.`
            : `"${service.name}" still has ${accounts.length} account(s). Move or delete them first.`
        }
        confirmLabel={canDeleteService ? 'Delete' : 'OK'}
        destructive={canDeleteService}
      />
    </div>
  );
}
