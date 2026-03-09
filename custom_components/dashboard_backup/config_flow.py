"""Config flow for Dashboard Backup."""
from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .const import (
    DOMAIN,
    CONF_MAX_BACKUPS,
    CONF_INTERVAL_HOURS,
    CONF_BACKUP_ON_CHANGE,
    DEFAULT_INTERVAL_HOURS,
    MAX_BACKUPS_PER_DASHBOARD,
)


class DashboardBackupConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Dashboard Backup."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        # Only allow one instance
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Dashboard Backup", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_MAX_BACKUPS, default=MAX_BACKUPS_PER_DASHBOARD): vol.All(
                        int, vol.Range(min=5, max=200)
                    ),
                    vol.Optional(CONF_INTERVAL_HOURS, default=DEFAULT_INTERVAL_HOURS): vol.All(
                        int, vol.Range(min=1, max=168)
                    ),
                    vol.Optional(CONF_BACKUP_ON_CHANGE, default=True): bool,
                }
            ),
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return DashboardBackupOptionsFlow(config_entry)


class DashboardBackupOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow."""

    def __init__(self, config_entry):
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_MAX_BACKUPS,
                        default=self.config_entry.options.get(
                            CONF_MAX_BACKUPS,
                            self.config_entry.data.get(CONF_MAX_BACKUPS, MAX_BACKUPS_PER_DASHBOARD),
                        ),
                    ): vol.All(int, vol.Range(min=5, max=200)),
                    vol.Optional(
                        CONF_INTERVAL_HOURS,
                        default=self.config_entry.options.get(
                            CONF_INTERVAL_HOURS,
                            self.config_entry.data.get(CONF_INTERVAL_HOURS, DEFAULT_INTERVAL_HOURS),
                        ),
                    ): vol.All(int, vol.Range(min=1, max=168)),
                    vol.Optional(
                        CONF_BACKUP_ON_CHANGE,
                        default=self.config_entry.options.get(
                            CONF_BACKUP_ON_CHANGE,
                            self.config_entry.data.get(CONF_BACKUP_ON_CHANGE, True),
                        ),
                    ): bool,
                }
            ),
        )
