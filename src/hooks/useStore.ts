import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStore, Service, Account, VaultService, VaultAccount, CentralAccount, AccordionState } from '@/types';
import { isCooldownExpired } from '@/utils/time';

const DEFAULT_STORE: AppStore = {
  schemaVersion: 2,
  theme: 'dark',
  activeTab: 'quota',
  centralAccounts: [],
  services: [],
  accounts: [],
  vaultServices: [],
  vaultAccounts: [],
  windowBounds: null,
  quotaFilter: 'all',
  quotaSort: 'name',
  notificationsEnabled: true,
  onboardingDone: false,
  accordionState: { tracker: {}, vault: {} },
  trackerServiceOrder: [],
  vaultServiceOrder: [],
};

export function useStore() {
  const [store, setStoreState] = useState<AppStore>(DEFAULT_STORE);
  const [loading, setLoading] = useState(true);
  const [expiredCount, setExpiredCount] = useState(0);
  const [migrationRan, setMigrationRan] = useState(false);

  // Debounce accordion writes
  const accordionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await window.electronAPI.getStore() as AppStore & { __migrationRan?: boolean };

        // Check if migration ran
        if (data.__migrationRan) {
          setMigrationRan(true);
          delete (data as any).__migrationRan;
        }

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

        // Ensure accordionState exists (safety for old data)
        if (!data.accordionState) {
          data.accordionState = { tracker: {}, vault: {} };
        }
        // Ensure service order arrays exist (safety for old data)
        if (!data.trackerServiceOrder) data.trackerServiceOrder = [];
        if (!data.vaultServiceOrder) data.vaultServiceOrder = [];

        setStoreState(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (updates: Partial<AppStore>) => {
    setStoreState((prev) => ({ ...prev, ...updates }));
    await window.electronAPI.setStore(updates as Record<string, unknown>);
  }, []);

  // ─── Accordion State ─────────────────────────────────────────────────────────
  const setAccordionOpen = useCallback((
    tab: 'tracker' | 'vault',
    serviceId: string,
    open: boolean
  ) => {
    setStoreState((prev) => {
      const newState: AccordionState = {
        ...prev.accordionState,
        [tab]: {
          ...prev.accordionState[tab],
          [serviceId]: open,
        },
      };
      // Debounce write
      if (accordionDebounceRef.current) clearTimeout(accordionDebounceRef.current);
      accordionDebounceRef.current = setTimeout(() => {
        window.electronAPI.setStore({ accordionState: newState });
      }, 300);
      return { ...prev, accordionState: newState };
    });
  }, []);

  const removeAccordionKey = useCallback((tab: 'tracker' | 'vault', serviceId: string) => {
    setStoreState((prev) => {
      const tabState = { ...prev.accordionState[tab] };
      delete tabState[serviceId];
      const newState: AccordionState = { ...prev.accordionState, [tab]: tabState };
      window.electronAPI.setStore({ accordionState: newState });
      return { ...prev, accordionState: newState };
    });
  }, []);

  // ─── Central Accounts ────────────────────────────────────────────────────────
  const addCentralAccount = useCallback(async (ca: CentralAccount) => {
    setStoreState((prev) => {
      const centralAccounts = [...prev.centralAccounts, ca];
      window.electronAPI.setStore({ centralAccounts });
      return { ...prev, centralAccounts };
    });
  }, []);

  const updateCentralAccount = useCallback(async (ca: CentralAccount) => {
    setStoreState((prev) => {
      const centralAccounts = prev.centralAccounts.map((x) => (x.id === ca.id ? ca : x));
      window.electronAPI.setStore({ centralAccounts });
      return { ...prev, centralAccounts };
    });
  }, []);

  const deleteCentralAccount = useCallback(async (id: string) => {
    setStoreState((prev) => {
      const centralAccounts = prev.centralAccounts.filter((x) => x.id !== id);
      window.electronAPI.setStore({ centralAccounts });
      return { ...prev, centralAccounts };
    });
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
    const trackerServiceOrder = store.trackerServiceOrder.filter((x) => x !== id);
    await persist({ services, trackerServiceOrder });
  }, [store.services, store.trackerServiceOrder, persist]);

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
    const vaultServiceOrder = store.vaultServiceOrder.filter((x) => x !== id);
    await persist({ vaultServices, vaultServiceOrder });
  }, [store.vaultServices, store.vaultServiceOrder, persist]);

  // ─── Reorder Services ────────────────────────────────────────────────────────
  const reorderServices = useCallback(async (orderedIds: string[]) => {
    await persist({ trackerServiceOrder: orderedIds });
  }, [persist]);

  const reorderVaultServices = useCallback(async (orderedIds: string[]) => {
    await persist({ vaultServiceOrder: orderedIds });
  }, [persist]);

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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (accordionDebounceRef.current) clearTimeout(accordionDebounceRef.current);
    };
  }, []);

  return {
    store,
    loading,
    expiredCount,
    migrationRan,
    persist,
    // Accordion
    setAccordionOpen,
    removeAccordionKey,
    // Central Accounts
    addCentralAccount, updateCentralAccount, deleteCentralAccount,
    // Services
    addService, updateService, deleteService,
    // Accounts
    addAccount, updateAccount, deleteAccount,
    // Vault Services
    addVaultService, updateVaultService, deleteVaultService,
    // Vault Accounts
    addVaultAccount, updateVaultAccount, deleteVaultAccount,
    // Reorder
    reorderServices, reorderVaultServices,
  };
}
