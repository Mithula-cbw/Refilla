import { BarChart2, BookOpen } from 'lucide-react';
import { TabId } from '@/types';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof BarChart2; description: string }[] = [
  { id: 'quota', label: 'Quota Tracker', icon: BarChart2, description: 'Manage account quotas & cooldowns' },
  { id: 'vault', label: 'AI Vault', icon: BookOpen, description: 'Store conversation context & notes' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      aria-label="Navigation sidebar"
      style={{
        width: '200px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
        gap: '4px',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            title={tab.description}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: isActive ? 'rgba(56,139,253,0.1)' : 'transparent',
              color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              textAlign: 'left',
              width: '100%',
              transition: 'all 150ms ease',
              position: 'relative',
              borderLeft: `3px solid ${isActive ? 'var(--blue)' : 'transparent'}`,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Icon
              size={16}
              strokeWidth={isActive ? 2.5 : 2}
              style={{ flexShrink: 0 }}
            />
            <span style={{ fontSize: '13px' }}>{tab.label}</span>
          </button>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer hint */}
      <div style={{
        padding: '8px 12px',
        fontSize: '10px',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        <div style={{ marginBottom: '2px' }}>⌘1 Quota Tracker</div>
        <div>⌘2 AI Vault</div>
      </div>
    </aside>
  );
}
