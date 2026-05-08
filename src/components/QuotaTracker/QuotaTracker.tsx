import { useState, useRef } from 'react';
import { Service, Account, FilterType, SortType, CentralAccount, AccordionState } from '@/types';
import { ServiceSection } from './ServiceSection';
import { ServiceModal } from './AddServiceModal';
import { Button } from '@/components/UI/Button';
import { Plus, ArrowUpDown } from 'lucide-react';

interface QuotaTrackerProps {
  services: Service[];
  accounts: Account[];
  centralAccounts: CentralAccount[];
  accordionState: AccordionState;
  filter: FilterType;
  sort: SortType;
  serviceOrder: string[];
  onFilterChange: (f: FilterType) => void;
  onSortChange: (s: SortType) => void;
  onAddService: (s: Service) => void;
  onUpdateService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onAddAccount: (a: Account) => void;
  onUpdateAccount: (a: Account) => void;
  onDeleteAccount: (id: string) => void;
  onNotify: (title: string, body: string) => void;
  onAccordionToggle: (serviceId: string, open: boolean) => void;
  onReorderServices: (orderedIds: string[]) => void;
  onGoToAccountsTab: () => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string; dot?: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'available', label: 'Available', dot: '#4caf6e' },
  { value: 'cooldown',  label: 'Cooling',   dot: '#d29922' },
  { value: 'unknown',   label: 'Unknown',   dot: '#484f58' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'name',      label: 'Name' },
  { value: 'status',    label: 'Status' },
  { value: 'resetTime', label: 'Reset Time' },
];

