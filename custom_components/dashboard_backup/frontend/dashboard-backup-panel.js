/**
 * Dashboard Backup Panel
 * HACS custom panel — vanilla Web Component, no external dependencies
 */

const STYLES = `
  :host {
    display: block;
    font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
    background: var(--primary-background-color, #f5f5f5);
    min-height: 100vh;
    color: var(--primary-text-color, #212121);
  }

  * { box-sizing: border-box; }

  /* ── Layout ──────────────────────────────────────────────────── */
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px 80px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--primary-color, #03a9f4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .header-icon svg {
    width: 26px;
    height: 26px;
    fill: #fff;
  }

  h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: -0.3px;
  }

  .subtitle {
    margin: 2px 0 0;
    font-size: 0.85rem;
    opacity: 0.6;
  }

  /* ── Top toolbar ──────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
  }

  .spacer { flex: 1; }

  /* ── Buttons ──────────────────────────────────────────────────── */
  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: filter 0.15s, transform 0.1s, opacity 0.15s;
    outline: none;
    font-family: inherit;
  }

  button:hover  { filter: brightness(1.1); }
  button:active { transform: scale(0.97); }
  button:disabled { opacity: 0.45; cursor: not-allowed; transform: none; filter: none; }

  .btn-primary {
    background: var(--primary-color, #03a9f4);
    color: #fff;
  }

  .btn-danger {
    background: var(--error-color, #f44336);
    color: #fff;
  }

  .btn-warning {
    background: var(--warning-color, #ff9800);
    color: #fff;
  }

  .btn-ghost {
    background: var(--secondary-background-color, #e0e0e0);
    color: var(--primary-text-color, #212121);
  }

  .btn-icon {
    padding: 7px;
    border-radius: 6px;
  }

  button svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
    flex-shrink: 0;
  }

  /* ── Dashboard card ───────────────────────────────────────────── */
  .dashboard-card {
    background: var(--card-background-color, #fff);
    border-radius: 14px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
    overflow: hidden;
    transition: box-shadow 0.2s;
  }

  .dashboard-card:hover {
    box-shadow: 0 3px 12px rgba(0,0,0,.12);
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;
  }

  .dashboard-header:hover {
    background: var(--secondary-background-color, rgba(0,0,0,.03));
  }

  .dash-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: var(--primary-color, #03a9f4);
    opacity: 0.15;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

  .dash-icon svg {
    width: 18px;
    height: 18px;
    fill: var(--primary-color, #03a9f4);
    opacity: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .dash-name {
    font-weight: 600;
    font-size: 1rem;
    flex: 1;
  }

  .dash-count {
    font-size: 0.78rem;
    padding: 3px 9px;
    border-radius: 20px;
    background: var(--secondary-background-color, #f0f0f0);
    opacity: 0.8;
  }

  .chevron {
    width: 18px;
    height: 18px;
    fill: var(--secondary-text-color, #757575);
    transition: transform 0.2s;
  }

  .chevron.open { transform: rotate(90deg); }

  /* ── Backup list ──────────────────────────────────────────────── */
  .backup-list {
    border-top: 1px solid var(--divider-color, rgba(0,0,0,.08));
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }

  .backup-list.open { max-height: 9999px; }

  .backup-list-header {
    display: flex;
    align-items: center;
    padding: 10px 20px 8px;
    gap: 8px;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.06));
  }

  .backup-list-header .btn-primary {
    margin-left: auto;
    padding: 5px 12px;
    font-size: 0.8rem;
  }

  .backup-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 20px;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.05));
    transition: background 0.15s;
  }

  .backup-row:last-child { border-bottom: none; }
  .backup-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.02)); }

  .backup-time {
    flex: 1;
    font-size: 0.88rem;
  }

  .backup-time .date {
    font-weight: 500;
  }

  .backup-time .time {
    font-size: 0.78rem;
    opacity: 0.55;
    margin-top: 1px;
  }

  .backup-size {
    font-size: 0.78rem;
    opacity: 0.5;
    min-width: 52px;
    text-align: right;
  }

  .backup-actions {
    display: flex;
    gap: 6px;
  }

  .latest-badge {
    font-size: 0.68rem;
    padding: 2px 7px;
    border-radius: 10px;
    background: var(--success-color, #4caf50);
    color: #fff;
    font-weight: 600;
  }

  /* ── Empty state ──────────────────────────────────────────────── */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    opacity: 0.5;
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
    fill: var(--primary-text-color);
    opacity: 0.3;
    margin-bottom: 12px;
  }

  .empty-state p { margin: 6px 0 0; font-size: 0.9rem; }

  /* ── Loading skeleton ─────────────────────────────────────────── */
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--secondary-background-color, #e0e0e0) 25%,
      var(--divider-color, #f0f0f0) 50%,
      var(--secondary-background-color, #e0e0e0) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .skeleton-card {
    height: 70px;
    margin-bottom: 16px;
    border-radius: 14px;
  }

  /* ── Toast notification ───────────────────────────────────────── */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--primary-text-color, #212121);
    color: var(--primary-background-color, #fff);
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.9rem;
    box-shadow: 0 4px 20px rgba(0,0,0,.25);
    z-index: 9999;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.25s;
    opacity: 0;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  .toast.success { background: var(--success-color, #4caf50); }
  .toast.error   { background: var(--error-color, #f44336); }

  /* ── Modal dialog ─────────────────────────────────────────────── */
  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal-overlay.open { display: flex; }

  .modal {
    background: var(--card-background-color, #fff);
    border-radius: 16px;
    padding: 28px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,.3);
    animation: modal-in 0.2s cubic-bezier(.34,1.56,.64,1);
  }

  @keyframes modal-in {
    from { transform: scale(0.92); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }

  .modal h3 {
    margin: 0 0 8px;
    font-size: 1.15rem;
    font-weight: 600;
  }

  .modal p {
    margin: 0 0 20px;
    font-size: 0.9rem;
    opacity: 0.7;
    line-height: 1.5;
  }

  .modal .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Preview modal ────────────────────────────────────────────── */
  .preview-modal {
    max-width: 700px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .preview-modal h3 { margin-bottom: 4px; }
  .preview-meta { font-size: 0.78rem; opacity: 0.5; margin: 0 0 16px; }

  .preview-content {
    flex: 1;
    overflow: auto;
    background: var(--code-editor-background-color, #1e1e2e);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .preview-content pre {
    margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.78rem;
    line-height: 1.6;
    color: #cdd6f4;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* ── Coffee banner ───────────────────────────────────────────── */
  .coffee-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    margin-top: 32px;
    border-radius: 14px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(0,0,0,.2);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .coffee-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.04), transparent);
  }

  .coffee-banner:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,.28);
  }

  .coffee-banner:active { transform: translateY(0); }

  .coffee-emoji {
    font-size: 2rem;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,.3));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0);    }
    50%       { transform: translateY(-4px); }
  }

  .coffee-text { flex: 1; }

  .coffee-text strong {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .coffee-text span {
    font-size: 0.78rem;
    opacity: 0.65;
  }

  .coffee-btn {
    background: #FFDD00;
    color: #1a1a1a;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    white-space: nowrap;
    flex-shrink: 0;
    transition: filter 0.15s;
  }

  .coffee-banner:hover .coffee-btn { filter: brightness(1.08); }

  /* ── Spinner ──────────────────────────────────────────────────── */
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── Icon helpers ──────────────────────────────────────────────────────────────
const icon = {
  backup: `<svg viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>`,
  restore: `<svg viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  eye: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  dashboard: `<svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
};

// ── Utility ───────────────────────────────────────────────────────────────────
function parseTimestamp(ts) {
  // Format: YYYYMMDD_HHMMSS
  const [date, time] = ts.split("_");
  if (!date || !time) return { date: ts, time: "" };
  const y = date.slice(0, 4), mo = date.slice(4, 6), d = date.slice(6, 8);
  const h = time.slice(0, 2), mi = time.slice(2, 4), s = time.slice(4, 6);
  const dt = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
  return {
    date: dt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
    time: dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
class DashboardBackupPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._loading = true;
    this._backups = {};       // { dashboardId: [{filename, timestamp, size_kb}] }
    this._open = {};          // { dashboardId: bool }
    this._busy = {};          // { dashboardId: bool }
    this._confirmRestore = null;   // { dashboardId, filename }
    this._previewData = null;      // { dashboardId, filename, content }
    this._initialized = false;
    this._toastTimer = null;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      this._loadBackups();
    }
  }

  // ── API calls ────────────────────────────────────────────────────
  async _api(method, url, body) {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._hass.auth.data.access_token}`,
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
  }

  async _loadBackups() {
    this._loading = true;
    this._update();
    try {
      const data = await this._api("GET", "/api/dashboard_backup/list");
      this._backups = data;
      // Auto-open first dashboard
      const ids = Object.keys(data);
      if (ids.length > 0 && Object.keys(this._open).length === 0) {
        this._open[ids[0]] = true;
      }
    } catch (e) {
      this._toast("Fout bij laden van back-ups", "error");
    } finally {
      this._loading = false;
      this._update();
    }
  }

  async _backupNow(dashboardId) {
    this._busy[dashboardId] = true;
    this._update();
    try {
      const res = await this._api("POST", "/api/dashboard_backup/backup", {
        dashboard_id: dashboardId,
      });
      if (res.success) {
        this._toast("Back-up aangemaakt ✓", "success");
        await this._loadBackups();
      } else {
        this._toast("Back-up mislukt: " + (res.error || "onbekend"), "error");
      }
    } catch (e) {
      this._toast("Verbindingsfout", "error");
    } finally {
      delete this._busy[dashboardId];
      this._update();
    }
  }

  async _backupAll() {
    this._busy["__all__"] = true;
    this._update();
    try {
      const res = await this._api("POST", "/api/dashboard_backup/backup", {
        dashboard_id: "all",
      });
      if (res.success) {
        this._toast("Alle dashboards gebackupt ✓", "success");
        await this._loadBackups();
      } else {
        this._toast("Back-up mislukt: " + (res.error || "onbekend"), "error");
      }
    } catch (e) {
      this._toast("Verbindingsfout", "error");
    } finally {
      delete this._busy["__all__"];
      this._update();
    }
  }

  async _doRestore(dashboardId, filename) {
    this._confirmRestore = null;
    this._busy[dashboardId + filename] = true;
    this._update();
    try {
      const res = await this._api("POST", "/api/dashboard_backup/restore", {
        dashboard_id: dashboardId,
        filename,
      });
      if (res.success) {
        this._toast("Dashboard hersteld ✓", "success");
      } else {
        this._toast("Herstel mislukt: " + (res.error || "onbekend"), "error");
      }
    } catch (e) {
      this._toast("Verbindingsfout", "error");
    } finally {
      delete this._busy[dashboardId + filename];
      this._update();
    }
  }

  async _deleteBackup(dashboardId, filename) {
    try {
      const res = await this._api("POST", "/api/dashboard_backup/delete", {
        dashboard_id: dashboardId,
        filename,
      });
      if (res.success) {
        this._toast("Back-up verwijderd", "success");
        await this._loadBackups();
      } else {
        this._toast("Verwijderen mislukt", "error");
      }
    } catch (e) {
      this._toast("Verbindingsfout", "error");
    }
  }

  async _previewBackup(dashboardId, filename) {
    this._previewData = { dashboardId, filename, content: null, loading: true };
    this._update();
    try {
      const content = await this._api(
        "GET",
        `/api/dashboard_backup/preview?dashboard_id=${encodeURIComponent(dashboardId)}&filename=${encodeURIComponent(filename)}`
      );
      this._previewData = { dashboardId, filename, content };
    } catch (e) {
      this._previewData = { dashboardId, filename, content: null, error: true };
    }
    this._update();
  }

  // ── Toast ────────────────────────────────────────────────────────
  _toast(msg, type = "") {
    const toast = this.shadowRoot.querySelector(".toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // ── Render helpers ───────────────────────────────────────────────
  _toggleDashboard(id) {
    this._open[id] = !this._open[id];
    this._update();
  }

  _renderSkeletons() {
    return `
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    `;
  }

  _renderBackupRow(dashboardId, backup, index, total) {
    const { date, time } = parseTimestamp(backup.timestamp);
    const isLatest = index === 0;
    const busyKey = dashboardId + backup.filename;
    const isBusy = !!this._busy[busyKey];

    return `
      <div class="backup-row">
        <div class="backup-time">
          <div class="date">${date}
            ${isLatest ? '<span class="latest-badge">Laatste</span>' : ""}
          </div>
          <div class="time">${time}</div>
        </div>
        <div class="backup-size">${backup.size_kb} KB</div>
        <div class="backup-actions">
          <button class="btn-ghost btn-icon" title="Bekijk inhoud"
            data-action="preview" data-did="${dashboardId}" data-file="${backup.filename}">
            ${icon.eye}
          </button>
          <button class="btn-warning btn-icon" title="Herstel dit dashboard"
            ${isBusy ? "disabled" : ""}
            data-action="restore" data-did="${dashboardId}" data-file="${backup.filename}">
            ${isBusy ? '<span class="spinner"></span>' : icon.restore}
          </button>
          <button class="btn-danger btn-icon" title="Verwijder back-up"
            data-action="delete" data-did="${dashboardId}" data-file="${backup.filename}">
            ${icon.trash}
          </button>
        </div>
      </div>
    `;
  }

  _renderDashboardCard(dashboardId, backups) {
    const isOpen = !!this._open[dashboardId];
    const isBusy = !!this._busy[dashboardId];

    return `
      <div class="dashboard-card">
        <div class="dashboard-header" data-action="toggle" data-did="${dashboardId}">
          <div class="dash-icon">${icon.dashboard}</div>
          <div class="dash-name">${dashboardId}</div>
          <div class="dash-count">${backups.length} back-up${backups.length !== 1 ? "s" : ""}</div>
          <svg class="chevron ${isOpen ? "open" : ""}" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </div>
        <div class="backup-list ${isOpen ? "open" : ""}">
          <div class="backup-list-header">
            <span style="font-size:.8rem;opacity:.6;">${backups.length} back-up${backups.length !== 1 ? "s" : ""} opgeslagen</span>
            <button class="btn-primary" ${isBusy ? "disabled" : ""}
              data-action="backup" data-did="${dashboardId}">
              ${isBusy ? '<span class="spinner"></span>' : icon.backup}
              ${isBusy ? "Bezig…" : "Nu back-uppen"}
            </button>
          </div>
          ${
            backups.length === 0
              ? `<div class="empty-state"><p>Nog geen back-ups voor dit dashboard.</p></div>`
              : backups.map((b, i) => this._renderBackupRow(dashboardId, b, i, backups.length)).join("")
          }
        </div>
      </div>
    `;
  }

  _renderConfirmModal() {
    if (!this._confirmRestore) return "";
    const { dashboardId, filename } = this._confirmRestore;
    const { date, time } = parseTimestamp(filename.replace(".json", ""));
    return `
      <div class="modal-overlay open" id="confirm-modal">
        <div class="modal">
          <h3>Dashboard herstellen?</h3>
          <p>
            Je staat op het punt <strong>${dashboardId}</strong> te herstellen naar de back-up van
            <strong>${date} om ${time}</strong>.<br><br>
            De huidige dashboardinhoud wordt overschreven. Wil je doorgaan?
          </p>
          <div class="modal-actions">
            <button class="btn-ghost" data-action="cancel-restore">Annuleren</button>
            <button class="btn-warning" data-action="confirm-restore"
              data-did="${dashboardId}" data-file="${filename}">
              ${icon.restore} Ja, herstel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPreviewModal() {
    if (!this._previewData) return "";
    const { dashboardId, filename, content, loading, error } = this._previewData;
    const { date, time } = parseTimestamp(filename.replace(".json", ""));
    const prettyContent = content
      ? JSON.stringify(content, null, 2)
      : loading
      ? "Laden…"
      : "Kon inhoud niet laden.";

    return `
      <div class="modal-overlay open" id="preview-modal">
        <div class="modal preview-modal">
          <h3>${dashboardId}</h3>
          <p class="preview-meta">Back-up van ${date} om ${time}</p>
          <div class="preview-content">
            <pre>${prettyContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" data-action="close-preview">Sluiten</button>
            <button class="btn-warning" data-action="restore-from-preview"
              data-did="${dashboardId}" data-file="${filename}">
              ${icon.restore} Herstel deze versie
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _render() {
    const allBusy = !!this._busy["__all__"];
    const dashboardIds = Object.keys(this._backups);
    const totalBackups = dashboardIds.reduce((sum, id) => sum + (this._backups[id] || []).length, 0);

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="page">
        <div class="header">
          <div class="header-icon">${icon.backup}</div>
          <div>
            <h1>Dashboard Backup</h1>
            <p class="subtitle">
              ${
                this._loading
                  ? "Laden…"
                  : `${dashboardIds.length} dashboard${dashboardIds.length !== 1 ? "s" : ""}
                     · ${totalBackups} back-up${totalBackups !== 1 ? "s" : ""}`
              }
            </p>
          </div>
        </div>

        <div class="toolbar">
          <button class="btn-primary" ${allBusy ? "disabled" : ""} data-action="backup-all">
            ${allBusy ? '<span class="spinner"></span>' : icon.backup}
            ${allBusy ? "Bezig…" : "Alle dashboards back-uppen"}
          </button>
          <div class="spacer"></div>
          <button class="btn-ghost" data-action="refresh">
            ${icon.refresh} Vernieuwen
          </button>
        </div>

        ${
          this._loading
            ? this._renderSkeletons()
            : dashboardIds.length === 0
            ? `<div class="empty-state">
                 ${icon.dashboard}
                 <p>Geen back-ups gevonden.</p>
                 <p>Klik op "Alle dashboards back-uppen" om te beginnen.</p>
               </div>`
            : dashboardIds.map(id => this._renderDashboardCard(id, this._backups[id] || [])).join("")
        }

        <a class="coffee-banner" href="https://buymeacoffee.com/smarthost9m" target="_blank" rel="noopener">
          <div class="coffee-emoji">☕</div>
          <div class="coffee-text">
            <strong>Vind je Dashboard Backup handig?</strong>
            <span>Help de ontwikkelaar met een koffietje — wordt enorm gewaardeerd!</span>
          </div>
          <div class="coffee-btn">Buy me a coffee ☕</div>
        </a>
      </div>

      ${this._renderConfirmModal()}
      ${this._renderPreviewModal()}
      <div class="toast"></div>
    `;

    this._attachListeners();
  }

  _update() {
    // Efficient re-render
    this._render();
  }

  _attachListeners() {
    this.shadowRoot.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const did = btn.dataset.did;
      const file = btn.dataset.file;

      switch (action) {
        case "toggle":
          this._toggleDashboard(did);
          break;
        case "backup-all":
          await this._backupAll();
          break;
        case "backup":
          await this._backupNow(did);
          break;
        case "restore":
          this._confirmRestore = { dashboardId: did, filename: file };
          this._update();
          break;
        case "delete":
          await this._deleteBackup(did, file);
          break;
        case "preview":
          await this._previewBackup(did, file);
          break;
        case "confirm-restore":
          await this._doRestore(btn.dataset.did, btn.dataset.file);
          break;
        case "cancel-restore":
          this._confirmRestore = null;
          this._update();
          break;
        case "close-preview":
          this._previewData = null;
          this._update();
          break;
        case "restore-from-preview":
          this._previewData = null;
          this._confirmRestore = { dashboardId: did, filename: file };
          this._update();
          break;
        case "refresh":
          await this._loadBackups();
          break;
      }
    });
  }
}

customElements.define("dashboard-backup-panel", DashboardBackupPanel);
