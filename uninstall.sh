#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  Water Reminder – GNOME Shell Extension Uninstaller
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

EXTENSION_UUID="water-reminder@gilsonf"
INSTALL_DIR="${HOME}/.local/share/gnome-shell/extensions/${EXTENSION_UUID}"
SCHEMA_FILE="${HOME}/.local/share/glib-2.0/schemas/org.gnome.shell.extensions.water-reminder.gschema.xml"
SCHEMA_DIR="${HOME}/.local/share/glib-2.0/schemas"

echo "Uninstalling Water Reminder extension..."

# 1 ── Disable the extension ───────────────────────────────────────
if command -v gnome-extensions &>/dev/null; then
    gnome-extensions disable "${EXTENSION_UUID}" 2>/dev/null || true
    echo "  ✓ Extension disabled"
fi

# 2 ── Remove extension directory ─────────────────────────────────
if [ -d "${INSTALL_DIR}" ]; then
    rm -rf "${INSTALL_DIR}"
    echo "  ✓ Extension files removed from ${INSTALL_DIR}"
else
    echo "  ! Extension directory not found – skipping"
fi

# 3 ── Remove compiled schema ──────────────────────────────────────
if [ -f "${SCHEMA_FILE}" ]; then
    rm -f "${SCHEMA_FILE}"
    glib-compile-schemas "${SCHEMA_DIR}" 2>/dev/null || true
    echo "  ✓ GSettings schema removed"
fi

# 4 ── Reset GSettings values (optional – cleans up dconf) ─────────
if command -v gsettings &>/dev/null; then
    gsettings reset-recursively org.gnome.shell.extensions.water-reminder 2>/dev/null || true
    echo "  ✓ Saved preferences cleared"
fi

echo ""
echo "Uninstallation complete!"
echo "Restart GNOME Shell to fully remove the icon from the Top Bar:"
echo "  X11:    Alt+F2 → type 'r' → Enter"
echo "  Wayland: log out and log back in"
