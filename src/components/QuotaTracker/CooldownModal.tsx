import { useState } from 'react';
import { Account, Service } from '@/types';
import { Modal } from '@/components/UI/Modal';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import {
  toDateTimeLocal,
  fromDateTimeLocal,
  defaultCooldownEnd,
  addHours,
  formatResetInterval,
  formatDateTime,
} from '@/utils/time';

interface CooldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cooldownUntil: string, notes: string) => void;
  account: Account;
  service: Service;
}

// Presets: { label shown on chip, hours to add }
const PRESETS = [
  { label: '1h',  hours: 1 },
  { label: '6h',  hours: 6 },
  { label: '12h', hours: 12 },
  { label: '24h', hours: 24 },
  { label: '2d',  hours: 48 },
  { label: '3d',  hours: 72 },
  { label: '7d',  hours: 168 },
  { label: '30d', hours: 720 },
] as const;

export function CooldownModal({ isOpen, onClose, onSave, account, service }: CooldownModalProps) {
  // If the account is already cooling, edit from the existing deadline;
  // otherwise fall back to the service's default interval.
  const existingIso = account.cooldownUntil ?? null;
  const defaultIso  = defaultCooldownEnd(service.resetIntervalHours);
  const initialIso  = existingIso ?? defaultIso;

  const [resetAt, setResetAt] = useState(() => toDateTimeLocal(initialIso));
  const [notes, setNotes] = useState(account.notes ?? '');
  const [error, setError] = useState('');

  // Determine if the initial value matches one of our presets.
  // We match by comparing the preset-computed time to the initial ISO (within ±1 min).
  const detectActivePreset = (): number | null => {
    // If the service interval is one of our preset hours, start with that selected.
    const matchedPreset = PRESETS.find((p) => p.hours === service.resetIntervalHours);
    // Only auto-select if we're NOT editing an existing custom deadline.
    if (!existingIso && matchedPreset) return matchedPreset.hours;
    return null;
  };

  const [activePresetHours, setActivePresetHours] = useState<number | null>(detectActivePreset);

  /** Convert hours → local datetime-local string */
  const presetToLocal = (hours: number): string =>
    toDateTimeLocal(addHours(new Date(), hours));

  const applyPreset = (hours: number) => {
    setResetAt(presetToLocal(hours));
    setActivePresetHours(hours);
    setError('');
  };

  const handleDateChange = (val: string) => {
    setResetAt(val);
    setActivePresetHours(null); // custom time — deselect preset
    setError('');
  };

  const handleSave = () => {
    if (!resetAt) { setError('Please pick a reset time'); return; }
    const chosen = new Date(resetAt);
    if (isNaN(chosen.getTime())) { setError('Invalid date/time'); return; }
    if (chosen <= new Date()) { setError('Reset time must be in the future'); return; }
    onSave(fromDateTimeLocal(resetAt), notes.trim());
    onClose();
  };

  // Human-readable preview of the selected reset time
  const previewLabel = (() => {
    if (!resetAt) return null;
    try {
      const d = new Date(resetAt);
      if (isNaN(d.getTime())) return null;
      return formatDateTime(d.toISOString());
    } catch {
      return null;
    }
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Cooldown — ${account.label}`}
      width={440}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Service context pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: `${service.color}11`,
          borderRadius: '10px',
          border: `1px solid ${service.color}33`,
        }}>
          <span style={{
            fontSize: '22px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${service.color}22`,
            borderRadius: '8px',
            border: `1px solid ${service.color}44`,
            flexShrink: 0,
          }}>
            {service.icon}
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {service.name}
            </div>
            {service.resetIntervalHours && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {formatResetInterval(service.resetIntervalHours)}
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px',
          }}>
            Quick Presets
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map((p) => {
              const isActive = activePresetHours === p.hours;
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.hours)}
                  aria-pressed={isActive}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    border: isActive
                      ? `1px solid ${service.color}`
                      : '1px solid var(--border)',
                    background: isActive
                      ? `${service.color}22`
                      : 'var(--bg-tertiary)',
                    color: isActive
                      ? service.color
                      : 'var(--text-secondary)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isActive
                      ? `0 0 0 3px ${service.color}18`
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = service.color;
                      e.currentTarget.style.color = service.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  +{p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DateTime picker */}
        <div>
          <Input
            id="cooldown-reset-at"
            label="Reset At (custom)"
            type="datetime-local"
            value={resetAt}
            onChange={(e) => handleDateChange(e.target.value)}
            error={error}
          />
          {previewLabel && !error && (
            <div style={{
              marginTop: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span>🗓</span>
              <span>Resets on <strong style={{ color: 'var(--text-secondary)' }}>{previewLabel}</strong></span>
            </div>
          )}
        </div>

        {/* Notes */}
        <Input
          id="cooldown-notes"
          label="Notes (optional)"
          placeholder="e.g. used for project X, daily limit hit"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
        }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            style={{
              background: `${service.color}22`,
              border: `1px solid ${service.color}`,
              color: service.color,
            }}
          >
            Start Cooldown
          </Button>
        </div>
      </div>
    </Modal>
  );
}
