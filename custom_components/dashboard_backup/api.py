"""REST API views for Dashboard Backup."""
from __future__ import annotations

import json
import logging

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def _get_manager(hass: HomeAssistant):
    return hass.data[DOMAIN]["manager"]


class DashboardBackupListView(HomeAssistantView):
    """GET /api/dashboard_backup/list — list all backups."""

    url = "/api/dashboard_backup/list"
    name = "api:dashboard_backup:list"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        manager = _get_manager(hass)
        dashboard_id = request.query.get("dashboard_id")
        try:
            backups = await manager.list_backups(dashboard_id or None)
            return self.json(backups)
        except Exception as err:
            _LOGGER.error("list_backups error: %s", err)
            return self.json({"error": str(err)}, status_code=500)


class DashboardBackupCreateView(HomeAssistantView):
    """POST /api/dashboard_backup/backup — trigger a backup."""

    url = "/api/dashboard_backup/backup"
    name = "api:dashboard_backup:create"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        manager = _get_manager(hass)
        try:
            body = await request.json()
        except Exception:
            body = {}

        dashboard_id = body.get("dashboard_id", "all")
        try:
            if dashboard_id == "all":
                results = await manager.backup_all()
            else:
                filename = await manager.backup_single(dashboard_id)
                results = {dashboard_id: filename} if filename else {}
            return self.json({"success": True, "results": results})
        except Exception as err:
            _LOGGER.error("backup error: %s", err)
            return self.json({"error": str(err)}, status_code=500)


class DashboardBackupRestoreView(HomeAssistantView):
    """POST /api/dashboard_backup/restore — restore a dashboard."""

    url = "/api/dashboard_backup/restore"
    name = "api:dashboard_backup:restore"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        manager = _get_manager(hass)
        try:
            body = await request.json()
        except Exception:
            return self.json({"error": "Invalid JSON"}, status_code=400)

        dashboard_id = body.get("dashboard_id")
        filename = body.get("filename")

        if not dashboard_id or not filename:
            return self.json({"error": "dashboard_id and filename required"}, status_code=400)

        try:
            await manager.restore(dashboard_id, filename)
            return self.json({"success": True})
        except FileNotFoundError as err:
            return self.json({"error": str(err)}, status_code=404)
        except Exception as err:
            _LOGGER.error("restore error: %s", err)
            return self.json({"error": str(err)}, status_code=500)


class DashboardBackupDeleteView(HomeAssistantView):
    """DELETE /api/dashboard_backup/backup — delete a backup file."""

    url = "/api/dashboard_backup/delete"
    name = "api:dashboard_backup:delete"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        manager = _get_manager(hass)
        try:
            body = await request.json()
        except Exception:
            return self.json({"error": "Invalid JSON"}, status_code=400)

        dashboard_id = body.get("dashboard_id")
        filename = body.get("filename")

        if not dashboard_id or not filename:
            return self.json({"error": "dashboard_id and filename required"}, status_code=400)

        try:
            await manager.delete_backup(dashboard_id, filename)
            return self.json({"success": True})
        except FileNotFoundError as err:
            return self.json({"error": str(err)}, status_code=404)
        except Exception as err:
            _LOGGER.error("delete error: %s", err)
            return self.json({"error": str(err)}, status_code=500)


class DashboardBackupPreviewView(HomeAssistantView):
    """GET /api/dashboard_backup/preview?dashboard_id=x&filename=y — preview backup content."""

    url = "/api/dashboard_backup/preview"
    name = "api:dashboard_backup:preview"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        manager = _get_manager(hass)
        dashboard_id = request.query.get("dashboard_id")
        filename = request.query.get("filename")

        if not dashboard_id or not filename:
            return self.json({"error": "dashboard_id and filename required"}, status_code=400)

        try:
            content = await manager.get_backup_content(dashboard_id, filename)
            return self.json(content)
        except FileNotFoundError as err:
            return self.json({"error": str(err)}, status_code=404)
        except Exception as err:
            _LOGGER.error("preview error: %s", err)
            return self.json({"error": str(err)}, status_code=500)
