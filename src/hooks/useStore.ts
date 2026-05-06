import { useState, useEffect, useCallback } from 'react';
import { AppStore, Service, Account, VaultService, VaultAccount } from '@/types';
import { isCooldownExpired } from '@/utils/time';

const DEFAULT_STORE: AppStore = {
  theme: 'dark',
  activeTab: 'quota',
  services: [],
  accounts: [],
  vaultServices: [],
  vaultAccounts: [],
  windowBounds: null,
  quotaFilter: 'all',
  quotaSort: 'name',
  notificationsEnabled: true,
  onboardingDone: false,
};

export function useStore() {
  const [store, setStoreState] = useState<AppStore>(DEFAULT_STORE);
  const [loading, setLoading] = useState(true);
  const [expiredCount, setExpiredCount] = useState(0);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await window.electronAPI.getStore();
        // Auto-resolve expired cooldowns
        let expired = 0;
        const updatedAccounts = data.accounts.map((a: Account) => {
          if (a.status === 'cooldown' && isCooldownExpired(a.cooldownUntil)) {
            expired++;
            return { ...a, status: 'available' as const, cooldownUntil: null };
          }
          return a;
        });

        if (expired > 0) {
          setExpiredCount(expired);
          data.accounts = updatedAccounts;
          await window.electronAPI.setStore({ accounts: updatedAccounts });
        }

        setStoreState(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (updates: Partial<AppStore>) => {
    setStoreState((prev) => ({ ...prev, ...updates }));
    await window.electronAPI.setStore(updates);
  }, []);

  // ─── Services ───────────────────────────────────────────────────────────────
  const addService = useCallback(async (s: Service) => {
    const services = [...store.services, s];
    await persist({ services });
  }, [store.services, persist]);

  const updateService = useCallback(async (s: Service) => {
    const services = store.services.map((x) => (x.id === s.id ? s : x));
    await persist({ services });
  }, [store.services, persist]);

  const deleteService = useCallback(async (id: string) => {
    const services = store.services.filter((x) => x.id !== id);
    await persist({ services });
  }, [store.services, persist]);

  // ─── Accounts ───────────────────────────────────────────────────────────────
  const addAccount = useCallback(async (a: Account) => {
    const accounts = [...store.accounts, a];
    await persist({ accounts });
  }, [store.accounts, persist]);

  const updateAccount = useCallback(async (a: Account) => {
    const accounts = store.accounts.map((x) => (x.id === a.id ? a : x));
    await persist({ accounts });
  }, [store.accounts, persist]);

  const deleteAccount = useCallback(async (id: string) => {
    const accounts = store.accounts.filter((x) => x.id !== id);
    await persist({ accounts });
  }, [store.accounts, persist]);

  // ─── Vault Services ─────────────────────────────────────────────────────────
  const addVaultService = useCallback(async (vs: VaultService) => {
    const vaultServices = [...store.vaultServices, vs];
    await persist({ vaultServices });
  }, [store.vaultServices, persist]);

  const updateVaultService = useCallback(async (vs: VaultService) => {
    const vaultServices = store.vaultServices.map((x) => (x.id === vs.id ? vs : x));
    await persist({ vaultServices });
  }, [store.vaultServices, persist]);

  const deleteVaultService = useCallback(async (id: string) => {
    const vaultServices = store.vaultServices.filter((x) => x.id !== id);
    await persist({ vaultServices });
  }, [store.vaultServices, persist]);

  // ─── Vault Accounts ─────────────────────────────────────────────────────────
  const addVaultAccount = useCallback(async (va: VaultAccount) => {
    const vaultAccounts = [...store.vaultAccounts, va];
    await persist({ vaultAccounts });
  }, [store.vaultAccounts, persist]);

  const updateVaultAccount = useCallback(async (va: VaultAccount) => {
    const vaultAccounts = store.vaultAccounts.map((x) => (x.id === va.id ? va : x));
    await persist({ vaultAccounts });
  }, [store.vaultAccounts, persist]);

  const deleteVaultAccount = useCallback(async (id: string) => {
    const vaultAccounts = store.vaultAccounts.filter((x) => x.id !== id);
    await persist({ vaultAccounts });
  }, [store.vaultAccounts, persist]);

  return {
    store,
    loading,
    expiredCount,
    persist,
    // Services
    addService, updateService, deleteService,
    // Accounts
    addAccount, updateAccount, deleteAccount,
    // Vault Services
    addVaultService, updateVaultService, deleteVaultService,
    // Vault Accounts
    addVaultAccount, updateVaultAccount, deleteVaultAccount,
  };
}
