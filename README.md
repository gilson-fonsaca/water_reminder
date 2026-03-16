# Water Reminder – GNOME Shell Extension

A GNOME Shell extension (45+) that sends periodic notifications reminding you to drink water, with a custom icon in the Top Bar, sound alert, and configurable schedule.

## Features

- **Custom icon** in the Top Bar – quick access to "Remind me now" and Settings.
- **Sound alert** – plays a system sound on every notification.
- **Active schedule** – notifications are only sent between the configured start and end times.
- **Configurable interval** – reminders every 5 to 240 minutes.
- **Notification area** – reminders are retained until manually dismissed.
- **Preferences window** – modern UI built with Libadwaita.
- **GSettings persistence** – preferences are saved across reboots.

## File Structure

```
water-reminder@gilsonf/
├── metadata.json          # Extension manifest
├── extension.js           # Core logic (icon, timer, notifications, sound)
├── prefs.js               # Preferences window (Libadwaita)
├── stylesheet.css         # Top Bar icon styling
├── glass-of-water.png     # Top Bar icon
├── schemas/
│   └── org.gnome.shell.extensions.water-reminder.gschema.xml
├── install.sh             # Install script
├── uninstall.sh           # Uninstall script
└── LICENSE                # GPL-2.0
```

## Installation

```bash
bash install.sh
```

The script will:
1. Copy all files to `~/.local/share/gnome-shell/extensions/water-reminder@gilsonf/`
2. Compile the GSettings schema
3. Register the extension as enabled via `gsettings`

> **Wayland:** log out and back in after installing so the Shell reloads extensions.
> **X11:** press `Alt+F2`, type `r`, and press `Enter`.

### Manual installation

```bash
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/water-reminder@gilsonf"
mkdir -p "$EXT_DIR/schemas"
cp metadata.json extension.js prefs.js stylesheet.css glass-of-water.png "$EXT_DIR/"
cp schemas/*.xml "$EXT_DIR/schemas/"
glib-compile-schemas "$EXT_DIR/schemas/"
```

## Uninstallation

```bash
bash uninstall.sh
```

## Preferences

Open from the icon menu → **Settings**, or from the terminal. The preferences window has three tabs: **General** (schedule and interval), **Donate**, and **About**.



```bash
gnome-extensions prefs water-reminder@gilsonf
```

| Setting | Default | Description |
|---|---|---|
| Start Time | `09:00` | Notifications begin from this time |
| End Time | `18:00` | Notifications stop after this time |
| Interval | `60 min` | Minutes between each reminder (min. 5, max. 240) |

## Requirements

- GNOME Shell 45, 46, 47, 48 or 49
- GJS (included with GNOME)
- Libadwaita (included with GNOME 42+)
- `canberra-gtk-play` (for sound alerts — included in most GNOME desktop installations)

## Support

If this extension helps you stay hydrated, consider buying me a coffee:

[![Buy Me a Coffee](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/Gilsonf)

## Credits

**Icon:** [Glass icons created by DinosoftLabs – Flaticon](https://www.flaticon.com/free-icons/glass)

## License

GPL-2.0 – see [LICENSE](LICENSE)
