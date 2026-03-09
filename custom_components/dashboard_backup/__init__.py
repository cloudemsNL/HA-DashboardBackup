"""Dashboard Backup — HACS integration for backing up Lovelace dashboards."""
from __future__ import annotations

import logging
import os

from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv
import voluptuous as vol

from .api import (
    DashboardBackupCreateView,
    DashboardBackupDeleteView,
    DashboardBackupListView,
    DashboardBackupPreviewView,
    DashboardBackupRestoreView,
)
from .backup_manager import BackupManager
from .const import (
    DOMAIN,
    FRONTEND_SCRIPT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL,
    STATIC_PATH,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Dashboard Backup from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    manager = BackupManager(hass, entry)
    hass.data[DOMAIN]["manager"] = manager

    # ------------------------------------------------------------------ #
    # Serve the frontend JS as a static path
    # ------------------------------------------------------------------ #
    frontend_dir = hass.config.path("custom_components", DOMAIN, "frontend")
    from homeassistant.components.http import StaticPathConfig
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_PATH, frontend_dir, cache_headers=False)]
    )

    # ------------------------------------------------------------------ #
    # Register the sidebar panel
    # ------------------------------------------------------------------ #
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "dashboard-backup-panel",
                "module_url": f"{STATIC_PATH}/{FRONTEND_SCRIPT}",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=True,
    )

    # ------------------------------------------------------------------ #
    # Register REST API views
    # ------------------------------------------------------------------ #
    hass.http.register_view(DashboardBackupListView)
    hass.http.register_view(DashboardBackupCreateView)
    hass.http.register_view(DashboardBackupRestoreView)
    hass.http.register_view(DashboardBackupDeleteView)
    hass.http.register_view(DashboardBackupPreviewView)

    # ------------------------------------------------------------------ #
    # Register HA services
    # ------------------------------------------------------------------ #
    async def handle_backup_now(call: ServiceCall) -> None:
        dashboard_id = call.data.get("dashboard_id", "all")
        if dashboard_id == "all":
            await manager.backup_all()
        else:
            await manager.backup_single(dashboard_id)

    async def handle_restore(call: ServiceCall) -> None:
        await manager.restore(
            call.data["dashboard_id"],
            call.data["filename"],
        )

    hass.services.async_register(
        DOMAIN,
        "backup_now",
        handle_backup_now,
        schema=vol.Schema(
            {vol.Optional("dashboard_id", default="all"): cv.string}
        ),
    )
    hass.services.async_register(
        DOMAIN,
        "restore",
        handle_restore,
        schema=vol.Schema(
            {
                vol.Required("dashboard_id"): cv.string,
                vol.Required("filename"): cv.string,
            }
        ),
    )

    # ------------------------------------------------------------------ #
    # Start the manager (schedules, event listeners, initial backup)
    # ------------------------------------------------------------------ #
    await manager.async_setup()

    # Re-setup when options change
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    manager: BackupManager = hass.data[DOMAIN].get("manager")
    if manager:
        await manager.async_unload()

    frontend.async_remove_panel(PANEL_URL)

    hass.services.async_remove(DOMAIN, "backup_now")
    hass.services.async_remove(DOMAIN, "restore")

    hass.data[DOMAIN].pop("manager", None)
    return True
