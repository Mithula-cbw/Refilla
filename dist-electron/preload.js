"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Store operations
    getStore: () => electron_1.ipcRenderer.invoke('store:get'),
    setStore: (data) => electron_1.ipcRenderer.invoke('store:set', data),
    // Window controls
    minimize: () => electron_1.ipcRenderer.send('window:minimize'),
    maximize: () => electron_1.ipcRenderer.send('window:maximize'),
    close: () => electron_1.ipcRenderer.send('window:close'),
    // Notifications
    showNotification: (title, body) => electron_1.ipcRenderer.send('notification:show', { title, body }),
    // Shell
    openDataFolder: () => electron_1.ipcRenderer.send('shell:openDataFolder'),
    // Export / Import
    exportData: (data) => electron_1.ipcRenderer.invoke('data:export', data),
    importData: () => electron_1.ipcRenderer.invoke('data:import'),
    // App info
    getVersion: () => electron_1.ipcRenderer.invoke('app:version'),
});
