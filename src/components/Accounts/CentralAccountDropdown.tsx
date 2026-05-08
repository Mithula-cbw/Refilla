import React, { useState, useRef, useEffect } from 'react';
import { CentralAccount } from '@/types';
import { getAvatarInitial } from '@/utils/avatar';
import { Search } from 'lucide-react';

interface CentralAccountDropdownProps {
  centralAccounts: CentralAccount[];
  excludeIds?: string[];   // already linked accounts in this service
  onSelect: (account: CentralAccount) => void;
  onGoToAccountsTab: () => void;
  placeholder?: string;
}

export function CentralAccountDropdown({
  centralAccounts, excludeIds = [], onSelect, onGoToAccountsTab, placeholder = 'Search accounts…',
}: CentralAccountDropdownProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CentralAccount | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = centralAccounts.filter((ca) =>
    !excludeIds.includes(ca.id) &&
    ca.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (ca: CentralAccount) => {
    setSelected(ca);
    setQuery(ca.label);
    setOpen(false);
    onSelect(ca);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Search box */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'var(--bg-tertiary)', border: `1px solid ${open ? 'var(--green)' : 'var(--border)'}`,
        borderRadius: '6px', padding: '7px 10px', transition: 'border-color 150ms',
      }}>
        {selected ? (
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: selected.color, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff',
            flexShrink: 0,
          }}>
            {getAvatarInitial(selected.label)}
          </div>
        ) : (
          <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); if (selected) setSelected(null); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Select account"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0' }}
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          maxHeight: '220px', overflowY: 'auto', padding: '6px 0',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                No account found
              </p>
              <button
                type="button"
                onClick={() => { setOpen(false); onGoToAccountsTab(); }}
                style={{
                  fontSize: '11px', color: 'var(--green)', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Add it in the Accounts tab →
              </button>
            </div>
          ) : (
            filtered.map((ca) => (
              <button
                key={ca.id}
                type="button"
                onClick={() => handleSelect(ca)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 12px', background: 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 100ms', fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar */}
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: ca.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                }}>
                  {getAvatarInitial(ca.label)}
                </div>
                {/* Label */}
                <span style={{
                  flex: 1, fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ca.label}
                </span>
                {/* Browser pills */}
                {ca.browsers.length > 0 && (
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {ca.browsers.slice(0, 2).map((b) => (
                      <span key={b} style={{
                        fontSize: '9px', padding: '1px 5px', borderRadius: '99px',
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      }}>
                        {b}
                      </span>
                    ))}
                    {ca.browsers.length > 2 && (
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        +{ca.browsers.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
