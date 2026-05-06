import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, id, ...rest }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        {...rest}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-tertiary)',
          border: `1px solid ${error ? '#f85149' : 'var(--border)'}`,
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 150ms',
          width: '100%',
          fontFamily: 'Inter, system-ui, sans-serif',
          ...rest.style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--blue)';
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#f85149' : 'var(--border)';
          rest.onBlur?.(e);
        }}
      />
      {error && <span style={{ fontSize: '11px', color: '#f85149' }}>{error}</span>}
      {helpText && !error && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{helpText}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Textarea({ label, error, helpText, id, ...rest }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        {...rest}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-tertiary)',
          border: `1px solid ${error ? '#f85149' : 'var(--border)'}`,
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 150ms',
          width: '100%',
          resize: 'vertical',
          minHeight: '80px',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1.5,
          ...rest.style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--blue)';
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#f85149' : 'var(--border)';
          rest.onBlur?.(e);
        }}
      />
      {error && <span style={{ fontSize: '11px', color: '#f85149' }}>{error}</span>}
      {helpText && !error && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{helpText}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, id, children, ...rest }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        id={id}
        {...rest}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-tertiary)',
          border: `1px solid ${error ? '#f85149' : 'var(--border)'}`,
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'Inter, system-ui, sans-serif',
          ...rest.style,
        }}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: '11px', color: '#f85149' }}>{error}</span>}
    </div>
  );
}
