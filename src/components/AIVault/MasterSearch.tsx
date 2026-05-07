import { useState, useRef, useCallback, useEffect } from 'react';
import { VaultService, VaultAccount } from '@/types';
import { searchVault, SearchResult, truncate } from '@/utils/search';
import { Search, X } from 'lucide-react';

interface MasterSearchProps {
  vaultServices: VaultService[];
  vaultAccounts: VaultAccount[];
  onResultClick: (serviceId: string, accountId: string, entryId: string) => void;
}

export function MasterSearch({ vaultServices, vaultAccounts, onResultClick }: MasterSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setShowDropdown(false); return; }
    const r = searchVault(q, vaultServices, vaultAccounts);
    setResults(r);
    setShowDropdown(true);
  }, [vaultServices, vaultAccounts]);

  const handleChange = (q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(q), 250);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (r: SearchResult) => {
    onResultClick(r.serviceId, r.accountId, r.entryId);
    setShowDropdown(false);
    setQuery('');
  };

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        transition: 'border-color 150ms',
      }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--blue)')}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          id="vault-master-search"
          aria-label="Search across all vault entries"
          placeholder="Search all services, accounts, entries, tags…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />
        {query && (
          <button onClick={handleClear} aria-label="Clear search" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search results"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 50,
            maxHeight: '360px',
            overflowY: 'auto',
            animation: 'fadeIn 0.12s ease-out',
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Search size={20} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p>No matches found</p>
            </div>
          ) : (
            results.map((r) => (
              <button
                key={`${r.accountId}-${r.entryId}`}
                role="option"
                aria-selected={false}
                onClick={() => handleResultClick(r)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 100ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {r.serviceIcon} {r.serviceName} › {r.accountLabel} › {r.key}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {truncate(r.value, 80)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