export function QuotaTracker({
  services, accounts, centralAccounts, accordionState,
  filter, sort, serviceOrder,
  onFilterChange, onSortChange,
  onAddService, onUpdateService, onDeleteService,
  onAddAccount, onUpdateAccount, onDeleteAccount,
  onNotify, onAccordionToggle, onReorderServices, onGoToAccountsTab,
}: QuotaTrackerProps) {
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceRef = useRef<string | null>(null);

  // Apply persisted order, falling back to alphabetical for new services
  const orderedServices = (): Service[] => {
    if (serviceOrder.length === 0) return [...services].sort((a, b) => a.name.localeCompare(b.name));
    const known = new Map(services.map((s) => [s.id, s]));
    const sorted: Service[] = [];
    for (const id of serviceOrder) {
      if (known.has(id)) { sorted.push(known.get(id)!); known.delete(id); }
    }
    // Append any services not yet in the order (newly added)
    for (const s of known.values()) sorted.push(s);
    return sorted;
  };

  const sortedServices = orderedServices();

  // ─── Drag handlers ───────────────────────────────────────────────────────────
  const handleDragStart = (id: string) => {
    dragSourceRef.current = id;
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragSourceRef.current !== id) setDragOverId(id);
  };

  const handleDrop = (targetId: string) => {
    const srcId = dragSourceRef.current;
    if (!srcId || srcId === targetId) { cleanup(); return; }
    const ids = sortedServices.map((s) => s.id);
    const from = ids.indexOf(srcId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) { cleanup(); return; }
    ids.splice(from, 1);
    ids.splice(to, 0, srcId);
    onReorderServices(ids);
    cleanup();
  };

  const cleanup = () => {
    dragSourceRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  const sortAccounts = (accs: Account[]): Account[] => {
    return [...accs].sort((a, b) => {
      if (sort === 'name') {
        const la = centralAccounts.find((c) => c.id === a.centralAccountId)?.label ?? '';
        const lb = centralAccounts.find((c) => c.id === b.centralAccountId)?.label ?? '';
        return la.localeCompare(lb);
      }
      if (sort === 'status') {
        const order: Record<string, number> = { available: 0, cooldown: 1, unknown: 2 };
        const statusDiff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
        if (statusDiff !== 0) return statusDiff;
        if (a.status === 'cooldown' && b.status === 'cooldown') {
          if (!a.cooldownUntil && !b.cooldownUntil) return 0;
          if (!a.cooldownUntil) return 1;
          if (!b.cooldownUntil) return -1;
          return new Date(a.cooldownUntil).getTime() - new Date(b.cooldownUntil).getTime();
        }
        return 0;
      }
      if (sort === 'resetTime') {
        if (!a.cooldownUntil && !b.cooldownUntil) return 0;
        if (!a.cooldownUntil) return 1;
        if (!b.cooldownUntil) return -1;
        return new Date(a.cooldownUntil).getTime() - new Date(b.cooldownUntil).getTime();
      }
      return 0;
    });
  };

  const cooldownCount = accounts.filter((a) => a.status === 'cooldown').length;
  const availableCount = accounts.filter((a) => a.status === 'available').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0,
      }}>
        {/* Left: title + live counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', flexShrink: 0 }}>
            Quota Tracker
          </h1>
          {accounts.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {availableCount > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  padding: '2px 7px', borderRadius: '99px',
                  background: 'rgba(76,175,110,0.12)',
                  border: '1px solid rgba(76,175,110,0.3)',
                  color: '#4caf6e',
                }}>
                  {availableCount} ready
                </span>
              )}
              {cooldownCount > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  padding: '2px 7px', borderRadius: '99px',
                  background: 'rgba(210,153,34,0.12)',
                  border: '1px solid rgba(210,153,34,0.3)',
                  color: '#d29922',
                }}>
                  {cooldownCount} cooling
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: filter + sort + add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
            {FILTER_OPTIONS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  aria-pressed={active}
                  aria-label={`Filter: ${f.label}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '5px', border: 'none',
                    background: active ? 'var(--bg-primary)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px',
                    fontWeight: active ? 600 : 400, transition: 'all 150ms',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.dot && (
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: f.dot, flexShrink: 0, opacity: active ? 1 : 0.5,
                    }} />
                  )}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

          {/* Sort segmented control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowUpDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
              {SORT_OPTIONS.map((s) => {
                const active = sort === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => onSortChange(s.value)}
                    aria-pressed={active}
                    aria-label={`Sort by ${s.label}`}
                    style={{
                      padding: '4px 10px', borderRadius: '5px', border: 'none',
                      background: active ? 'var(--bg-primary)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '12px',
                      fontWeight: active ? 600 : 400, transition: 'all 150ms',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

          {/* Add service */}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => setShowAddService(true)}
            id="add-service-btn"
          >
            Service
          </Button>
        </div>
      </div>

      {/* ── Services list ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {services.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '52px', filter: 'grayscale(0.3)' }}>🤖</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No services yet
              </p>
              <p style={{ fontSize: '13px', marginBottom: '24px', maxWidth: '260px', lineHeight: 1.6 }}>
                Add your first AI service to start tracking usage quotas and cooldowns.
              </p>
              <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowAddService(true)}>
                Add Your First Service
              </Button>
            </div>
          </div>
        ) : (
          sortedServices.map((service) => {
            const serviceAccounts = sortAccounts(
              accounts.filter((a) => a.serviceId === service.id)
            );
            const isOpen = accordionState.tracker[service.id] ?? false;
            const isDragging = draggingId === service.id;
            const isDragOver = dragOverId === service.id;
            return (
              <div
                key={service.id}
                draggable
                onDragStart={() => handleDragStart(service.id)}
                onDragOver={(e) => handleDragOver(e, service.id)}
                onDrop={() => handleDrop(service.id)}
                onDragEnd={cleanup}
                style={{
                  opacity: isDragging ? 0.45 : 1,
                  transition: 'opacity 150ms, transform 150ms',
                  outline: isDragOver ? '2px solid var(--green)' : '2px solid transparent',
                  borderRadius: '10px',
                  transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <ServiceSection
                  service={service}
                  accounts={serviceAccounts}
                  filter={filter}
                  allServices={services}
                  centralAccounts={centralAccounts}
                  accordionOpen={isOpen}
                  onAccordionToggle={(open) => onAccordionToggle(service.id, open)}
                  onUpdateAccount={onUpdateAccount}
                  onDeleteAccount={onDeleteAccount}
                  onAddAccount={onAddAccount}
                  onEditService={(s) => setEditingService(s)}
                  onDeleteService={onDeleteService}
                  onNotify={onNotify}
                  onGoToAccountsTab={onGoToAccountsTab}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Add service modal */}
      <ServiceModal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        onSave={onAddService}
        allServices={services}
      />

      {/* Edit service modal */}
      {editingService && (
        <ServiceModal
          isOpen={true}
          onClose={() => setEditingService(null)}
          onSave={(s) => { onUpdateService(s); setEditingService(null); }}
          existing={editingService}
          allServices={services}
        />
      )}
    </div>
  );
}
