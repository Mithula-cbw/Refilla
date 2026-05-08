import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { CentralAccount } from '@/types';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { AVATAR_COLORS, nextAvatarColor } from '@/utils/avatar';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

const BROWSER_SUGGESTIONS = ['Chrome', 'Firefox', 'Edge', 'Brave', 'Opera', 'Vivaldi'];

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: CentralAccount) => void;
  existing?: CentralAccount | null;
  allAccounts: CentralAccount[];
}

export function AccountModal({ isOpen, onClose, onSave, existing, allAccounts }: AccountModalProps) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [color, setColor] = useState(() => existing?.color ?? nextAvatarColor());
  const [customColor, setCustomColor] = useState('');
  const [browsers, setBrowsers] = useState<string[]>(existing?.browsers ?? []);
  const [browserInput, setBrowserInput] = useState('');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [labelError, setLabelError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const browserInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setLabel(existing?.label ?? '');
      setColor(existing?.color ?? nextAvatarColor());
      setCustomColor('');
      setBrowsers(existing?.browsers ?? []);
      setBrowserInput('');
      setNotes(existing?.notes ?? '');
      setLabelError('');
      setShowSuggestions(false);
    }
  }, [isOpen, existing]);

  const filteredSuggestions = BROWSER_SUGGESTIONS.filter(
    (b) =>
      b.toLowerCase().includes(browserInput.toLowerCase()) &&
      !browsers.includes(b) &&
      browserInput.length > 0
  );

  const addBrowser = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || browsers.includes(trimmed)) return;
    setBrowsers((prev) => [...prev, trimmed]);
    setBrowserInput('');
    setShowSuggestions(false);
    browserInputRef.current?.focus();
  };

  const removeBrowser = (name: string) => {
    setBrowsers((prev) => prev.filter((b) => b !== name));
  };

  const handleBrowserKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addBrowser(browserInput);
    } else if (e.key === 'Backspace' && !browserInput && browsers.length > 0) {
      removeBrowser(browsers[browsers.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSave = () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) { setLabelError('Label is required'); return; }

    const conflict = allAccounts.find(
      (a) => a.label.toLowerCase() === trimmedLabel.toLowerCase() && a.id !== existing?.id
    );
    if (conflict) { setLabelError('An account with this label already exists'); return; }

    const now = new Date().toISOString();
    if (existing) {
      onSave({
        ...existing,
        label: trimmedLabel,
        color: customColor || color,
        browsers,
        notes: notes.trim(),
        updatedAt: now,
      });
    } else {
      onSave({
        id: uuidv4(),
        label: trimmedLabel,
        color: customColor || color,
        browsers,
        notes: notes.trim(),
        createdAt: now,
        updatedAt: now,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? `Edit Account` : 'Add Account'}
      width={460}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Input
            id="ca-label"
            label="Account Label *"
            placeholder="e.g. user@gmail.com"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setLabelError(''); }}
            error={labelError}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                if (!label.includes('@gmail.com')) {
                  setLabel(prev => prev + '@gmail.com');
                  setLabelError('');
                }
              }}
              style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer',
                fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 100ms',
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
              + @gmail.com
            </button>
          </div>
        </div>

        {/* Browser tag input */}
        <div>
          <label style={{
            fontSize: '12px', fontWeight: 500,
            color: 'var(--text-secondary)', display: 'block', marginBottom: '6px',
          }}>
            Browsers
          </label>

          {/* Pills + input row */}
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '6px 10px', minHeight: '38px',
              cursor: 'text',
            }}
            onClick={() => browserInputRef.current?.focus()}
          >
            {browsers.map((b) => (
              <span
                key={b}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', fontWeight: 500, padding: '2px 8px',
                  borderRadius: '99px', background: 'rgba(76,175,110,0.15)',
                  border: '1px solid rgba(76,175,110,0.4)', color: 'var(--green)',
                  whiteSpace: 'nowrap',
                }}
              >
                {b}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeBrowser(b); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--green)', display: 'flex', padding: '0',
                    opacity: 0.7, lineHeight: 1,
                  }}
                  aria-label={`Remove ${b}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              ref={browserInputRef}
              value={browserInput}
              onChange={(e) => { setBrowserInput(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleBrowserKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={browsers.length === 0 ? 'Type browser name + Enter...' : ''}
              aria-label="Add browser"
              style={{
                flex: 1, minWidth: '80px', background: 'transparent', border: 'none',
                outline: 'none', color: 'var(--text-primary)', fontSize: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '6px', marginTop: '4px', overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {filteredSuggestions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onMouseDown={() => addBrowser(b)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 12px', background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Quick-add suggestions as pills */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
            {BROWSER_SUGGESTIONS.filter((b) => !browsers.includes(b)).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => addBrowser(b)}
                style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 100ms',
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
                + {b}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Avatar Color
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
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

        <div>
          <label style={{
            fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
            display: 'block', marginBottom: '6px',
          }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this account..."
            rows={3}
            style={{
              width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px',
              padding: '8px 10px', resize: 'vertical', outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'border-color 150ms',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--green)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {existing ? 'Save Changes' : 'Add Account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
