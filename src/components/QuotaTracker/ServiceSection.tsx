import { useState } from 'react';
import { Account, Service, FilterType } from '@/types';
import { AccountCard } from './AccountCard';
import { Badge } from '@/components/UI/Badge';
import { Button, IconButton } from '@/components/UI/Button';
import { ConfirmDialog, Modal } from '@/components/UI/Modal';
import { Input, Select } from '@/components/UI/Input';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatResetInterval } from '@/utils/time';

interface ServiceSectionProps {
  service: Service;
  accounts: Account[];
  filter: FilterType;
  allServices: Service[];
  onUpdateAccount: (a: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddAccount: (a: Account) => void;
  onEditService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onNotify: (title: string, body: string) => void;
}

export function ServiceSection({
  service, accounts, filter, allServices,
  onUpdateAccount, onDeleteAccount, onAddAccount,
  onEditService, onDeleteService, onNotify,
}: ServiceSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showDeleteSvc, setShowDeleteSvc] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Add account form state
  const [newLabel, setNewLabel] = useState('');
  const [newStatus, setNewStatus] = useState<Account['status']>('available');
  const [newNotes, setNewNotes] = useState('');
  const [newLabelError, setNewLabelError] = useState('');

  const filteredAccounts = accounts.filter((a) => filter === 'all' || a.status === filter);

  const availableCount = accounts.filter((a) => a.status === 'available').length;
  const cooldownCount = accounts.filter((a) => a.status === 'cooldown').length;

  const handleAddAccount = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) { setNewLabelError('Label is required'); return; }
    const dupe = accounts.find((a) => a.label.toLowerCase() === trimmed.toLowerCase());
    if (dupe) { setNewLabelError('An account with this label already exists in this service'); return; }

    const now = new Date().toISOString();
    onAddAccount({
      id: uuidv4(),
      serviceId: service.id,
      label: trimmed,
      status: newStatus,
      cooldownUntil: null,
      notes: newNotes.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setNewLabel(''); setNewStatus('available'); setNewNotes(''); setNewLabelError('');
    setShowAddAccount(false);
  };

  const canDeleteService = accounts.length === 0;

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
        onClick={() => setExpanded((p) => !p)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${service.name} section`}
      >
        {/* Service icon + color dot */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `${service.color}22`,
          border: `1px solid ${service.color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
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
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(63,185,80,0.15)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.3)', fontWeight: 600 }}>
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

          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              service={service}
              onUpdate={onUpdateAccount}
              onDelete={onDeleteAccount}
              onNotify={onNotify}
            />
          ))}

          {/* Add account button (bottom) */}
          {accounts.length > 0 && (
            <button
              onClick={() => setShowAddAccount(true)}
              aria-label="Add account to this service"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue)';
                e.currentTarget.style.color = 'var(--blue)';
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
      <Modal isOpen={showAddAccount} onClose={() => setShowAddAccount(false)} title={`Add Account — ${service.name}`} width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            id="acc-label"
            label="Account Label *"
            placeholder="e.g. user@gmail.com"
            value={newLabel}
            onChange={(e) => { setNewLabel(e.target.value); setNewLabelError(''); }}
            error={newLabelError}
            autoFocus
          />
          <Select
            id="acc-status"
            label="Initial Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as Account['status'])}
          >
            <option value="available">Available</option>
            <option value="cooldown">On Cooldown</option>
            <option value="unknown">Unknown</option>
          </Select>
          <Input
            id="acc-notes"
            label="Notes (optional)"
            placeholder="Short note about this account"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setShowAddAccount(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddAccount}>Add Account</Button>
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
