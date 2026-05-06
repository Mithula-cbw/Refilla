import { useState } from 'react';
import { Service, Account, FilterType, SortType } from '@/types';
import { ServiceSection } from './ServiceSection';
import { ServiceModal } from './AddServiceModal';
import { Button } from '@/components/UI/Button';
import { Plus, ArrowUpDown, Filter } from 'lucide-react';

interface QuotaTrackerProps {
  services: Service[];
  accounts: Account[];
  filter: FilterType;
  sort: SortType;
  onFilterChange: (f: FilterType) => void;
  onSortChange: (s: SortType) => void;
  onAddService: (s: Service) => void;
  onUpdateService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onAddAccount: (a: Account) => void;
  onUpdateAccount: (a: Account) => void;
  onDeleteAccount: (id: string) => void;
  onNotify: (title: string, body: string) => void;
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
  services, accounts, filter, sort,
  onFilterChange, onSortChange,
  onAddService, onUpdateService, onDeleteService,
  onAddAccount, onUpdateAccount, onDeleteAccount,
  onNotify,
}: QuotaTrackerProps) {
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const sortedServices = [...services].sort((a, b) => a.name.localeCompare(b.name));

  const sortAccounts = (accs: Account[]): Account[] => {
    return [...accs].sort((a, b) => {
      if (sort === 'name') return a.label.localeCompare(b.label);
      if (sort === 'status') {
        const order: Record<string, number> = { available: 0, cooldown: 1, unknown: 2 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      }
      if (sort === 'resetTime') {
        // Non-cooldown accounts go last
        if (!a.cooldownUntil && !b.cooldownUntil) return 0;
        if (!a.cooldownUntil) return 1;
        if (!b.cooldownUntil) return -1;
        return new Date(a.cooldownUntil).getTime() - new Date(b.cooldownUntil).getTime();
      }
      return 0;
    });
  };

  // Summary counts for the toolbar
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    background: active ? 'var(--bg-primary)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 150ms',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.dot && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: f.dot,
                      flexShrink: 0,
                      opacity: active ? 1 : 0.5,
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
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      background: active ? 'var(--bg-primary)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 400,
                      transition: 'all 150ms',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px',
            color: 'var(--text-muted)',
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
            return (
              <ServiceSection
                key={service.id}
                service={service}
                accounts={serviceAccounts}
                filter={filter}
                allServices={services}
                onUpdateAccount={onUpdateAccount}
                onDeleteAccount={onDeleteAccount}
                onAddAccount={onAddAccount}
                onEditService={(s) => setEditingService(s)}
                onDeleteService={onDeleteService}
                onNotify={onNotify}
              />
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
