import { useState, useEffect } from 'react';
import { Account, Service } from '@/types';
import { StatusDot, Badge } from '@/components/UI/Badge';
import { IconButton } from '@/components/UI/Button';
import { ConfirmDialog } from '@/components/UI/Modal';
import { CooldownModal } from './CooldownModal';
import { useCountdown } from '@/hooks/useCountdown';
import {
  Pencil, Clock, CheckCircle, Trash2,
} from 'lucide-react';

interface AccountCardProps {
  account: Account;
  service: Service;
  onUpdate: (updated: Account) => void;
  onDelete: (id: string) => void;
  onNotify: (title: string, body: string) => void;
}

export function AccountCard({ account, service, onUpdate, onDelete, onNotify }: AccountCardProps) {
  const [hovering, setHovering] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(account.label);
  const [flash, setFlash] = useState(false);

  const { label: countdownLabel, expired } = useCountdown(account.cooldownUntil);

  // When cooldown expires: auto-mark available + notify
  useEffect(() => {
    if (expired && account.status === 'cooldown') {
      const updated: Account = { ...account, status: 'available', cooldownUntil: null, updatedAt: new Date().toISOString() };
      onUpdate(updated);
      onNotify('Refilla: Account Ready', `${account.label} on ${service.name} is now available`);
      setFlash(true);
      setTimeout(() => setFlash(false), 2100);
    }
  }, [expired]);

  const markAvailable = () => {
    onUpdate({ ...account, status: 'available', cooldownUntil: null, updatedAt: new Date().toISOString() });
  };

  const handleCooldownSave = (cooldownUntil: string, notes: string) => {
    onUpdate({ ...account, status: 'cooldown', cooldownUntil, notes, updatedAt: new Date().toISOString() });
  };

  const handleLabelSave = () => {
    if (editLabel.trim() && editLabel.trim() !== account.label) {
      onUpdate({ ...account, label: editLabel.trim(), updatedAt: new Date().toISOString() });
    }
    setEditing(false);
  };

  const statusBadge = () => {
    if (account.status === 'available') return <Badge variant="available">Available</Badge>;
    if (account.status === 'cooldown') {
      return (
        <Badge variant="cooldown" style={{ fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>
          🕐 {countdownLabel ? `Resets in ${countdownLabel}` : 'On cooldown'}
        </Badge>
      );
    }
    return <Badge variant="unknown">Unknown</Badge>;
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={flash ? 'flash-green-border' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          transition: 'all 150ms ease',
          boxShadow: hovering ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          transform: hovering ? 'translateY(-1px)' : 'none',
        }}
      >
        {/* Status dot */}
        <StatusDot status={account.status} size={9} />

        {/* Label + notes */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLabelSave();
                if (e.key === 'Escape') { setEditLabel(account.label); setEditing(false); }
              }}
              aria-label="Edit account label"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--blue)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                padding: '2px 6px',
                outline: 'none',
                width: '100%',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            />
          ) : (
            <span
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {account.label}
            </span>
          )}
          {account.notes && !editing && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {account.notes}
            </span>
          )}
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          {statusBadge()}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '2px',
          opacity: hovering ? 1 : 0,
          transition: 'opacity 150ms',
          flexShrink: 0,
        }}>
          <IconButton
            icon={<Pencil size={13} />}
            label="Edit account"
            onClick={() => setEditing(true)}
          />
          {account.status !== 'cooldown' && (
            <IconButton
              icon={<Clock size={13} />}
              label="Mark on cooldown"
              onClick={() => setShowCooldownModal(true)}
              style={{ color: 'var(--orange)' }}
            />
          )}
          {account.status !== 'available' && (
            <IconButton
              icon={<CheckCircle size={13} />}
              label="Mark as available"
              onClick={markAvailable}
              style={{ color: 'var(--green)' }}
            />
          )}
          <IconButton
            icon={<Trash2 size={13} />}
            label="Delete account"
            onClick={() => setShowConfirmDelete(true)}
            style={{ color: 'var(--red)' }}
          />
        </div>
      </div>

      {/* Modals */}
      <CooldownModal
        isOpen={showCooldownModal}
        onClose={() => setShowCooldownModal(false)}
        onSave={handleCooldownSave}
        account={account}
        service={service}
      />
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => onDelete(account.id)}
        title="Delete Account"
        message={`Delete "${account.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
