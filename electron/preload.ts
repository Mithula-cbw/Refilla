import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  getStore: () => ipcRenderer.invoke('store:get'),
  setStore: (data: Record<string, unknown>) => ipcRenderer.invoke('store:set', data),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // Notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.send('notification:show', { title, body }),

  // Shell
  openDataFolder: () => ipcRenderer.send('shell:openDataFolder'),

  // Export / Import
  exportData: (data: string) => ipcRenderer.invoke('data:export', data),
  importData: () => ipcRenderer.invoke('data:import'),

  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
});
