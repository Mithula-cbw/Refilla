// ─── Quota Tracker (Tab 1) ────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  icon: string;        // emoji or short text
  resetIntervalHours: number | null;
  color: string;       // hex accent color
  createdAt: string;
}

export type AccountStatus = 'available' | 'cooldown' | 'unknown';

export interface Account {
  id: string;
  serviceId: string;
  label: string;
  status: AccountStatus;
  cooldownUntil: string | null;  // ISO datetime
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Vault (Tab 2) ─────────────────────────────────────────────────────────

export interface VaultService {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface VaultEntry {
  id: string;
  key: string;
  value: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultAccount {
  id: string;
  vaultServiceId: string;
  accountLabel: string;
  entries: VaultEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── App Store Shape ──────────────────────────────────────────────────────────

export interface AppStore {
  theme: 'dark' | 'light';
  activeTab: 'quota' | 'vault';
  services: Service[];
  accounts: Account[];
  vaultServices: VaultService[];
  vaultAccounts: VaultAccount[];
  windowBounds: { x: number; y: number; width: number; height: number } | null;
  quotaFilter: FilterType;
  quotaSort: SortType;
  notificationsEnabled: boolean;
  onboardingDone: boolean;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type FilterType = 'all' | 'available' | 'cooldown' | 'unknown';
export type SortType = 'name' | 'status' | 'resetTime';

export type TabId = 'quota' | 'vault';

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

// ─── IPC API (exposed via contextBridge) ─────────────────────────────────────

export interface ElectronAPI {
  // Store
  getStore: () => Promise<AppStore>;
  setStore: (data: Partial<AppStore>) => Promise<void>;
  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  // Notifications
  showNotification: (title: string, body: string) => void;
  // Shell
  openDataFolder: () => void;
  // Export / Import
  exportData: (data: string) => Promise<boolean>;
  importData: () => Promise<string | null>;
  // App info
  getVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
