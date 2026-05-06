import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toast, ToastType } from '@/types';

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const queueRef = useRef<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => {
        const next = prev.filter((t) => t.id !== id);
        // Drain queue
        if (queueRef.current.length > 0) {
          const [queued, ...rest] = queueRef.current;
          queueRef.current = rest;
          return [...next, queued];
        }
        return next;
      });
    }, 220);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const toast: Toast = { id: uuidv4(), type, message };
    setToasts((prev) => {
      if (prev.length >= 3) {
        queueRef.current = [...queueRef.current, toast];
        return prev;
      }
      return [...prev, toast];
    });
    setTimeout(() => removeToast(toast.id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

const typeConfig: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: { bg: 'var(--bg-secondary)', border: '#4caf6e', icon: '✓', iconColor: '#4caf6e' },
  warning: { bg: 'var(--bg-secondary)', border: '#d29922', icon: '⚠', iconColor: '#d29922' },
  error:   { bg: 'var(--bg-secondary)', border: '#f85149', icon: '✕', iconColor: '#f85149' },
  info:    { bg: 'var(--bg-secondary)', border: '#388bfd', icon: 'ℹ', iconColor: '#388bfd' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const cfg = typeConfig[toast.type];
  return (
    <div
      role="alert"
      className={toast.exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        pointerEvents: 'all',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.border}`,
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '260px',
        maxWidth: '360px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
        outline: `1px solid var(--border)`,
      }}
    >
      <span style={{ color: cfg.iconColor, fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
        {cfg.icon}
      </span>
      <span style={{ color: 'var(--text-primary)', fontSize: '13px', flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
