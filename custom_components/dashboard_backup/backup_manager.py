"""Backup manager for Dashboard Backup integration."""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, Event
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store

from .const import (
    BACKUP_DIR,
    CONF_BACKUP_ON_CHANGE,
    CONF_INTERVAL_HOURS,
    CONF_MAX_BACKUPS,
    DEFAULT_INTERVAL_HOURS,
    MAX_BACKUPS_PER_DASHBOARD,
)

_LOGGER = logging.getLogger(__name__)


class BackupManager:
    """Manages dashboard backups and restores."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._unsub_interval = None
        self._unsub_event = None

    def _get_option(self, key: str, default: Any) -> Any:
        return self.entry.options.get(key, self.entry.data.get(key, default))

    @property
    def max_backups(self) -> int:
        return self._get_option(CONF_MAX_BACKUPS, MAX_BACKUPS_PER_DASHBOARD)

    @property
    def interval_hours(self) -> int:
        return self._get_option(CONF_INTERVAL_HOURS, DEFAULT_INTERVAL_HOURS)

    @property
    def backup_on_change(self) -> bool:
        return self._get_option(CONF_BACKUP_ON_CHANGE, True)

    async def async_setup(self) -> None:
        """Set up the backup manager: schedule & event listeners."""
        _LOGGER.info("Setting up Dashboard Backup manager")

        # Schedule periodic backups
        self._unsub_interval = async_track_time_interval(
            self.hass,
            self._scheduled_backup,
            timedelta(hours=self.interval_hours),
        )

        # Listen for dashboard changes
        if self.backup_on_change:
            self._unsub_event = self.hass.bus.async_listen(
                "lovelace_updated",
                self._on_dashboard_updated,
            )

        # Run an initial backup on first setup if none exists
        backup_base = Path(self.hass.config.path(BACKUP_DIR))
        if not backup_base.exists():
            _LOGGER.info("No existing backups found, creating initial backup")
            await self.backup_all()

    async def async_unload(self) -> None:
        """Unload the manager."""
        if self._unsub_interval:
            self._unsub_interval()
        if self._unsub_event:
            self._unsub_event()

    async def _scheduled_backup(self, now) -> None:
        _LOGGER.info("Running scheduled dashboard backup")
        await self.backup_all()

    async def _on_dashboard_updated(self, event: Event) -> None:
        url_path = event.data.get("url_path")
        dashboard_id = url_path if url_path else "lovelace"
        _LOGGER.info("Dashboard updated: %s — creating backup", dashboard_id)
        await self.backup_single(dashboard_id)

    # ------------------------------------------------------------------ #
    # Dashboard discovery
    # ------------------------------------------------------------------ #

    async def get_all_dashboard_ids(self) -> list[str]:
        """Discover all dashboard IDs by scanning HA .storage directory."""

        def _scan() -> list[str]:
            storage_dir = Path(self.hass.config.path(".storage"))
            ids = ["lovelace"]
            if storage_dir.exists():
                for f in storage_dir.iterdir():
                    if (
                        f.name.startswith("lovelace.")
                        and not f.name.startswith("lovelace.resources")
                        and not f.name.startswith("lovelace.strategy")
                    ):
                        did = f.name[len("lovelace."):]
                        if did and did not in ids:
                            ids.append(did)
            return ids

        return await self.hass.async_add_executor_job(_scan)

    # ------------------------------------------------------------------ #
    # Backup
    # ------------------------------------------------------------------ #

    async def backup_all(self) -> dict[str, str]:
        """Backup every discovered dashboard. Returns {dashboard_id: filename}."""
        results = {}
        for did in await self.get_all_dashboard_ids():
            result = await self.backup_single(did)
            if result:
                results[did] = result
        return results

    async def backup_single(self, dashboard_id: str) -> str | None:
        """Backup one dashboard. Returns the filename on success."""
        storage_key = (
            "lovelace" if dashboard_id == "lovelace" else f"lovelace.{dashboard_id}"
        )
        store = Store(self.hass, 1, storage_key)
        data = await store.async_load()

        if data is None:
            _LOGGER.warning("No storage data for dashboard '%s', skipping", dashboard_id)
            return None

        backup_dir = Path(self.hass.config.path(BACKUP_DIR, dashboard_id))

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}.json"
        backup_file = backup_dir / filename

        def _write() -> None:
            backup_dir.mkdir(parents=True, exist_ok=True)
            with open(backup_file, "w", encoding="utf-8") as fh:
                json.dump(data, fh, indent=2, ensure_ascii=False)

        await self.hass.async_add_executor_job(_write)
        _LOGGER.info("Backup created: %s", backup_file)

        await self._cleanup_old_backups(backup_dir)
        return filename

    async def _cleanup_old_backups(self, backup_dir: Path) -> None:
        def _cleanup() -> None:
            files = sorted(backup_dir.glob("*.json"))
            for old in files[: max(0, len(files) - self.max_backups)]:
                old.unlink()
                _LOGGER.debug("Deleted old backup: %s", old)

        await self.hass.async_add_executor_job(_cleanup)

    # ------------------------------------------------------------------ #
    # Restore
    # ------------------------------------------------------------------ #

    async def restore(self, dashboard_id: str, backup_filename: str) -> None:
        """Restore a dashboard from a backup file."""
        backup_path = Path(
            self.hass.config.path(BACKUP_DIR, dashboard_id, backup_filename)
        )

        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {backup_path}")

        def _read() -> dict:
            with open(backup_path, "r", encoding="utf-8") as fh:
                return json.load(fh)

        data = await self.hass.async_add_executor_job(_read)

        storage_key = (
            "lovelace" if dashboard_id == "lovelace" else f"lovelace.{dashboard_id}"
        )
        store = Store(self.hass, 1, storage_key)
        await store.async_save(data)

        # Notify HA frontend to reload the dashboard
        self.hass.bus.async_fire(
            "lovelace_updated",
            {"url_path": None if dashboard_id == "lovelace" else dashboard_id},
        )
        _LOGGER.info("Dashboard '%s' restored from %s", dashboard_id, backup_filename)

    # ------------------------------------------------------------------ #
    # List & preview
    # ------------------------------------------------------------------ #

    async def list_backups(self, dashboard_id: str | None = None) -> dict[str, list[dict]]:
        """Return {dashboard_id: [{filename, timestamp, size_kb}]}."""

        def _list() -> dict:
            backup_base = Path(self.hass.config.path(BACKUP_DIR))
            result: dict[str, list[dict]] = {}

            if not backup_base.exists():
                return result

            targets = (
                [dashboard_id]
                if dashboard_id
                else [d.name for d in backup_base.iterdir() if d.is_dir()]
            )
            for did in targets:
                d_path = backup_base / did
                if not d_path.is_dir():
                    continue
                files = sorted(d_path.glob("*.json"), reverse=True)
                result[did] = [
                    {
                        "filename": f.name,
                        "timestamp": f.stem,  # YYYYMMDD_HHMMSS
                        "size_kb": round(f.stat().st_size / 1024, 1),
                    }
                    for f in files
                ]
            return result

        return await self.hass.async_add_executor_job(_list)

    async def get_backup_content(self, dashboard_id: str, filename: str) -> dict:
        """Return the raw JSON content of a backup."""
        backup_path = Path(self.hass.config.path(BACKUP_DIR, dashboard_id, filename))
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {backup_path}")

        def _read() -> dict:
            with open(backup_path, "r", encoding="utf-8") as fh:
                return json.load(fh)

        return await self.hass.async_add_executor_job(_read)

    async def delete_backup(self, dashboard_id: str, filename: str) -> None:
        """Delete a specific backup file."""
        backup_path = Path(self.hass.config.path(BACKUP_DIR, dashboard_id, filename))
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {backup_path}")

        def _delete() -> None:
            backup_path.unlink()

        await self.hass.async_add_executor_job(_delete)
        _LOGGER.info("Deleted backup: %s / %s", dashboard_id, filename)
