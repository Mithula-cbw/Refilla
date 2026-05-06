import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

export interface StoreSchema {
  theme: 'dark' | 'light';
  activeTab: 'quota' | 'vault';
  services: any[];
  accounts: any[];
  vaultServices: any[];
  vaultAccounts: any[];
  windowBounds: { x: number; y: number; width: number; height: number } | null;
  quotaFilter: string;
  quotaSort: string;
  notificationsEnabled: boolean;
  onboardingDone: boolean;
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

  const services = [
    { id: cursorId, name: 'Cursor', icon: '🖱️', resetIntervalHours: 24, color: '#388bfd', createdAt: now },
    { id: windsurfId, name: 'Windsurf', icon: '🏄', resetIntervalHours: 168, color: '#bc8cff', createdAt: now },
    { id: copilotId, name: 'GitHub Copilot', icon: '🤖', resetIntervalHours: 24, color: '#3fb950', createdAt: now },
  ];

  const accounts = [
    // Cursor accounts
    { id: uuidv4(), serviceId: cursorId, label: 'mithula.a@gmail.com', status: 'available', cooldownUntil: null, notes: 'Primary account', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: cursorId, label: 'dev.account2@gmail.com', status: 'cooldown', cooldownUntil: cooldown1, notes: 'Used for project X', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: cursorId, label: 'backup.cursor@gmail.com', status: 'unknown', cooldownUntil: null, notes: '', createdAt: now, updatedAt: now },
    // Windsurf accounts
    { id: uuidv4(), serviceId: windsurfId, label: 'mithula.a@gmail.com', status: 'available', cooldownUntil: null, notes: '', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: windsurfId, label: 'alt.windsurf@gmail.com', status: 'cooldown', cooldownUntil: cooldown2, notes: 'Weekly reset', createdAt: now, updatedAt: now },
    // GitHub Copilot accounts
    { id: uuidv4(), serviceId: copilotId, label: 'mithula.a@github.com', status: 'available', cooldownUntil: null, notes: 'Pro plan', createdAt: now, updatedAt: now },
    { id: uuidv4(), serviceId: copilotId, label: 'free.copilot@github.com', status: 'available', cooldownUntil: null, notes: 'Free tier', createdAt: now, updatedAt: now },
  ];

  const vaultServices = [
    { id: claudeVaultId, name: 'Claude', icon: '🧠', color: '#d29922', createdAt: now },
    { id: chatgptVaultId, name: 'ChatGPT', icon: '💬', color: '#3fb950', createdAt: now },
  ];

  const vaultAccounts = [
    {
      id: uuidv4(),
      vaultServiceId: claudeVaultId,
      accountLabel: 'mithula.a@gmail.com',
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
      accountLabel: 'mithula.a@gmail.com',
      entries: [
        { id: uuidv4(), key: 'ML model discussion', value: 'Using ResNet-50 as backbone. Fine-tuned on custom dataset. Learning rate: 1e-4, batch size: 32.', tags: ['ml', 'model'], createdAt: now, updatedAt: now },
        { id: uuidv4(), key: 'Prompt engineering notes', value: 'Chain-of-thought prompting works best. Always include few-shot examples for classification tasks.', tags: ['prompts'], createdAt: now, updatedAt: now },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];

  return { services, accounts, vaultServices, vaultAccounts };
}

// ─── Store instance ───────────────────────────────────────────────────────────
const seed = getSeedData();

export const store = new Store<StoreSchema>({
  name: 'aitrack-data',
  defaults: {
    theme: 'dark',
    activeTab: 'quota',
    services: seed.services,
    accounts: seed.accounts,
    vaultServices: seed.vaultServices,
    vaultAccounts: seed.vaultAccounts,
    windowBounds: null,
    quotaFilter: 'all',
    quotaSort: 'name',
    notificationsEnabled: true,
    onboardingDone: false,
  },
});

export function getDataPath(): string {
  return store.path;
}
