import { useCallback } from 'react';
import { useToast } from '@/components/UI/ToastContext';

export function useNotifications(enabled: boolean) {
  const { addToast } = useToast();

  const notify = useCallback((title: string, body: string) => {
    if (!enabled) return;
    window.electronAPI.showNotification(title, body);
  }, [enabled]);

  const testNotification = useCallback(() => {
    notify('Refilla: Test Notification', 'Notifications are working correctly!');
    addToast('Test notification sent!', 'success');
  }, [notify, addToast]);

  return { notify, testNotification };
}
