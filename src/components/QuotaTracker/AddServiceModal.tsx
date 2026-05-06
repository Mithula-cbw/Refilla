import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Service } from '@/types';
import { Modal } from '@/components/UI/Modal';
import { Input, Select } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';

const PRESET_COLORS = ['#388bfd', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#79c0ff'];

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
  const [resetValue, setResetValue] = useState(() => {
    const h = existing?.resetIntervalHours;
    if (!h) return '';
    return h >= 168 ? String(h / 168) : h >= 24 ? String(h / 24) : String(h);
  });
  const [resetUnit, setResetUnit] = useState<'hours' | 'days' | 'weeks'>(() => {
    const h = existing?.resetIntervalHours;
    if (!h) return 'hours';
    return h >= 168 ? 'weeks' : h >= 24 ? 'days' : 'hours';
  });
  const [color, setColor] = useState(existing?.color ?? PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetIntervalHours = (): number | null => {
    const v = parseFloat(resetValue);
    if (!resetValue || isNaN(v)) return null;
    return resetUnit === 'weeks' ? v * 168 : resetUnit === 'days' ? v * 24 : v;
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
      width={440}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          id="svc-name"
          label="Service Name *"
          placeholder="e.g. Cursor, GitHub Copilot"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
          error={errors.name}
        />
        <Input
          id="svc-icon"
          label="Icon (emoji, max 2 chars)"
          placeholder="🤖"
          value={icon}
          maxLength={2}
          onChange={(e) => { setIcon(e.target.value); setErrors((p) => ({ ...p, icon: '' })); }}
          error={errors.icon}
          style={{ width: '80px' }}
        />

        {/* Reset interval */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Reset Interval (optional)
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Input
              id="svc-reset-value"
              type="number"
              placeholder="24"
              value={resetValue}
              onChange={(e) => setResetValue(e.target.value)}
              style={{ width: '80px' }}
            />
            <Select
              id="svc-reset-unit"
              value={resetUnit}
              onChange={(e) => setResetUnit(e.target.value as 'hours' | 'days' | 'weeks')}
              style={{ width: '100px' }}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </Select>
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

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{existing ? 'Save Changes' : 'Add Service'}</Button>
        </div>
      </div>
    </Modal>
  );
}
