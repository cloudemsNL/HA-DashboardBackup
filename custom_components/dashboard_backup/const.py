"""Constants for Dashboard Backup integration."""

DOMAIN = "dashboard_backup"
BACKUP_DIR = "dashboard_backups"
MAX_BACKUPS_PER_DASHBOARD = 50
DEFAULT_INTERVAL_HOURS = 24
FRONTEND_SCRIPT = "dashboard-backup-panel.js"
PANEL_URL = "dashboard-backup"
PANEL_TITLE = "Dashboard Backup"
PANEL_ICON = "mdi:backup-restore"
STATIC_PATH = "/dashboard_backup_frontend"

CONF_MAX_BACKUPS = "max_backups"
CONF_INTERVAL_HOURS = "interval_hours"
CONF_BACKUP_ON_CHANGE = "backup_on_change"
