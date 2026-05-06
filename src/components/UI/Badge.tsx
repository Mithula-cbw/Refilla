import React from 'react';
import { AccountStatus } from '@/types';

type BadgeVariant = 'available' | 'cooldown' | 'unknown' | 'info' | 'count';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  available: {
    background: 'rgba(63,185,80,0.15)',
    border: '1px solid rgba(63,185,80,0.4)',
    color: 'var(--green)',
  },
  cooldown: {
    background: 'rgba(210,153,34,0.15)',
    border: '1px solid rgba(210,153,34,0.4)',
    color: 'var(--orange)',
  },
  unknown: {
    background: 'rgba(139,148,158,0.15)',
    border: '1px solid rgba(139,148,158,0.3)',
    color: 'var(--text-secondary)',
  },
  info: {
    background: 'rgba(56,139,253,0.15)',
    border: '1px solid rgba(56,139,253,0.4)',
    color: 'var(--blue)',
  },
  count: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
};

export function Badge({ variant = 'info', children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        ...badgeStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Status dot indicator
interface StatusDotProps {
  status: AccountStatus;
  size?: number;
}

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  const colors: Record<AccountStatus, string> = {
    available: '#3fb950',
    cooldown: '#d29922',
    unknown: '#484f58',
  };

  return (
    <span
      aria-hidden="true"
      className={status === 'cooldown' ? 'status-dot-cooldown' : ''}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[status],
        flexShrink: 0,
        boxShadow: status === 'available'
          ? '0 0 6px rgba(63,185,80,0.5)'
          : status === 'cooldown'
          ? '0 0 6px rgba(210,153,34,0.4)'
          : 'none',
      }}
    />
  );
}
