#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  Water Reminder – GNOME Shell Extension Installer
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

EXTENSION_UUID="water-reminder@gilsonf"
INSTALL_DIR="${HOME}/.local/share/gnome-shell/extensions/${EXTENSION_UUID}"
SCHEMA_SRC="schemas/org.gnome.shell.extensions.water-reminder.gschema.xml"
SCHEMA_DIR="${HOME}/.local/share/glib-2.0/schemas"

echo "Installing Water Reminder extension..."

# 1 ── Copy files ──────────────────────────────────────────────────
mkdir -p "${INSTALL_DIR}/schemas"
cp metadata.json extension.js prefs.js stylesheet.css "${INSTALL_DIR}/"
cp "${SCHEMA_SRC}" "${INSTALL_DIR}/schemas/"
echo "  ✓ Files copied to ${INSTALL_DIR}"

# 2 ── Compile GSettings schema ───────────────────────────────────
mkdir -p "${SCHEMA_DIR}"
cp "${SCHEMA_SRC}" "${SCHEMA_DIR}/"
glib-compile-schemas "${SCHEMA_DIR}"
glib-compile-schemas "${INSTALL_DIR}/schemas/"
echo "  ✓ GSettings schema compiled"

# 3 ── Enable extension ────────────────────────────────────────────
# gnome-extensions enable only works when GNOME Shell already knows about the
# extension (i.e. after a restart). We therefore also write directly to gsettings
# so the extension is queued to auto-start on the next login.

# Try gnome-extensions first (works on X11 or after a restart on Wayland)
if command -v gnome-extensions &>/dev/null; then
    gnome-extensions enable "${EXTENSION_UUID}" 2>/dev/null || true
fi

# Ensure the UUID is present in the enabled-extensions gsettings key
python3 - <<PYEOF
import subprocess, ast
result = subprocess.run(
    ['gsettings', 'get', 'org.gnome.shell', 'enabled-extensions'],
    capture_output=True, text=True)
lst = ast.literal_eval(result.stdout.strip())
uuid = '${EXTENSION_UUID}'
if uuid not in lst:
    lst.append(uuid)
new_val = "[" + ", ".join(f"'{x}'" for x in lst) + "]"
subprocess.run(['gsettings', 'set', 'org.gnome.shell', 'enabled-extensions', new_val])
PYEOF

echo "  ✓ Extension queued for activation"

# 4 ── Optionally install a custom symbolic icon ───────────────────
# If you have a custom SVG named drink-water-symbolic.svg, uncomment:
#
# ICON_DIR="${HOME}/.local/share/icons/hicolor/scalable/apps"
# mkdir -p "${ICON_DIR}"
# cp drink-water-symbolic.svg "${ICON_DIR}/drink-water-symbolic.svg"
# gtk-update-icon-cache -f -t "${HOME}/.local/share/icons/hicolor" 2>/dev/null || true
# echo "  ✓ Custom icon installed"

echo ""
echo "Installation complete!"
echo ""

SESSION="${XDG_SESSION_TYPE:-unknown}"
if [ "${SESSION}" = "wayland" ]; then
    echo "  ► You are on WAYLAND – log out and back in to activate the extension."
else
    echo "  ► You are on X11 – press Alt+F2, type 'r', and press Enter to restart the shell."
fi
echo ""
echo "After restarting the shell, open preferences with:"
echo "  gnome-extensions prefs ${EXTENSION_UUID}"
