import { useState, useRef, useEffect } from 'react';
import { VaultEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { highlight } from '@/utils/search';
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { ConfirmDialog } from '@/components/UI/Modal';

interface EntryRowProps {
  entry: VaultEntry;
  allKeys: string[];
  highlight?: string;
  isFlashing?: boolean;
  onUpdate: (updated: VaultEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryRow({ entry, allKeys, highlight: highlightQuery = '', isFlashing, onUpdate, onDelete }: EntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [editKey, setEditKey] = useState(entry.key);
  const [editValue, setEditValue] = useState(entry.value);
  const [editTagInput, setEditTagInput] = useState(entry.tags.join(', '));
  const [showKeySuggestions, setShowKeySuggestions] = useState(false);

  const keyInputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const isLong = entry.value.length > 500;
  const displayValue = isLong && !showMore ? entry.value.slice(0, 500) + '…' : entry.value;
  const isTruncated = !editing && entry.value.length > 120 && !expanded;
  const shownValue = isTruncated ? entry.value.slice(0, 120) + '…' : displayValue;

  useEffect(() => {
    if (isFlashing && rowRef.current) {
      rowRef.current.classList.add('flash-yellow-bg');
      const t = setTimeout(() => rowRef.current?.classList.remove('flash-yellow-bg'), 2100);
      return () => clearTimeout(t);
    }
  }, [isFlashing]);

  const parseTags = (raw: string) =>
    raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

  const handleSave = () => {
    const now = new Date().toISOString();
    onUpdate({
      ...entry,
      key: editKey.trim() || entry.key,
      value: editValue.trim(),
      tags: parseTags(editTagInput),
      updatedAt: now,
    });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setEditing(false); setEditKey(entry.key); setEditValue(entry.value); setEditTagInput(entry.tags.join(', ')); }
  };

  const filteredSuggestions = allKeys.filter((k) =>
    k.toLowerCase().includes(editKey.toLowerCase()) && k !== editKey
  );

  const renderHighlighted = (text: string) => {
    if (!highlightQuery) return text;
    return <span dangerouslySetInnerHTML={{ __html: highlight(text, highlightQuery) }} />;
  };

  return (
    <>
      <div
        ref={rowRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          padding: '10px 12px',
          borderRadius: '7px',
          border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          transition: 'all 150ms ease',
          boxShadow: hovering ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {editing ? (
          /* ── Edit mode ─────────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} onKeyDown={handleKeyDown}>
            {/* Key input with autocomplete */}
            <div style={{ position: 'relative' }}>
              <input
                ref={keyInputRef}
                autoFocus
                value={editKey}
                onChange={(e) => { setEditKey(e.target.value); setShowKeySuggestions(true); }}
                onFocus={() => setShowKeySuggestions(true)}
                onBlur={() => setTimeout(() => setShowKeySuggestions(false), 150)}
                placeholder="Key"
                aria-label="Entry key"
                style={{
                  width: '100%', padding: '5px 8px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--blue)', borderRadius: '5px',
                  color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, outline: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              {showKeySuggestions && filteredSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                  {filteredSuggestions.slice(0, 5).map((k) => (
                    <button
                      key={k}
                      onClick={() => { setEditKey(k); setShowKeySuggestions(false); }}
                      style={{
                        display: 'block', width: '100%', padding: '6px 10px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Value"
              aria-label="Entry value"
              rows={3}
              style={{
                width: '100%', padding: '6px 8px', background: 'var(--bg-secondary)',
                border: '1px solid var(--blue)', borderRadius: '5px',
                color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
                resize: 'vertical', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5,
              }}
            />

            <input
              value={editTagInput}
              onChange={(e) => setEditTagInput(e.target.value)}
              placeholder="Tags (comma-separated)"
              aria-label="Entry tags"
              style={{
                width: '100%', padding: '5px 8px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: '5px',
                color: 'var(--text-secondary)', fontSize: '11px', outline: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            />

            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditing(false); }} style={ghostBtnStyle}>Cancel</button>
              <button onClick={handleSave} style={saveBtnStyle}>Save  ⌘↵</button>
            </div>
          </div>
        ) : (
          /* ── Display mode ─────────────────────────────── */
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {renderHighlighted(entry.key)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>→</span>
              </div>
              <p
                style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, cursor: expanded ? 'default' : 'pointer' }}
                onClick={() => !expanded && setExpanded(true)}
              >
                {renderHighlighted(shownValue)}
              </p>
              {entry.value.length > 120 && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  style={{ ...ghostBtnStyle, marginTop: '4px', padding: '2px 0', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {expanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> Show more</>}
                </button>
              )}
              {isLong && expanded && (
                <button onClick={() => setShowMore((p) => !p)} style={{ ...ghostBtnStyle, fontSize: '11px', marginTop: '4px' }}>
                  {showMore ? 'Collapse' : 'Show full text'}
                </button>
              )}
              {entry.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px', alignItems: 'center' }}>
                  <Tag size={10} color="var(--text-muted)" />
                  {entry.tags.map((t) => (
                    <span key={t} style={{
                      padding: '1px 7px', borderRadius: '99px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      fontSize: '10px', color: 'var(--text-muted)',
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '3px', opacity: hovering ? 1 : 0, transition: 'opacity 150ms', flexShrink: 0 }}>
              <button onClick={() => setEditing(true)} aria-label="Edit entry" style={iconBtnStyle}>
                <Pencil size={12} />
              </button>
              <button onClick={() => setShowConfirm(true)} aria-label="Delete entry" style={{ ...iconBtnStyle, color: '#f85149' }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onDelete(entry.id)}
        title="Delete Entry"
        message={`Delete "${entry.key}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}

const ghostBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif', padding: '3px 6px',
};
const saveBtnStyle: React.CSSProperties = {
  background: 'rgba(56,139,253,0.15)', border: '1px solid #388bfd',
  color: '#388bfd', borderRadius: '5px', cursor: 'pointer',
  fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif', padding: '4px 10px', fontWeight: 600,
};
const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center',
  transition: 'color 150ms',
};
