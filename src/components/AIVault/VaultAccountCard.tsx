import { useState } from 'react';
import { VaultAccount, VaultEntry, VaultService, CentralAccount } from '@/types';
import { EntryRow } from './EntryRow';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { getAvatarInitial } from '@/utils/avatar';

interface VaultAccountCardProps {
  account: VaultAccount;
  service: VaultService;
  centralAccount?: CentralAccount;
  flashEntryId?: string;
  sectionSearchQuery?: string;
  onUpdate: (va: VaultAccount) => void;
  onDelete: (id: string) => void;
}

export function VaultAccountCard({
  account, service, centralAccount, flashEntryId, sectionSearchQuery = '',
  onUpdate, onDelete,
}: VaultAccountCardProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTags, setNewTags] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const accountLabel = centralAccount?.label ?? '(unknown account)';
  const avatarColor = centralAccount?.color ?? '#555d7a';

  const allKeys = [...new Set(account.entries.map((e) => e.key))];

  const filteredEntries = sectionSearchQuery
    ? account.entries.filter((e) =>
        e.key.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
        e.value.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(sectionSearchQuery.toLowerCase()))
      )
    : account.entries;

  const handleAddEntry = () => {
    if (!newKey.trim()) return;
    const now = new Date().toISOString();
    const entry: VaultEntry = {
      id: uuidv4(),
      key: newKey.trim(),
      value: newValue.trim(),
      tags: newTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    };
    onUpdate({ ...account, entries: [...account.entries, entry], updatedAt: now });
    setNewKey(''); setNewValue(''); setNewTags('');
    setShowAddEntry(false);
  };

  const handleUpdateEntry = (updated: VaultEntry) => {
    const entries = account.entries.map((e) => (e.id === updated.id ? updated : e));
    onUpdate({ ...account, entries, updatedAt: new Date().toISOString() });
  };

  const handleDeleteEntry = (id: string) => {
    const entries = account.entries.filter((e) => e.id !== id);
    onUpdate({ ...account, entries, updatedAt: new Date().toISOString() });
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '8px',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderBottom: account.entries.length > 0 || showAddEntry ? '1px solid var(--border)' : 'none',
        background: 'var(--bg-tertiary)',
      }}>
        {/* Avatar */}
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: avatarColor, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: '#fff',
        }}>
          {getAvatarInitial(accountLabel)}
        </div>

        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {accountLabel}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {account.entries.length} {account.entries.length === 1 ? 'entry' : 'entries'}
        </span>
        <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={() => setShowAddEntry((p) => !p)}>
          Add entry
        </Button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          aria-label="Delete account"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '4px' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f85149')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Entries */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Add entry form */}
        {showAddEntry && (
          <div style={{
            padding: '10px',
            background: 'var(--bg-tertiary)',
            borderRadius: '7px',
            border: '1px dashed var(--green)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ⚠ This is unencrypted local storage. Do not save real secrets.
            </p>
            <input
              autoFocus
              placeholder="Key (e.g. App A discussion)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              aria-label="New entry key"
              list={`keys-${account.id}`}
              style={addInputStyle}
            />
            <datalist id={`keys-${account.id}`}>
              {allKeys.map((k) => <option key={k} value={k} />)}
            </datalist>
            <textarea
              placeholder="Value / note"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              rows={3}
              aria-label="New entry value"
              style={{ ...addInputStyle, resize: 'vertical' }}
            />
            <input
              placeholder="Tags (comma-separated)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              aria-label="New entry tags"
              style={addInputStyle}
            />
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddEntry(false)} style={ghostBtnStyle}>Cancel</button>
              <button onClick={handleAddEntry} style={saveBtnStyle}>Add Entry</button>
            </div>
          </div>
        )}

        {filteredEntries.length === 0 && !showAddEntry && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            {sectionSearchQuery ? 'No entries match this search' : 'No entries yet — add one'}
          </div>
        )}

        {filteredEntries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            allKeys={allKeys}
            highlight={sectionSearchQuery}
            isFlashing={entry.id === flashEntryId}
            onUpdate={handleUpdateEntry}
            onDelete={handleDeleteEntry}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(account.id)}
        title="Delete Account"
        message={`Delete "${accountLabel}" and all its entries? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

const addInputStyle: React.CSSProperties = {
  padding: '7px 10px', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: '5px',
  color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
  width: '100%', fontFamily: 'Inter, system-ui, sans-serif',
};
const ghostBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif',
};
const saveBtnStyle: React.CSSProperties = {
  background: 'rgba(76,175,110,0.15)', border: '1px solid #4caf6e',
  color: '#4caf6e', borderRadius: '5px', cursor: 'pointer',
  fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif', padding: '4px 12px', fontWeight: 600,
};
