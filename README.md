# 🗄️ Dashboard Backup for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![HA Version](https://img.shields.io/badge/Home%20Assistant-2024.4%2B-blue?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

Automatically back up and restore all your Lovelace dashboards — with a built-in management panel in the HA sidebar.

> **Nederlands:** Automatisch back-uppen en herstellen van al je Lovelace dashboards, inclusief een beheerpaneel in de zijbalk.

---

## ✨ Features

- 🔄 **Auto-backup on change** — instantly backs up a dashboard the moment you save it
- ⏱️ **Scheduled backups** — configurable interval (default: every 24 hours)
- 🖥️ **Sidebar panel** — browse, preview, restore and delete backups without leaving HA
- ↩️ **One-click restore** — roll back any dashboard to any saved version
- 👁️ **Preview** — inspect the raw JSON of any backup before restoring
- 🗂️ **All dashboards** — auto-discovers the default `lovelace` dashboard plus every named dashboard
- 🌗 **Dark & light theme** support
- 🤖 **HA Services** — trigger backups and restores from automations or scripts
- 🧹 **Auto-cleanup** — keeps only the newest N backups per dashboard (configurable)

---

## 📦 Installation via HACS (recommended)

1. In Home Assistant, go to **HACS → Integrations**
2. Click the **⋮ menu** (top right) → **Custom repositories**
3. Paste the URL of this repository and set the category to **Integration**, then click **Add**
4. Search for **Dashboard Backup** and click **Download**
5. **Restart Home Assistant**
6. Go to **Settings → Devices & Services → Add Integration**
7. Search for **Dashboard Backup** and complete the setup wizard

---

## 🔧 Manual installation

1. Download or clone this repository
2. Copy the `custom_components/dashboard_backup/` folder into your `/config/custom_components/` directory:
   ```
   /config/
   └── custom_components/
       └── dashboard_backup/   ← place the folder here
   ```
3. **Restart Home Assistant**
4. Go to **Settings → Devices & Services → Add Integration** and search for **Dashboard Backup**

---

## ⚙️ Configuration

During the setup wizard (and later via **Settings → Integrations → Dashboard Backup → Configure**) you can set:

| Option | Default | Range | Description |
|---|---|---|---|
| **Max backups per dashboard** | 50 | 5 – 200 | Oldest backups are automatically deleted when the limit is reached |
| **Backup interval (hours)** | 24 | 1 – 168 | How often a scheduled backup runs |
| **Backup on change** | ✅ On | On / Off | Instantly backs up a dashboard when you save a change |

---

## 🖥️ Using the sidebar panel

After installation a **Dashboard Backup** entry appears in the HA sidebar. The panel shows a list of all discovered dashboards and their backups.

| Action | How |
|---|---|
| Back up all dashboards now | Click **Back up all** at the top of the panel |
| Back up one dashboard | Click the **💾** icon next to a dashboard |
| Preview a backup | Click the **👁️** icon next to a backup entry |
| Restore a backup | Click the **↩️** icon next to a backup entry |
| Delete a backup | Click the **🗑️** icon next to a backup entry |

---

## 🤖 HA Services

Both services are available in **Developer Tools → Services**, automations and scripts.

### `dashboard_backup.backup_now`

Create an immediate backup of one or all dashboards.

```yaml
service: dashboard_backup.backup_now
data:
  dashboard_id: "all"          # use "all" or a specific dashboard ID
```

```yaml
# Back up only the 'energy' dashboard
service: dashboard_backup.backup_now
data:
  dashboard_id: "energy"
```

### `dashboard_backup.restore`

Restore a dashboard from a specific backup file.

```yaml
service: dashboard_backup.restore
data:
  dashboard_id: "lovelace"
  filename: "20240101_120000.json"
```

> **Tip:** You can find the exact filename in the sidebar panel or by looking in `/config/dashboard_backups/<dashboard_id>/`.

---

## 📁 Backup storage location

Backups are stored as plain JSON files inside your HA config directory:

```
/config/dashboard_backups/
├── lovelace/
│   ├── 20240101_120000.json
│   ├── 20240102_030000.json
│   └── 20240103_030000.json
├── energy/
│   └── 20240101_120005.json
└── my-custom-dashboard/
    └── 20240101_120010.json
```

Filenames are timestamps in the format `YYYYMMDD_HHMMSS.json`. The files are plain JSON, so you can also open, inspect or copy them manually.

---

## 🔍 Finding your dashboard IDs

Dashboard IDs match the URL paths in Home Assistant:

| URL in browser | Dashboard ID |
|---|---|
| `/lovelace/` | `lovelace` |
| `/energy` | `energy` |
| `/lovelace/my-dashboard` | `my-dashboard` |

All discovered IDs are also listed in the sidebar panel.

---

## 📋 Requirements

- Home Assistant **2024.4.0** or newer
- HACS (recommended) or manual installation

---

## 🐛 Troubleshooting

**The integration fails to load**
Make sure you are running HA 2024.4.0 or newer. Older versions used deprecated APIs that this integration no longer supports.

**A dashboard is not showing up**
The integration auto-discovers dashboards by scanning `.storage/lovelace.*` files. A dashboard only appears after it has been saved at least once in storage mode (not YAML mode).

**Restore doesn't seem to work**
After a restore, force-refresh your browser (`Ctrl+Shift+R` / `Cmd+Shift+R`). The HA frontend fires a `lovelace_updated` event automatically, but some browsers cache aggressively.

**Backups are not being created automatically**
Check that *Backup on change* is enabled in the integration options and that the backup interval is set as expected.

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first for bugs or larger feature requests so we can discuss the approach.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes and push the branch
4. Open a Pull Request

---

## ☕ Support the developer

If this integration saves your dashboards (literally), a small coffee goes a long way!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/smarthost9m)

---

## 📄 License

[MIT License](LICENSE) — free to use and modify.
