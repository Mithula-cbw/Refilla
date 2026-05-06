import { useEffect, useState } from 'react';
import { Titlebar } from '@/components/Titlebar/Titlebar';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { QuotaTracker } from '@/components/QuotaTracker/QuotaTracker';
import { AIVault } from '@/components/AIVault/AIVault';
import { SettingsPanel } from '@/components/Settings/SettingsPanel';
import { OnboardingOverlay } from '@/components/UI/OnboardingOverlay';
import { SkeletonLoader } from '@/components/UI/SkeletonLoader';
import { ErrorBoundary } from '@/components/UI/ErrorBoundary';
import { useStore } from '@/hooks/useStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/components/UI/ToastContext';
import { TabId } from '@/types';

export default function App() {
  const {
    store, loading, expiredCount, persist,
    addService, updateService, deleteService,
    addAccount, updateAccount, deleteAccount,
    addVaultService, updateVaultService, deleteVaultService,
    addVaultAccount, updateVaultAccount, deleteVaultAccount,
  } = useStore();

  const { addToast } = useToast();
  const { notify, testNotification } = useNotifications(store.notificationsEnabled);

  const [activeTab, setActiveTab] = useState<TabId>('quota');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [version, setVersion] = useState('1.0.0');

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light', store.theme === 'light');
  }, [store.theme]);

  // Sync active tab from store
  useEffect(() => {
    if (!loading) setActiveTab(store.activeTab);
  }, [loading]);

  // Get app version
  useEffect(() => {
    window.electronAPI.getVersion().then(setVersion).catch(() => {});
  }, []);

  // Toast for expired accounts on startup
  useEffect(() => {
    if (!loading && expiredCount > 0) {
      addToast(
        `${expiredCount} account${expiredCount > 1 ? 's' : ''} became available while you were away`,
        'success'
      );
    }
  }, [loading, expiredCount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSettingsOpen(false);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); handleTabChange('quota'); }
        else if (e.key === '2') { e.preventDefault(); handleTabChange('vault'); }
        else if (e.key === ',') { e.preventDefault(); setSettingsOpen((p) => !p); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    persist({ activeTab: tab });
  };

  const handleToggleTheme = () => {
    const next = store.theme === 'dark' ? 'light' : 'dark';
    persist({ theme: next });
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const handleOnboardingDone = () => {
    persist({ onboardingDone: true });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
        <Titlebar
          theme={store.theme}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setSettingsOpen(true)}
          activeTab={activeTab}
        />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <main style={{ flex: 1, overflow: 'hidden' }}>
            <SkeletonLoader />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Titlebar */}
      <Titlebar
        theme={store.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
        activeTab={activeTab}
      />

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'quota' && (
            <ErrorBoundary tabName="Quota Tracker">
              <QuotaTracker
                services={store.services}
                accounts={store.accounts}
                filter={store.quotaFilter}
                sort={store.quotaSort}
                onFilterChange={(f) => persist({ quotaFilter: f })}
                onSortChange={(s) => persist({ quotaSort: s })}
                onAddService={addService}
                onUpdateService={updateService}
                onDeleteService={deleteService}
                onAddAccount={addAccount}
                onUpdateAccount={updateAccount}
                onDeleteAccount={deleteAccount}
                onNotify={notify}
              />
            </ErrorBoundary>
          )}
          {activeTab === 'vault' && (
            <ErrorBoundary tabName="AI Vault">
              <AIVault
                vaultServices={store.vaultServices}
                vaultAccounts={store.vaultAccounts}
                onAddVaultService={addVaultService}
                onUpdateVaultService={updateVaultService}
                onDeleteVaultService={deleteVaultService}
                onAddVaultAccount={addVaultAccount}
                onUpdateVaultAccount={updateVaultAccount}
                onDeleteVaultAccount={deleteVaultAccount}
              />
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        store={store}
        onPersist={persist}
        onTestNotification={testNotification}
        version={version}
      />

      {/* Onboarding */}
      {!store.onboardingDone && (
        <OnboardingOverlay onDone={handleOnboardingDone} />
      )}
    </div>
  );
}
