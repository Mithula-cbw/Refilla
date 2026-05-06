import React from 'react';
import { AccountStatus } from '@/types';

type BadgeVariant = 'available' | 'cooldown' | 'cooldown-urgent' | 'unknown' | 'info' | 'count';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
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
  'cooldown-urgent': {
    background: 'rgba(210,153,34,0.2)',
    border: '1px solid rgba(210,153,34,0.7)',
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

export function Badge({ variant = 'info', children, style, className }: BadgeProps) {
  return (
    <span
      className={className}
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

// ─── Cooldown Badge ─────────────────────────────────────────────────────────────
// Smart badge that adapts to urgency and uses tabular monospace numbers.

interface CooldownBadgeProps {
  label: string;
  isUrgent: boolean;
  secondsLeft: number;
  /** Service accent color for urgent mode glow */
  serviceColor?: string;
}

export function CooldownBadge({ label, isUrgent, secondsLeft, serviceColor }: CooldownBadgeProps) {
  const isSoon = label === 'Resetting soon...';
  const isNow = label === 'Now' || secondsLeft <= 0;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '2px 9px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    letterSpacing: '0.01em',
    transition: 'all 300ms ease',
    fontFamily: isNow ? 'Inter, system-ui, sans-serif' : 'JetBrains Mono, monospace',
    fontVariantNumeric: 'tabular-nums',
  };

  /** Format secondsLeft as "Xm Ys" or "Xs" for the soon window */
  const formatSoon = (secs: number): string => {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  if (isNow) {
    return (
      <span style={{
        ...baseStyle,
        background: 'rgba(63,185,80,0.15)',
        border: '1px solid rgba(63,185,80,0.5)',
        color: 'var(--green)',
      }}>
        ✓ Ready
      </span>
    );
  }

  if (isSoon) {
    return (
      <span
        className="badge-cooldown-soon"
        style={{
          ...baseStyle,
          background: serviceColor ? `${serviceColor}25` : 'rgba(210,153,34,0.2)',
          border: serviceColor ? `1px solid ${serviceColor}88` : '1px solid rgba(210,153,34,0.7)',
          color: serviceColor ?? 'var(--orange)',
          boxShadow: serviceColor ? `0 0 8px ${serviceColor}30` : '0 0 8px rgba(210,153,34,0.2)',
          gap: '4px',
        }}
      >
        <span style={{ fontSize: '10px' }}>⏳</span>
        <span>{formatSoon(secondsLeft)}</span>
      </span>
    );
  }

  // Normal cooldown display with live countdown
  const urgentGlow = isUrgent && serviceColor
    ? { boxShadow: `0 0 6px ${serviceColor}28` }
    : {};

  return (
    <span
      style={{
        ...baseStyle,
        background: isUrgent
          ? (serviceColor ? `${serviceColor}18` : 'rgba(210,153,34,0.18)')
          : 'rgba(210,153,34,0.12)',
        border: isUrgent
          ? (serviceColor ? `1px solid ${serviceColor}55` : '1px solid rgba(210,153,34,0.6)')
          : '1px solid rgba(210,153,34,0.35)',
        color: serviceColor && isUrgent ? serviceColor : 'var(--orange)',
        ...urgentGlow,
      }}
    >
      {/* Small clock mark */}
      <span style={{ fontSize: '10px', opacity: 0.7 }}>⏱</span>
      {label ? `${label}` : 'Cooling down'}
    </span>
  );
}

// ─── Status Dot ─────────────────────────────────────────────────────────────────

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
