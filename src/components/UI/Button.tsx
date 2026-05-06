import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'rgba(56,139,253,0.15)',
    border: '1px solid #388bfd',
    color: '#388bfd',
  },
  secondary: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-secondary)',
  },
  danger: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.4)',
    color: '#f85149',
  },
  success: {
    background: 'rgba(63,185,80,0.1)',
    border: '1px solid rgba(63,185,80,0.4)',
    color: '#3fb950',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: '12px', borderRadius: '5px', gap: '5px' },
  md: { padding: '7px 14px', fontSize: '13px', borderRadius: '6px', gap: '6px' },
  lg: { padding: '10px 18px', fontSize: '14px', borderRadius: '7px', gap: '8px' },
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease',
        opacity: isDisabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.filter = 'brightness(1.15)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
        e.currentTarget.style.transform = '';
        rest.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        rest.onMouseDown?.(e);
      }}
    >
      {loading ? <span style={{ fontSize: '12px' }}>⟳</span> : icon}
      {children}
      {iconRight}
    </button>
  );
}

// Icon-only button
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function IconButton({ icon, label, variant = 'ghost', size = 'sm', style, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease',
        borderRadius: '6px',
        ...variantStyles[variant],
        padding: size === 'sm' ? '5px' : size === 'lg' ? '9px' : '7px',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!rest.disabled) e.currentTarget.style.filter = 'brightness(1.2)';
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
        rest.onMouseLeave?.(e);
      }}
    >
      {icon}
    </button>
  );
}
