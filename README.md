<div align="center">

<br/>

```
██████╗ ███████╗███████╗██╗██╗     ██╗      █████╗ 
██╔══██╗██╔════╝██╔════╝██║██║     ██║     ██╔══██╗
██████╔╝█████╗  █████╗  ██║██║     ██║     ███████║
██╔══██╗██╔══╝  ██╔══╝  ██║██║     ██║     ██╔══██║
██║  ██║███████╗██║     ██║███████╗███████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
```

**Track AI quota resets. Organize your accounts. Stay in control.**

<br/>

![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Offline](https://img.shields.io/badge/offline-100%25%20local-brightgreen?style=flat-square)
![No Sync](https://img.shields.io/badge/sync-never-red?style=flat-square)

<br/>

> *Built for developers running multiple free-tier AI accounts across tools like Cursor, Windsurf, and GitHub Copilot. Refilla tells you which account is ready, which is cooling down, and reminds you the moment a quota resets — all offline, all yours.*

<br/>

</div>

---

## ✨ What is Refilla?

If you rotate between multiple free-tier AI accounts to keep working without interruptions, you know the pain: you forget which account is on cooldown, you log into the wrong one, you miss the reset window. Refilla fixes that.

It's a **lightweight desktop app** that lives in your system tray and does two things really well:

- 🟢 **Quota Tracker** — see every account's status at a glance. Mark a cooldown with one click, set the reset time, and get a desktop notification the moment it's ready.
- 🔵 **AI Vault** — a personal reference database. Save conversation titles, notes, and context per account so you always know *which account has which conversation* without logging into everything.

**100% offline. Nothing leaves your machine. Ever.**

---

## 🖥️ Screenshots

<div align="center">

| Quota Tracker | AI Vault |
|:---:|:---:|
| `[screenshot]` | `[screenshot]` |
| Track cooldowns in real time | Save context per account |

</div>

---

## 🚀 Features

### Quota Tracker
- 🟢 **Live countdown** — see exactly how long until each account resets (updates every 30s)
- 🔔 **Desktop notifications** — get notified the moment a quota resets, even when minimized
- ⚡ **Quick presets** — mark cooldown with +24h, +48h, or +1 week in one click
- 📂 **Service sections** — group accounts by tool (Cursor, Windsurf, Copilot, etc.)
- 🔍 **Filter & sort** — view only available, only cooling down, or sort by reset time
- 🕐 **Smart auto-recover** — accounts that reset while the app was closed are auto-updated on launch

### AI Vault
- 📝 **Account-level notes** — save key-value entries per account per service
- 🔎 **Master search** — search across all services, all accounts, all notes at once
- 🔍 **Per-section search** — scope a search to one service only with text highlighting
- 🏷️ **Tags** — tag entries for faster filtering
- 📤 **Export / Import** — back up your vault as JSON anytime

### App-wide
- 🌙 **Dark & light theme** — GitHub-dark-inspired default, clean light mode available
- 🖥️ **System tray** — runs quietly in the background, shows a count of accounts resetting soon
- ⌨️ **Keyboard shortcuts** — `Ctrl+1/2` to switch tabs, `Ctrl+F` to search, `Ctrl+N` to add
- 💾 **Fully local** — all data stored in a JSON file on your own machine
- 🔒 **No telemetry, no analytics, no internet** — ever

---

## 📦 Installation

### Download (recommended)

Go to the [Releases](../../releases) page and download:

| OS | File |
|----|------|
| Windows | `Refilla-Setup-x.x.x.exe` |
| Linux | `Refilla-x.x.x.AppImage` |

**Windows:** Run the `.exe` installer. Refilla installs like any normal app with a desktop shortcut.

**Linux:**
```bash
chmod +x Refilla-x.x.x.AppImage
./Refilla-x.x.x.AppImage
```

---

## 🛠️ Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/refilla.git
cd refilla

# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Build installers

```bash
# Windows (.exe NSIS installer)
npm run build:win

# Linux (.AppImage)
npm run build:linux

# Both at once
npm run build
```

Output files will be in the `dist/` folder.

---

## 📁 Data & Storage

Refilla stores all data in a single JSON file using `electron-store`. No database, no server.

**Data file location:**

| OS | Path |
|----|------|
| Windows | `%APPDATA%\refilla\config.json` |
| Linux | `~/.config/refilla/config.json` |

### Backup & Restore

Open the Settings panel (gear icon in the titlebar) and use:

- **Export all data** — saves a full JSON backup to any folder you choose
- **Import data** — restore from a backup (merge or replace options available)
- **Open data folder** — opens the folder in your file explorer

> ⚠️ **Important:** Refilla is **not** a password manager. The AI Vault is unencrypted plain text. Do not store real API keys, passwords, or sensitive secrets in it.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + 1` | Switch to Quota Tracker |
| `Ctrl + 2` | Switch to AI Vault |
| `Ctrl + F` | Focus search / filter bar |
| `Ctrl + N` | Add new account (focused section) |
| `Escape` | Close modal or panel |

---

## 🗺️ Roadmap

- [ ] Drag-and-drop reordering of accounts within a service
- [ ] Custom notification sounds
- [ ] Account usage history / log
- [ ] Color-coded service icons
- [ ] CSV export for Vault entries
- [ ] Auto-detect reset time from clipboard (paste a "quota exceeded" message)

---

## 🤝 Contributing

Refilla is a personal tool built for personal use, but PRs and issues are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT — do whatever you want with it.

---

<div align="center">

Built with 💚 for developers who hustle on free tiers.

**[⬆ back to top](#)**

</div>