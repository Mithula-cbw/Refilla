import { useState } from 'react';
import { Account, Service } from '@/types';
import { Modal } from '@/components/UI/Modal';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { toDateTimeLocal, fromDateTimeLocal, defaultCooldownEnd } from '@/utils/time';

interface CooldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cooldownUntil: string, notes: string) => void;
  account: Account;
  service: Service;
}

const PRESETS = [
  { label: '+24h', hours: 24 },
  { label: '+48h', hours: 48 },
  { label: '+3 days', hours: 72 },
  { label: '+7 days', hours: 168 },
  { label: '+30 days', hours: 720 },
];

export function CooldownModal({ isOpen, onClose, onSave, account, service }: CooldownModalProps) {
  const [resetAt, setResetAt] = useState(() =>
    toDateTimeLocal(defaultCooldownEnd(service.resetIntervalHours))
  );
  const [notes, setNotes] = useState(account.notes ?? '');
  const [error, setError] = useState('');

  const applyPreset = (hours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    const pad = (n: number) => String(n).padStart(2, '0');
    setResetAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setError('');
  };

  const handleSave = () => {
    const chosen = new Date(resetAt);
    if (chosen <= new Date()) {
      setError('Reset time must be in the future');
      return;
    }
    onSave(fromDateTimeLocal(resetAt), notes.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mark Cooldown — ${account.label}`}
      width={420}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Service hint */}
        <div style={{
          padding: '10px 12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '20px' }}>{service.icon}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {service.name}
            {service.resetIntervalHours
              ? ` · ${service.resetIntervalHours}h reset interval`
              : ''}
          </span>
        </div>

        {/* Presets */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Quick Presets
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="secondary"
                size="sm"
                onClick={() => applyPreset(p.hours)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* DateTime picker */}
        <Input
          id="cooldown-reset-at"
          label="Reset at"
          type="datetime-local"
          value={resetAt}
          onChange={(e) => { setResetAt(e.target.value); setError(''); }}
          error={error}
        />

        {/* Notes */}
        <Input
          id="cooldown-notes"
          label="Notes (optional)"
          placeholder="e.g. used for project X"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            style={{ background: 'rgba(210,153,34,0.15)', border: '1px solid #d29922', color: '#d29922' }}
          >
            Start Cooldown
          </Button>
        </div>
      </div>
    </Modal>
  );
}
