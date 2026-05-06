import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Service } from '@/types';
import { Modal } from '@/components/UI/Modal';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';

const PRESET_COLORS = ['#388bfd', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#79c0ff'];
const PRESET_EMOJIS = ['🤖', '🧠', '⚡', '✨', '💻', '🔧', '🚀', '💬'];

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  existing?: Service;
  allServices: Service[];
}

export function ServiceModal({ isOpen, onClose, onSave, existing, allServices }: ServiceModalProps) {
  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '');
  const [resetDays, setResetDays] = useState(() => {
    const h = existing?.resetIntervalHours;
    if (!h) return '';
    const d = Math.floor(h / 24);
    return d > 0 ? String(d) : '';
  });
  const [resetHours, setResetHours] = useState(() => {
    const h = existing?.resetIntervalHours;
    if (!h) return '';
    const rem = h % 24;
    return rem > 0 ? String(rem) : '';
  });
  const [color, setColor] = useState(existing?.color ?? PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetIntervalHours = (): number | null => {
    const d = parseFloat(resetDays) || 0;
    const h = parseFloat(resetHours) || 0;
    if (!resetDays && !resetHours) return null;
    return d * 24 + h;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    else {
      const conflict = allServices.find(
        (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.id !== existing?.id
      );
      if (conflict) errs.name = 'A service with this name already exists';
    }
    if (icon && icon.length > 2) errs.icon = 'Icon must be max 2 characters';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const now = new Date().toISOString();
    onSave({
      id: existing?.id ?? uuidv4(),
      name: name.trim(),
      icon: icon.trim() || '🔧',
      resetIntervalHours: resetIntervalHours(),
      color: customColor || color,
      createdAt: existing?.createdAt ?? now,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? 'Edit Service' : 'Add Service'}
      width={480}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <Input
          id="svc-name"
          label="Service Name *"
          placeholder="e.g. Cursor, GitHub Copilot"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
          error={errors.name}
        />
        {/* Icon */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Icon (choose or type)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => { setIcon(e); setErrors((p) => ({ ...p, icon: '' })); }}
                aria-label={`Select emoji ${e}`}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px', fontSize: '16px',
                  background: icon === e ? 'var(--bg-tertiary)' : 'transparent',
                  border: icon === e ? '1px solid var(--border)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={(ev) => { if (icon !== e) ev.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={(ev) => { if (icon !== e) ev.currentTarget.style.background = 'transparent'; }}
              >
                {e}
              </button>
            ))}
            <Input
              id="svc-icon-custom"
              placeholder="Other..."
              value={icon}
              maxLength={2}
              onChange={(e) => { setIcon(e.target.value); setErrors((p) => ({ ...p, icon: '' })); }}
              error={errors.icon}
              style={{ width: '70px', padding: '6px 10px', height: '32px' }}
            />
          </div>
        </div>

        {/* Reset interval */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Reset Interval (optional)
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Input
              id="svc-reset-days"
              type="number"
              placeholder="0"
              value={resetDays}
              onChange={(e) => setResetDays(e.target.value)}
              style={{ width: '80px' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Days</span>
            
            <Input
              id="svc-reset-hours"
              type="number"
              placeholder="0"
              value={resetHours}
              onChange={(e) => setResetHours(e.target.value)}
              style={{ width: '80px', marginLeft: '8px' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hours</span>
          </div>
        </div>

        {/* Color */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Accent Color
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                aria-label={`Color ${c}`}
                onClick={() => { setColor(c); setCustomColor(''); }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: c,
                  border: color === c && !customColor ? '3px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'border 150ms',
                  outline: 'none',
                }}
              />
            ))}
            <input
              type="color"
              aria-label="Custom color picker"
              value={customColor || color}
              onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '2px dashed var(--border)',
                cursor: 'pointer',
                background: 'transparent',
                padding: '1px',
              }}
            />
          </div>
        </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{existing ? 'Save Changes' : 'Add Service'}</Button>
        </div>
      </div>
    </Modal>
  );
}
