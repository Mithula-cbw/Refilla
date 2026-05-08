import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

// ─── Avatar color palette (matches existing color system) ─────────────────────
const AVATAR_COLORS = [
  '#388bfd', '#4caf6e', '#d29922', '#bc8cff',
  '#79c0ff', '#f85149', '#56d364', '#e3b341',
];

let avatarColorIndex = 0;
function nextAvatarColor(): string {
  const color = AVATAR_COLORS[avatarColorIndex % AVATAR_COLORS.length];
  avatarColorIndex++;
  return color;
}

export interface StoreSchema {
  schemaVersion: number;
  theme: 'dark' | 'light';
  activeTab: 'quota' | 'vault' | 'accounts';
  centralAccounts: any[];
  services: any[];
  accounts: any[];
  vaultServices: any[];
  vaultAccounts: any[];
  windowBounds: { x: number; y: number; width: number; height: number } | null;
  quotaFilter: string;
  quotaSort: string;
  notificationsEnabled: boolean;
  onboardingDone: boolean;
  accordionState: { tracker: Record<string, boolean>; vault: Record<string, boolean> };
  migrationErrors: string[];
}

const now = new Date().toISOString();

// ─── Seed data ────────────────────────────────────────────────────────────────
function getSeedData() {
  const cursorId = uuidv4();
  const windsurfId = uuidv4();
  const copilotId = uuidv4();

  const claudeVaultId = uuidv4();
  const chatgptVaultId = uuidv4();

  const cooldown1 = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const cooldown2 = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString();

  // Create central accounts
  const ca1 = { id: uuidv4(), label: 'mithula.a@gmail.com', color: AVATAR_COLORS[0], browsers: ['Chrome', 'Brave'], notes: 'Primary account', createdAt: now, updatedAt: now };
  const ca2 = { id: uuidv4(), label: 'dev.account2@gmail.com', color: AVATAR_COLORS[1], browsers: ['Firefox'], notes: '', createdAt: now, updatedAt: now };
  const ca3 = { id: uuidv4(), label: 'backup.cursor@gmail.com', color: AVATAR_COLORS[2], browsers: [], notes: '', createdAt: now, updatedAt: now };
  const ca4 = { id: uuidv4(), label: 'alt.windsurf@gmail.com', color: AVATAR_COLORS[3], browsers: ['Edge'], notes: '', createdAt: now, updatedAt: now };
  const ca5 = { id: uuidv4(), label: 'mithula.a@github.com', color: AVATAR_COLORS[4], browsers: ['Chrome'], notes: 'Pro plan', createdAt: now, updatedAt: now };
  const ca6 = { id: uuidv4(), label: 'free.copilot@github.com', color: AVATAR_COLORS[5], browsers: [], notes: 'Free tier', createdAt: now, updatedAt: now };

  const centralAccounts = [ca1, ca2, ca3, ca4, ca5, ca6];

  const services = [
    { id: cursorId, name: 'Cursor', icon: '🖱️', resetIntervalHours: 24, color: '#388bfd', createdAt: now },
    { id: windsurfId, name: 'Windsurf', icon: '🏄', resetIntervalHours: 168, color: '#bc8cff', createdAt: now },
    { id: copilotId, name: 'GitHub Copilot', icon: '🤖', resetIntervalHours: 24, color: '#3fb950', createdAt: now },
  ];

  const accounts = [
    // Cursor accounts
    { id: uuidv4(), serviceId: cursorId, centralAccountId: ca1.id, status: 'available', cooldownUntil: null, notes: 'Primary account', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: cursorId, centralAccountId: ca2.id, status: 'cooldown', cooldownUntil: cooldown1, notes: 'Used for project X', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: cursorId, centralAccountId: ca3.id, status: 'unknown', cooldownUntil: null, notes: '', createdAt: now, updatedAt: now },
    // Windsurf accounts
    { id: uuidv4(), serviceId: windsurfId, centralAccountId: ca1.id, status: 'available', cooldownUntil: null, notes: '', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: windsurfId, centralAccountId: ca4.id, status: 'cooldown', cooldownUntil: cooldown2, notes: 'Weekly reset', createdAt: now, updatedAt: now },
    // GitHub Copilot accounts
    { id: uuidv4(), serviceId: copilotId, centralAccountId: ca5.id, status: 'available', cooldownUntil: null, notes: 'Pro plan', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: copilotId, centralAccountId: ca6.id, status: 'available', cooldownUntil: null, notes: 'Free tier', createdAt: now, updatedAt: now },
  ];

  const vaultServices = [
    { id: claudeVaultId, name: 'Claude', icon: '🧠', color: '#d29922', createdAt: now },
    { id: chatgptVaultId, name: 'ChatGPT', icon: '💬', color: '#3fb950', createdAt: now },
  ];

  const vaultAccounts = [
    {
      id: uuidv4(),
      vaultServiceId: claudeVaultId,
      centralAccountId: ca1.id,
      entries: [
        { id: uuidv4(), key: 'App architecture discussion', value: 'Discussed microservices vs monolith for the Refilla project. Decided on modular monolith.', tags: ['architecture', 'refilla'], createdAt: now, updatedAt: now },
        { id: uuidv4(), key: 'API design notes', value: 'REST with versioning (/v1/). Use camelCase for JSON fields. Rate limit: 100 req/min.', tags: ['api', 'design'], createdAt: now, updatedAt: now },
        { id: uuidv4(), key: 'Auth strategy', value: 'JWT with refresh tokens stored in httpOnly cookies. Access token expires in 15 minutes.', tags: ['auth', 'security'], createdAt: now, updatedAt: now },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      vaultServiceId: chatgptVaultId,
      centralAccountId: ca1.id,
      entries: [
        { id: uuidv4(), key: 'ML model discussion', value: 'Using ResNet-50 as backbone. Fine-tuned on custom dataset. Learning rate: 1e-4, batch size: 32.', tags: ['ml', 'model'], createdAt: now, updatedAt: now },
        { id: uuidv4(), key: 'Prompt engineering notes', value: 'Chain-of-thought prompting works best. Always include few-shot examples for classification tasks.', tags: ['prompts'], createdAt: now, updatedAt: now },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const accordionState = {
    tracker: {
      [cursorId]: false,
      [windsurfId]: false,
      [copilotId]: false,
    },
    vault: {
      [claudeVaultId]: false,
      [chatgptVaultId]: false,
    },
  };

  return { centralAccounts, services, accounts, vaultServices, vaultAccounts, accordionState };
}

// ─── Store instance ───────────────────────────────────────────────────────────
const seed = getSeedData();

export const store = new Store<StoreSchema>({
  name: 'refilla-data',
  defaults: {
    schemaVersion: 2,
    theme: 'dark',
    activeTab: 'quota',
    centralAccounts: seed.centralAccounts,
    services: seed.services,
    accounts: seed.accounts,
    vaultServices: seed.vaultServices,
    vaultAccounts: seed.vaultAccounts,
    windowBounds: null,
    quotaFilter: 'all',
    quotaSort: 'name',
    notificationsEnabled: true,
    onboardingDone: false,
    accordionState: seed.accordionState,
    migrationErrors: [],
  },
});

export function getDataPath(): string {
  return store.path;
}

// ─── Schema Migration v1 → v2 ─────────────────────────────────────────────────
export function runMigration(): boolean {
  const version = (store.get('schemaVersion') as number | undefined) ?? 1;
  if (version >= 2) return false; // nothing to do

  const errors: string[] = [];
  const migratedCentralAccounts: any[] = [];
  const labelToIdMap = new Map<string, string>(); // label.lower → centralAccountId

  function getOrCreateCA(label: string): string {
    const key = label.toLowerCase().trim();
    if (labelToIdMap.has(key)) return labelToIdMap.get(key)!;

    const existing = migratedCentralAccounts.find(
      (ca) => ca.label.toLowerCase() === key
    );
    if (existing) {
      labelToIdMap.set(key, existing.id);
      return existing.id;
    }

    const newCA = {
      id: uuidv4(),
      label: label.trim(),
      color: nextAvatarColor(),
      browsers: [],
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    migratedCentralAccounts.push(newCA);
    labelToIdMap.set(key, newCA.id);
    return newCA.id;
  }

  // Migrate tracker accounts
  const oldAccounts = store.get('accounts') as any[];
  const newAccounts: any[] = [];
  for (const acc of oldAccounts) {
    try {
      if (acc.centralAccountId) {
        // Already migrated
        newAccounts.push(acc);
        continue;
      }
      const label = acc.label ?? '';
      const centralAccountId = getOrCreateCA(label);
      const { label: _removed, ...rest } = acc;
      newAccounts.push({ ...rest, centralAccountId });
    } catch (e: any) {
      errors.push(`account ${acc.id}: ${e?.message ?? String(e)}`);
    }
  }

  // Migrate vault accounts
  const oldVaultAccounts = store.get('vaultAccounts') as any[];
  const newVaultAccounts: any[] = [];
  for (const va of oldVaultAccounts) {
    try {
      if (va.centralAccountId) {
        newVaultAccounts.push(va);
        continue;
      }
      const label = va.accountLabel ?? '';
      const centralAccountId = getOrCreateCA(label);
      const { accountLabel: _removed, ...rest } = va;
      newVaultAccounts.push({ ...rest, centralAccountId });
    } catch (e: any) {
      errors.push(`vaultAccount ${va.id}: ${e?.message ?? String(e)}`);
    }
  }

  // Build default accordion state (all closed)
  const services = store.get('services') as any[];
  const vaultServices = store.get('vaultServices') as any[];
  const accordionState = {
    tracker: Object.fromEntries(services.map((s: any) => [s.id, false])),
    vault: Object.fromEntries(vaultServices.map((s: any) => [s.id, false])),
  };

  // Persist migration
  store.set('centralAccounts', migratedCentralAccounts);
  store.set('accounts', newAccounts);
  store.set('vaultAccounts', newVaultAccounts);
  store.set('accordionState', accordionState);
  store.set('schemaVersion', 2);
  if (errors.length > 0) {
    store.set('migrationErrors', errors);
  }

  return true; // migration ran
}
