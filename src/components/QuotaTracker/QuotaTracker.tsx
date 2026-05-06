import { useState } from 'react';
import { Service, Account, FilterType, SortType } from '@/types';
import { ServiceSection } from './ServiceSection';
import { ServiceModal } from './AddServiceModal';
import { Button } from '@/components/UI/Button';
import { Plus } from 'lucide-react';

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

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'cooldown', label: 'On Cooldown' },
  { value: 'unknown', label: 'Unknown' },
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
        const order = { available: 0, cooldown: 1, unknown: 2 };
        return order[a.status] - order[b.status];
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Quota Tracker
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                aria-pressed={filter === f.value}
                aria-label={`Filter: ${f.label}`}
                style={{
                  padding: '5px 12px',
                  borderRadius: '99px',
                  border: `1px solid ${filter === f.value ? 'var(--blue)' : 'var(--border)'}`,
                  background: filter === f.value ? 'rgba(56,139,253,0.15)' : 'var(--bg-tertiary)',
                  color: filter === f.value ? 'var(--blue)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: filter === f.value ? 600 : 400,
                  transition: 'all 150ms',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            aria-label="Sort accounts"
            style={{
              padding: '5px 10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <option value="name">By Name</option>
            <option value="status">By Status</option>
            <option value="resetTime">By Reset Time</option>
          </select>

          {/* Add service */}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowAddService(true)}
            id="add-service-btn"
          >
            Add Service
          </Button>
        </div>
      </div>

      {/* Services list */}
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
            <div style={{ fontSize: '48px' }}>🤖</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No services yet
              </p>
              <p style={{ fontSize: '13px', marginBottom: '20px' }}>
                Add your first AI service to start tracking quotas
              </p>
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddService(true)}>
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
