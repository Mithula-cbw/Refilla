import React from 'react';
import { Moon, Sun, Settings, Minus, Square, X } from 'lucide-react';
import { TabId } from '@/types';

interface TitlebarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  activeTab: TabId;
}

export function Titlebar({ theme, onToggleTheme, onOpenSettings, activeTab }: TitlebarProps) {
  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();
  const handleClose = () => window.electronAPI.close();

  const tabLabel = activeTab === 'quota' ? 'Quota Tracker' : 'AI Vault';

  return (
    <div
      className="drag-region"
      style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 12px 0 0',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left: App name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '14px' }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          Refilla
        </span>
        <span style={{
          width: '1px',
          height: '14px',
          background: 'var(--border)',
        }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
          {tabLabel}
        </span>
      </div>

      {/* Right: controls */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Theme toggle */}
        <TitlebarButton
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark'
            ? <Sun size={14} strokeWidth={2} />
            : <Moon size={14} strokeWidth={2} />}
        </TitlebarButton>

        {/* Settings */}
        <TitlebarButton
          onClick={onOpenSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <Settings size={14} strokeWidth={2} />
        </TitlebarButton>

        {/* Divider */}
        <span style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Window controls */}
        <TitlebarButton onClick={handleMinimize} aria-label="Minimize window" title="Minimize">
          <Minus size={12} strokeWidth={2.5} />
        </TitlebarButton>
        <TitlebarButton onClick={handleMaximize} aria-label="Maximize window" title="Maximize">
          <Square size={11} strokeWidth={2} />
        </TitlebarButton>
        <TitlebarButton
          onClick={handleClose}
          aria-label="Close window (minimizes to tray)"
          title="Close to tray"
          hoverDanger
        >
          <X size={13} strokeWidth={2.5} />
        </TitlebarButton>
      </div>
    </div>
  );
}

interface TitlebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hoverDanger?: boolean;
}

function TitlebarButton({ children, hoverDanger, style, ...rest }: TitlebarButtonProps) {
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverDanger
          ? 'rgba(248,81,73,0.15)'
          : 'var(--bg-tertiary)';
        e.currentTarget.style.color = hoverDanger ? '#f85149' : 'var(--text-primary)';
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
