"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const store_1 = require("./store");
const isDev = process.env.NODE_ENV === 'development';
// Fix notification sender name on Windows (prevents "electron.app.electron")
if (process.platform === 'win32') {
    electron_1.app.setAppUserModelId('Refilla');
}
// ─── Background performance switches ──────────────────────────────────────────
// Allow renderer to keep running at normal speed; only throttle when hidden
electron_1.app.commandLine.appendSwitch('disable-renderer-backgrounding', 'false');
electron_1.app.commandLine.appendSwitch('renderer-process-limit', '2');
let mainWindow = null;
let tray = null;
// ─── Smart notification scheduler ────────────────────────────────────────────
// Single chained setTimeout (zero CPU between resets).
// accountId → active timer handle
const notificationTimers = new Map();
/**
 * Cancel all existing notification timers, then scan accounts once and set
 * exactly ONE setTimeout per account that has an upcoming reset.
 * On fire: send notification, then re-schedule for the next reset.
 */
function scheduleNotifications() {
    const accounts = store_1.store.get('accounts');
    const services = store_1.store.get('services');
    const notificationsEnabled = store_1.store.get('notificationsEnabled');
    // Cancel any running timers first
    notificationTimers.forEach((t) => clearTimeout(t));
    notificationTimers.clear();
    if (!notificationsEnabled)
        return;
    for (const account of accounts) {
        if (account.status === 'cooldown' && account.cooldownUntil) {
            const resetTime = new Date(account.cooldownUntil).getTime();
            const delay = resetTime - Date.now();
            if (delay > 0) {
                const service = services.find((s) => s.id === account.serviceId);
                const serviceName = service?.name ?? 'Unknown Service';
                const fire = () => {
                    if (!electron_1.Notification.isSupported())
                        return;
                    const notif = new electron_1.Notification({
                        title: 'Refilla: Account Ready',
                        body: `${account.label} on ${serviceName} is now available`,
                        icon: path.join(__dirname, '../build/logo.png'),
                        timeoutType: 'default',
                    });
                    notif.show();
                    // Auto-close after 5 s
                    setTimeout(() => { try {
                        notif.close();
                    }
                    catch { /* noop */ } }, 5000);
                    notificationTimers.delete(account.id);
                };
                const timer = setTimeout(fire, delay);
                notificationTimers.set(account.id, timer);
            }
        }
    }
}
// ─── Window creation ──────────────────────────────────────────────────────────
function createWindow() {
    const savedBounds = store_1.store.get('windowBounds');
    const logoPath = path.join(__dirname, '../build/logo.png');
    mainWindow = new electron_1.BrowserWindow({
        width: savedBounds?.width ?? 1100,
        height: savedBounds?.height ?? 700,
        x: savedBounds?.x ?? undefined,
        y: savedBounds?.y ?? undefined,
        minWidth: 900,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#1e2235',
        icon: fs.existsSync(logoPath) ? logoPath : undefined,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    // Load app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    // Show once ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        // Initially visible — no throttling
        mainWindow?.webContents.setBackgroundThrottling(false);
    });
    // Save window bounds on resize/move
    const saveBounds = () => {
        if (!mainWindow)
            return;
        const bounds = mainWindow.getBounds();
        store_1.store.set('windowBounds', bounds);
    };
    mainWindow.on('resize', saveBounds);
    mainWindow.on('move', saveBounds);
    // Throttle CPU when window is hidden (minimize to tray on close)
    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow?.webContents.setBackgroundThrottling(true);
        mainWindow?.hide();
    });
    // Un-throttle when window comes back
    mainWindow.on('show', () => {
        mainWindow?.webContents.setBackgroundThrottling(false);
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// ─── System Tray ──────────────────────────────────────────────────────────────
function createTray() {
    const iconPath = path.join(__dirname, '../build/logo.png');
    let icon;
    if (fs.existsSync(iconPath)) {
        icon = electron_1.nativeImage.createFromPath(iconPath);
        icon = icon.resize({ width: 16, height: 16 });
    }
    else {
        icon = electron_1.nativeImage.createEmpty();
    }
    tray = new electron_1.Tray(icon);
    tray.setToolTip('Refilla');
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Open Refilla',
            click: () => {
                mainWindow?.show();
                mainWindow?.focus();
            },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                electron_1.app.exit(0);
            },
        },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.webContents.setBackgroundThrottling(true);
            mainWindow.hide();
        }
        else {
            mainWindow?.webContents.setBackgroundThrottling(false);
            mainWindow?.show();
            mainWindow?.focus();
        }
    });
}
// ─── IPC Handlers ─────────────────────────────────────────────────────────────
function registerIPC() {
    // Store: get all (called once on React startup)
    electron_1.ipcMain.handle('store:get', () => {
        return store_1.store.store;
    });
    // Store: set partial (only on user-initiated changes)
    electron_1.ipcMain.handle('store:set', (_event, data) => {
        for (const [key, value] of Object.entries(data)) {
            store_1.store.set(key, value);
        }
        // Re-schedule notifications whenever accounts change
        if ('accounts' in data) {
            scheduleNotifications();
        }
    });
    // Window controls
    electron_1.ipcMain.on('window:minimize', () => mainWindow?.minimize());
    electron_1.ipcMain.on('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.on('window:close', () => {
        mainWindow?.webContents.setBackgroundThrottling(true);
        mainWindow?.hide();
    });
    // Notifications
    electron_1.ipcMain.on('notification:show', (_event, { title, body }) => {
        if (electron_1.Notification.isSupported()) {
            const notif = new electron_1.Notification({
                title,
                body,
                icon: path.join(__dirname, '../build/logo.png'),
                timeoutType: 'default',
            });
            notif.show();
            setTimeout(() => { try {
                notif.close();
            }
            catch { /* noop */ } }, 5000);
        }
    });
    // Shell: open data folder
    electron_1.ipcMain.on('shell:openDataFolder', () => {
        const dataPath = (0, store_1.getDataPath)();
        electron_1.shell.showItemInFolder(dataPath);
    });
    // Export data
    electron_1.ipcMain.handle('data:export', async (_event, jsonData) => {
        const result = await electron_1.dialog.showSaveDialog(mainWindow, {
            title: 'Export Refilla Data',
            defaultPath: `refilla-backup-${new Date().toISOString().slice(0, 10)}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }],
        });
        if (result.canceled || !result.filePath)
            return false;
        fs.writeFileSync(result.filePath, jsonData, 'utf-8');
        return true;
    });
    // Import data
    electron_1.ipcMain.handle('data:import', async () => {
        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
            title: 'Import Refilla Data',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            properties: ['openFile'],
        });
        if (result.canceled || !result.filePaths[0])
            return null;
        return fs.readFileSync(result.filePaths[0], 'utf-8');
    });
    // App version
    electron_1.ipcMain.handle('app:version', () => electron_1.app.getVersion());
}
// ─── App lifecycle ────────────────────────────────────────────────────────────
electron_1.app.whenReady().then(() => {
    createWindow();
    createTray();
    registerIPC();
    scheduleNotifications();
    electron_1.app.on('activate', () => {
        // Window is never destroyed; just show if somehow missing
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    // Keep running in tray on all platforms
});
// Prevent actual quit unless from tray menu
electron_1.app.on('before-quit', () => {
    if (mainWindow) {
        mainWindow.removeAllListeners('close');
    }
});
