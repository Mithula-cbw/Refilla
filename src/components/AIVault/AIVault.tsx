import { useState } from 'react';
import { VaultService, VaultAccount } from '@/types';
import { VaultServiceSection } from './VaultServiceSection';
import { MasterSearch } from './MasterSearch';
import { ServiceModal } from '@/components/QuotaTracker/AddServiceModal';
import { Button } from '@/components/UI/Button';
import { Plus } from 'lucide-react';

// Re-use AddServiceModal shape but for VaultService
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '@/components/UI/Modal';
import { Input } from '@/components/UI/Input';

const PRESET_COLORS = ['#388bfd', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#79c0ff'];
const PRESET_EMOJIS = ['🤖', '🧠', '⚡', '✨', '💻', '🔧', '🚀', '💬'];

interface AIVaultProps {
  vaultServices: VaultService[];
  vaultAccounts: VaultAccount[];
  onAddVaultService: (vs: VaultService) => void;
  onUpdateVaultService: (vs: VaultService) => void;
  onDeleteVaultService: (id: string) => void;
  onAddVaultAccount: (va: VaultAccount) => void;
  onUpdateVaultAccount: (va: VaultAccount) => void;
  onDeleteVaultAccount: (id: string) => void;
}

export function AIVault({
  vaultServices, vaultAccounts,
  onAddVaultService, onUpdateVaultService, onDeleteVaultService,
  onAddVaultAccount, onUpdateVaultAccount, onDeleteVaultAccount,
}: AIVaultProps) {
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<VaultService | null>(null);
  const [flashInfo, setFlashInfo] = useState<{ serviceId: string; accountId: string; entryId: string } | null>(null);

  // New service form state
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [nameError, setNameError] = useState('');

  const handleResultClick = (serviceId: string, accountId: string, entryId: string) => {
    setFlashInfo({ serviceId, accountId, entryId });
    setTimeout(() => setFlashInfo(null), 2500);
    // Scroll to element
    setTimeout(() => {
      const el = document.getElementById(`entry-${entryId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleAddService = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Name is required'); return; }
    const conflict = vaultServices.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (conflict) { setNameError('A service with this name already exists'); return; }

    const now = new Date().toISOString();
    onAddVaultService({
      id: uuidv4(),
      name: trimmed,
      icon: newIcon.trim() || '🤖',
      color: newColor,
      createdAt: now,
    });
    setNewName(''); setNewIcon(''); setNewColor(PRESET_COLORS[0]); setNameError('');
    setShowAddService(false);
  };

  const handleEditService = (updated: VaultService) => {
    onUpdateVaultService(updated);
    setEditingService(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Vault</h1>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAddService(true)}>
            Add Service
          </Button>
        </div>
        <MasterSearch
          vaultServices={vaultServices}
          vaultAccounts={vaultAccounts}
          onResultClick={handleResultClick}
        />
      </div>

      {/* Services */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {vaultServices.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px' }}>🧠</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Your AI Vault is empty
              </p>
              <p style={{ fontSize: '13px', marginBottom: '20px' }}>
                Store conversation context, notes, and references for each AI service
              </p>
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddService(true)}>
                Add Your First Service
              </Button>
            </div>
          </div>
        ) : (
          vaultServices.map((vs) => (
            <VaultServiceSection
              key={vs.id}
              service={vs}
              accounts={vaultAccounts.filter((a) => a.vaultServiceId === vs.id)}
              flashInfo={flashInfo?.serviceId === vs.id ? flashInfo : undefined}
              allServices={vaultServices}
              onUpdateAccount={onUpdateVaultAccount}
              onDeleteAccount={onDeleteVaultAccount}
              onAddAccount={onAddVaultAccount}
              onEditService={(s) => setEditingService(s)}
              onDeleteService={onDeleteVaultService}
            />
          ))
        )}
      </div>

      {/* Add service modal */}
      <Modal isOpen={showAddService} onClose={() => setShowAddService(false)} title="Add Vault Service" width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            id="vs-name"
            label="Service Name *"
            placeholder="e.g. Claude, ChatGPT, Gemini"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
            error={nameError}
            autoFocus
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
                  onClick={() => setNewIcon(e)}
                  aria-label={`Select emoji ${e}`}
                  style={{
                    width: '32px', height: '32px', borderRadius: '6px', fontSize: '16px',
                    background: newIcon === e ? 'var(--bg-tertiary)' : 'transparent',
                    border: newIcon === e ? '1px solid var(--border)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onMouseEnter={(ev) => { if (newIcon !== e) ev.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  onMouseLeave={(ev) => { if (newIcon !== e) ev.currentTarget.style.background = 'transparent'; }}
                >
                  {e}
                </button>
              ))}
              <Input
                id="vs-icon-custom"
                placeholder="Other..."
                value={newIcon}
                maxLength={2}
                onChange={(e) => setNewIcon(e.target.value)}
                style={{ width: '70px', padding: '6px 10px', height: '32px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Accent Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={`Color ${c}`}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: c,
                    border: newColor === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
              <input type="color" aria-label="Custom color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px dashed var(--border)', cursor: 'pointer', background: 'transparent', padding: '1px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setShowAddService(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddService}>Add Service</Button>
          </div>
        </div>
      </Modal>

      {/* Edit service modal */}
      {editingService && (
        <Modal isOpen={true} onClose={() => setEditingService(null)} title={`Edit — ${editingService.name}`} width={440}>
          <EditVaultServiceForm
            service={editingService}
            allServices={vaultServices}
            onSave={handleEditService}
            onClose={() => setEditingService(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function EditVaultServiceForm({ service, allServices, onSave, onClose }: {
  service: VaultService;
  allServices: VaultService[];
  onSave: (vs: VaultService) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(service.name);
  const [icon, setIcon] = useState(service.icon);
  const [color, setColor] = useState(service.color);
  const [nameError, setNameError] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameError('Name is required'); return; }
    const conflict = allServices.find((s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.id !== service.id);
    if (conflict) { setNameError('Name already exists'); return; }
    onSave({ ...service, name: trimmed, icon: icon.trim() || service.icon, color });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input id="vs-edit-name" label="Service Name *" value={name} onChange={(e) => { setName(e.target.value); setNameError(''); }} error={nameError} autoFocus />
      {/* Icon */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
          Icon (choose or type)
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setIcon(e)}
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
            id="vs-edit-icon-custom"
            placeholder="Other..."
            value={icon}
            maxLength={2}
            onChange={(e) => setIcon(e.target.value)}
            style={{ width: '70px', padding: '6px 10px', height: '32px' }}
          />
        </div>
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Color</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: color === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
