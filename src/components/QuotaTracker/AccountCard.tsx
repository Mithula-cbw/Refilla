import { useState, useEffect } from 'react';
import { Account, Service, CentralAccount } from '@/types';
import { Badge, StatusDot, CooldownBadge } from '@/components/UI/Badge';
import { IconButton } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Select } from '@/components/UI/Input';
import { ConfirmDialog } from '@/components/UI/Modal';
import { CooldownModal } from './CooldownModal';
import { useCountdown } from '@/hooks/useCountdown';
import { useToast } from '@/components/UI/ToastContext';
import { cooldownEndLabel, cooldownEndTooltip, toDateTimeLocal, fromDateTimeLocal, addHours } from '@/utils/time';
import { Pencil, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { getAvatarInitial } from '@/utils/avatar';

interface AccountCardProps {
  account: Account;
  service: Service;
  centralAccount?: CentralAccount;
  onUpdate: (updated: Account) => void;
  onDelete: (id: string) => void;
  onNotify: (title: string, body: string) => void;
}

export function AccountCard({ account, service, centralAccount, onUpdate, onDelete, onNotify }: AccountCardProps) {
  const [hovering, setHovering] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [flash, setFlash] = useState(false);

  const { addToast } = useToast();
  const { label: countdownLabel, expired, isUrgent, secondsLeft } = useCountdown(account.cooldownUntil);

  const accountLabel = centralAccount?.label ?? '(unknown account)';
  const browsers = centralAccount?.browsers ?? [];
  const avatarColor = centralAccount?.color ?? '#555d7a';

  // Auto-mark available + notify when cooldown expires
  useEffect(() => {
    if (expired && account.status === 'cooldown') {
      const updated: Account = {
        ...account,
        status: 'available',
        cooldownUntil: null,
        updatedAt: new Date().toISOString(),
      };
      onUpdate(updated);
      addToast(`${accountLabel} on ${service.name} is now available`, 'success');
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2100);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const markAvailable = () => {
    onUpdate({ ...account, status: 'available', cooldownUntil: null, updatedAt: new Date().toISOString() });
  };

  const handleCooldownSave = (cooldownUntil: string, notes: string) => {
    onUpdate({ ...account, status: 'cooldown', cooldownUntil, notes, updatedAt: new Date().toISOString() });
  };

  const statusBadge = () => {
    if (account.status === 'available') return <Badge variant="available">Available</Badge>;
    if (account.status === 'cooldown') {
      return (
        <CooldownBadge
          label={countdownLabel}
          isUrgent={isUrgent}
          secondsLeft={secondsLeft}
          serviceColor={service.color}
        />
      );
    }
    return <Badge variant="unknown">Unknown</Badge>;
  };

  const endLabel   = account.status === 'cooldown' ? cooldownEndLabel(account.cooldownUntil) : '';
  const endTooltip = account.status === 'cooldown' ? cooldownEndTooltip(account.cooldownUntil) : '';

  return (
    <>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={flash ? 'flash-green-border' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '8px',
          border: account.status === 'cooldown' && isUrgent
            ? `1px solid ${service.color}55`
            : '1px solid var(--border)',
          background: account.status === 'cooldown' && isUrgent
            ? `${service.color}08`
            : 'var(--bg-tertiary)',
          transition: 'all 200ms ease',
          boxShadow: hovering ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          transform: hovering ? 'translateY(-1px)' : 'none',
        }}
      >
        {/* Avatar circle */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: avatarColor, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: '#fff',
        }}>
          {getAvatarInitial(accountLabel)}
        </div>

        {/* Label + browser pills + notes */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {accountLabel}
            </span>
            {/* Browser pills — subtle */}
            {browsers.map((b) => (
              <span key={b} style={{
                fontSize: '9px', padding: '1px 5px', borderRadius: '99px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                {b}
              </span>
            ))}
          </div>
          {account.notes && (
            <span style={{
              fontSize: '11px', color: 'var(--text-muted)', display: 'block',
              marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {account.notes}
            </span>
          )}
        </div>

        {/* End-time annotation */}
        {endLabel && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            opacity: hovering ? 1 : 0, transition: 'opacity 150ms', flexShrink: 0,
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', userSelect: 'none' }}>·</span>
            <span
              title={endTooltip}
              style={{
                fontSize: '11px', color: 'var(--text-muted)',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400, whiteSpace: 'nowrap', cursor: 'default',
              }}
            >
              ends {endLabel}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div style={{ flexShrink: 0, width: '94px', display: 'flex', justifyContent: 'center' }}>
          {statusBadge()}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex', gap: '4px', opacity: hovering ? 1 : 0,
          transition: 'opacity 150ms', flexShrink: 0, width: '116px', justifyContent: 'flex-end',
        }}>
          <IconButton
            icon={<Pencil size={13} />}
            label="Edit account"
            onClick={() => setShowEditModal(true)}
          />
          {account.status !== 'cooldown' && (
            <IconButton
              icon={<Clock size={13} />}
              label="Mark on cooldown"
              onClick={() => setShowCooldownModal(true)}
              style={{ color: 'var(--orange)' }}
            />
          )}
          {account.status === 'cooldown' && (
            <IconButton
              icon={<Clock size={13} />}
              label="Edit cooldown"
              onClick={() => setShowCooldownModal(true)}
              style={{ color: service.color }}
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

      {/* Cooldown modal (mark / edit cooldown time) */}
      <CooldownModal
        isOpen={showCooldownModal}
        onClose={() => setShowCooldownModal(false)}
        onSave={handleCooldownSave}
        account={account}
        accountLabel={accountLabel}
        service={service}
      />

      {/* Edit modal (status/notes/cooldownUntil) */}
      {showEditModal && (
        <EditAccountModal
          account={account}
          accountLabel={accountLabel}
          onClose={() => setShowEditModal(false)}
          onSave={(updates) => {
            onUpdate({ ...account, ...updates, updatedAt: new Date().toISOString() });
            setShowEditModal(false);
          }}
          service={service}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => onDelete(account.id)}
        title="Delete Account"
        message={`Remove "${accountLabel}" from ${service.name}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}

// ─── Inline Edit Modal ────────────────────────────────────────────────────────
interface EditAccountModalProps {
  account: Account;
  accountLabel: string;
  service: Service;
  onClose: () => void;
  onSave: (updates: Partial<Account>) => void;
}

function EditAccountModal({ account, accountLabel, service, onClose, onSave }: EditAccountModalProps) {
  const [status, setStatus] = useState<Account['status']>(account.status);
  const [notes, setNotes] = useState(account.notes);
  const [cooldownAt, setCooldownAt] = useState(
    account.cooldownUntil ? toDateTimeLocal(account.cooldownUntil) : ''
  );
  const [cdError, setCdError] = useState('');

  const handleSave = () => {
    if (status === 'cooldown') {
      // In edit flow for cooldown: validate datetime
      if (!cooldownAt) { setCdError('Please pick a reset time'); return; }
      const chosen = new Date(cooldownAt);
      if (isNaN(chosen.getTime())) { setCdError('Invalid date/time'); return; }
      if (chosen <= new Date()) { setCdError('Reset time must be in the future'); return; }
      onSave({ status, cooldownUntil: fromDateTimeLocal(cooldownAt), notes: notes.trim() });
    } else {
      onSave({ status, cooldownUntil: null, notes: notes.trim() });
    }
  };

  const PRESETS = [
    { label: '+24h', hours: 24 },
    { label: '+48h', hours: 48 },
    { label: '+3d',  hours: 72 },
    { label: '+7d',  hours: 168 },
    { label: '+30d', hours: 720 },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title={`Edit — ${accountLabel}`} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Read-only label */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Account
          </label>
          <div style={{
            padding: '8px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: '6px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600,
          }}>
            {accountLabel}
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            To rename, go to the Accounts tab
          </p>
        </div>

        {/* Cooldown edit (only if currently on cooldown) */}
        {account.status === 'cooldown' ? (
          <>
            {/* Preset buttons */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Quick presets (adds to now)
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setCooldownAt(toDateTimeLocal(addHours(new Date(), p.hours)));
                      setCdError('');
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '11px',
                      fontWeight: 500, background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = service.color; e.currentTarget.style.color = service.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Reset At
              </label>
              <input
                type="datetime-local"
                value={cooldownAt}
                onChange={(e) => { setCooldownAt(e.target.value); setCdError(''); }}
                style={{
                  width: '100%', padding: '8px 10px', background: 'var(--bg-tertiary)',
                  border: `1px solid ${cdError ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px',
                  outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              {cdError && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{cdError}</p>}
            </div>
          </>
        ) : (
          <Select
            id="edit-acc-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Account['status'])}
          >
            <option value="available">Available</option>
            <option value="unknown">Unknown</option>
          </Select>
        )}

        {/* Notes */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px',
              padding: '7px 10px', resize: 'vertical', outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}
