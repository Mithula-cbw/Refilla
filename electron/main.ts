import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  Notification,
  shell,
  dialog,
  nativeImage,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { store, getDataPath } from './store';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
// Notification timers: accountId -> NodeJS.Timeout
const notificationTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

// ─── Window creation ──────────────────────────────────────────────────────────
function createWindow() {
  const savedBounds = store.get('windowBounds') as any;

  mainWindow = new BrowserWindow({
    width: savedBounds?.width ?? 1100,
    height: savedBounds?.height ?? 700,
    x: savedBounds?.x ?? undefined,
    y: savedBounds?.y ?? undefined,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d1117',
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
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Save window bounds on resize/move
  const saveBounds = () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  };
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  // Minimize to tray on close
  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── System Tray ──────────────────────────────────────────────────────────────
function createTray() {
  // Use a simple generated icon (16x16 white pixel fallback)
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  let icon: Electron.NativeImage;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    // 16x16 transparent PNG fallback
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('AITrack');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open AITrack',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.exit(0);
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

// ─── Schedule notifications for pending cooldowns ─────────────────────────────
function scheduleNotifications() {
  const accounts = store.get('accounts') as any[];
  const services = store.get('services') as any[];
  const notificationsEnabled = store.get('notificationsEnabled') as boolean;

  if (!notificationsEnabled) return;

  for (const account of accounts) {
    if (account.status === 'cooldown' && account.cooldownUntil) {
      const resetTime = new Date(account.cooldownUntil).getTime();
      const now = Date.now();
      const delay = resetTime - now;

      if (delay > 0) {
        const service = services.find((s: any) => s.id === account.serviceId);
        const serviceName = service?.name ?? 'Unknown Service';

        // Cancel any existing timer
        if (notificationTimers.has(account.id)) {
          clearTimeout(notificationTimers.get(account.id)!);
        }

        const timer = setTimeout(() => {
          if (!Notification.isSupported()) return;
          const notif = new Notification({
            title: 'AITrack: Account Ready',
            body: `${account.label} on ${serviceName} is now available`,
          });
          notif.show();
          notificationTimers.delete(account.id);
        }, delay);

        notificationTimers.set(account.id, timer);
      }
    }
  }
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
function registerIPC() {
  // Store: get all
  ipcMain.handle('store:get', () => {
    return store.store;
  });

  // Store: set partial
  ipcMain.handle('store:set', (_event, data: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(data)) {
      store.set(key as any, value);
    }
    // Re-schedule notifications whenever accounts change
    if ('accounts' in data) {
      scheduleNotifications();
    }
  });

  // Window controls
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.hide());

  // Notifications
  ipcMain.on('notification:show', (_event, { title, body }: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  // Shell: open data folder
  ipcMain.on('shell:openDataFolder', () => {
    const dataPath = getDataPath();
    shell.showItemInFolder(dataPath);
  });

  // Export data
  ipcMain.handle('data:export', async (_event, jsonData: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Export AITrack Data',
      defaultPath: `aitrack-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (result.canceled || !result.filePath) return false;
    fs.writeFileSync(result.filePath, jsonData, 'utf-8');
    return true;
  });

  // Import data
  ipcMain.handle('data:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Import AITrack Data',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return fs.readFileSync(result.filePaths[0], 'utf-8');
  });

  // App version
  ipcMain.handle('app:version', () => app.getVersion());
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerIPC();
  scheduleNotifications();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep running in tray on all platforms
});

// Prevent actual quit unless from tray menu
app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
  }
});
