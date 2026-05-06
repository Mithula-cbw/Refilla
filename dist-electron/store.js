"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
exports.getDataPath = getDataPath;
const electron_store_1 = __importDefault(require("electron-store"));
const uuid_1 = require("uuid");
const now = new Date().toISOString();
// ─── Seed data ────────────────────────────────────────────────────────────────
function getSeedData() {
    const cursorId = (0, uuid_1.v4)();
    const windsurfId = (0, uuid_1.v4)();
    const copilotId = (0, uuid_1.v4)();
    const claudeVaultId = (0, uuid_1.v4)();
    const chatgptVaultId = (0, uuid_1.v4)();
    const cooldown1 = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const cooldown2 = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString();
    const services = [
        { id: cursorId, name: 'Cursor', icon: '🖱️', resetIntervalHours: 24, color: '#388bfd', createdAt: now },
        { id: windsurfId, name: 'Windsurf', icon: '🏄', resetIntervalHours: 168, color: '#bc8cff', createdAt: now },
        { id: copilotId, name: 'GitHub Copilot', icon: '🤖', resetIntervalHours: 24, color: '#3fb950', createdAt: now },
    ];
    const accounts = [
        // Cursor accounts
        { id: (0, uuid_1.v4)(), serviceId: cursorId, label: 'mithula.a@gmail.com', status: 'available', cooldownUntil: null, notes: 'Primary account', createdAt: now, updatedAt: now },
        { id: (0, uuid_1.v4)(), serviceId: cursorId, label: 'dev.account2@gmail.com', status: 'cooldown', cooldownUntil: cooldown1, notes: 'Used for project X', createdAt: now, updatedAt: now },
        { id: (0, uuid_1.v4)(), serviceId: cursorId, label: 'backup.cursor@gmail.com', status: 'unknown', cooldownUntil: null, notes: '', createdAt: now, updatedAt: now },
        // Windsurf accounts
        { id: (0, uuid_1.v4)(), serviceId: windsurfId, label: 'mithula.a@gmail.com', status: 'available', cooldownUntil: null, notes: '', createdAt: now, updatedAt: now },
        { id: (0, uuid_1.v4)(), serviceId: windsurfId, label: 'alt.windsurf@gmail.com', status: 'cooldown', cooldownUntil: cooldown2, notes: 'Weekly reset', createdAt: now, updatedAt: now },
        // GitHub Copilot accounts
        { id: (0, uuid_1.v4)(), serviceId: copilotId, label: 'mithula.a@github.com', status: 'available', cooldownUntil: null, notes: 'Pro plan', createdAt: now, updatedAt: now },
        { id: (0, uuid_1.v4)(), serviceId: copilotId, label: 'free.copilot@github.com', status: 'available', cooldownUntil: null, notes: 'Free tier', createdAt: now, updatedAt: now },
    ];
    const vaultServices = [
        { id: claudeVaultId, name: 'Claude', icon: '🧠', color: '#d29922', createdAt: now },
        { id: chatgptVaultId, name: 'ChatGPT', icon: '💬', color: '#3fb950', createdAt: now },
    ];
    const vaultAccounts = [
        {
            id: (0, uuid_1.v4)(),
            vaultServiceId: claudeVaultId,
            accountLabel: 'mithula.a@gmail.com',
            entries: [
                { id: (0, uuid_1.v4)(), key: 'App architecture discussion', value: 'Discussed microservices vs monolith for the Refilla project. Decided on modular monolith.', tags: ['architecture', 'refilla'], createdAt: now, updatedAt: now },
                { id: (0, uuid_1.v4)(), key: 'API design notes', value: 'REST with versioning (/v1/). Use camelCase for JSON fields. Rate limit: 100 req/min.', tags: ['api', 'design'], createdAt: now, updatedAt: now },
                { id: (0, uuid_1.v4)(), key: 'Auth strategy', value: 'JWT with refresh tokens stored in httpOnly cookies. Access token expires in 15 minutes.', tags: ['auth', 'security'], createdAt: now, updatedAt: now },
            ],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: (0, uuid_1.v4)(),
            vaultServiceId: chatgptVaultId,
            accountLabel: 'mithula.a@gmail.com',
            entries: [
                { id: (0, uuid_1.v4)(), key: 'ML model discussion', value: 'Using ResNet-50 as backbone. Fine-tuned on custom dataset. Learning rate: 1e-4, batch size: 32.', tags: ['ml', 'model'], createdAt: now, updatedAt: now },
                { id: (0, uuid_1.v4)(), key: 'Prompt engineering notes', value: 'Chain-of-thought prompting works best. Always include few-shot examples for classification tasks.', tags: ['prompts'], createdAt: now, updatedAt: now },
            ],
            createdAt: now,
            updatedAt: now,
        },
    ];
    return { services, accounts, vaultServices, vaultAccounts };
}
// ─── Store instance ───────────────────────────────────────────────────────────
const seed = getSeedData();
exports.store = new electron_store_1.default({
    name: 'refilla-data',
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
function getDataPath() {
    return exports.store.path;
}
