import { useEffect, useState } from 'react';
import { Titlebar } from '@/components/Titlebar/Titlebar';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { QuotaTracker } from '@/components/QuotaTracker/QuotaTracker';
import { AIVault } from '@/components/AIVault/AIVault';
import { AccountsTab } from '@/components/Accounts/AccountsTab';
import { SettingsPanel } from '@/components/Settings/SettingsPanel';
import { OnboardingOverlay } from '@/components/UI/OnboardingOverlay';
import { SkeletonLoader } from '@/components/UI/SkeletonLoader';
import { ErrorBoundary } from '@/components/UI/ErrorBoundary';
import { useStore } from '@/hooks/useStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/components/UI/ToastContext';
import { TabId, CentralAccount } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { nextAvatarColor } from '@/utils/avatar';

export default function App() {
  const {
    store, loading, expiredCount, migrationRan, persist,
    setAccordionOpen, removeAccordionKey,
    addCentralAccount, updateCentralAccount, deleteCentralAccount,
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

  // Toast for migration
  useEffect(() => {
    if (!loading && migrationRan) {
      addToast('Upgraded to v2.0 — your data has been migrated', 'info');
    }
  }, [loading, migrationRan]);

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
        else if (e.key === '3') { e.preventDefault(); handleTabChange('accounts'); }
        else if (e.key === ',') { e.preventDefault(); setSettingsOpen((p) => !p); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Visibility change — pause/resume background throttling feedback
  useEffect(() => {
    const handleVisibility = () => {
      // Renderer-side: the main process handles throttling via win events
      // but we can re-trigger countdown recalculations on show
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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

  // Navigate to vault tab and scroll to service
  const handleNavigateToVault = (vaultServiceId: string) => {
    handleTabChange('vault');
    setTimeout(() => {
      const el = document.getElementById(`vault-section-${vaultServiceId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Accordion toggles
  const handleTrackerAccordion = (serviceId: string, open: boolean) => {
    setAccordionOpen('tracker', serviceId, open);
  };
  const handleVaultAccordion = (serviceId: string, open: boolean) => {
    setAccordionOpen('vault', serviceId, open);
  };

  // Delete service: also clean up accordion key
  const handleDeleteService = async (id: string) => {
    await deleteService(id);
    removeAccordionKey('tracker', id);
  };
  const handleDeleteVaultService = async (id: string) => {
    await deleteVaultService(id);
    removeAccordionKey('vault', id);
  };

  // Handle delete central account: also remove from tracker and vault
  const handleDeleteCentralAccount = async (id: string) => {
    // Remove linked tracker accounts
    const linkedTracker = store.accounts.filter((a) => a.centralAccountId === id);
    if (linkedTracker.length > 0) {
      const newAccounts = store.accounts.filter((a) => a.centralAccountId !== id);
      await persist({ accounts: newAccounts });
    }
    // Remove linked vault accounts
    const linkedVault = store.vaultAccounts.filter((a) => a.centralAccountId === id);
    if (linkedVault.length > 0) {
      const newVaultAccounts = store.vaultAccounts.filter((a) => a.centralAccountId !== id);
      await persist({ vaultAccounts: newVaultAccounts });
    }
    await deleteCentralAccount(id);
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
                centralAccounts={store.centralAccounts}
                accordionState={store.accordionState}
                filter={store.quotaFilter}
                sort={store.quotaSort}
                onFilterChange={(f) => persist({ quotaFilter: f })}
                onSortChange={(s) => persist({ quotaSort: s })}
                onAddService={addService}
                onUpdateService={updateService}
                onDeleteService={handleDeleteService}
                onAddAccount={addAccount}
                onUpdateAccount={updateAccount}
                onDeleteAccount={deleteAccount}
                onNotify={notify}
                onAccordionToggle={handleTrackerAccordion}
                onGoToAccountsTab={() => handleTabChange('accounts')}
              />
            </ErrorBoundary>
          )}
          {activeTab === 'vault' && (
            <ErrorBoundary tabName="AI Vault">
              <AIVault
                vaultServices={store.vaultServices}
                vaultAccounts={store.vaultAccounts}
                centralAccounts={store.centralAccounts}
                accordionState={store.accordionState}
                onAddVaultService={addVaultService}
                onUpdateVaultService={updateVaultService}
                onDeleteVaultService={handleDeleteVaultService}
                onAddVaultAccount={addVaultAccount}
                onUpdateVaultAccount={updateVaultAccount}
                onDeleteVaultAccount={deleteVaultAccount}
                onAccordionToggle={handleVaultAccordion}
                onGoToAccountsTab={() => handleTabChange('accounts')}
              />
            </ErrorBoundary>
          )}
          {activeTab === 'accounts' && (
            <ErrorBoundary tabName="Accounts">
              <AccountsTab
                centralAccounts={store.centralAccounts}
                trackerAccounts={store.accounts}
                vaultAccounts={store.vaultAccounts}
                services={store.services}
                vaultServices={store.vaultServices}
                onAdd={addCentralAccount}
                onUpdate={updateCentralAccount}
                onDelete={handleDeleteCentralAccount}
                onNavigateToVault={handleNavigateToVault}
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
