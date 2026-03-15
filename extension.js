import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

const SCHEMA_ID = 'org.gnome.shell.extensions.water-reminder';
const SOUND_EVENT = 'message';

// ── Indicator (Top Bar button) ────────────────────────────────────────────────
const WaterReminderIndicator = GObject.registerClass(
class WaterReminderIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Water Reminder');
        this._extension = extension;
        this._buildUI();
    }

    _buildUI() {
        const iconFile = Gio.File.new_for_path(
            `${this._extension.path}/glass-of-water.png`
        );
        const icon = new St.Icon({
            gicon: new Gio.FileIcon({ file: iconFile }),
            icon_size: 20,
            style_class: 'water-reminder-icon',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(icon);

        const remindItem = new PopupMenu.PopupMenuItem(_('Remind me now'));
        remindItem.connect('activate', () => this._extension.remindNow());
        this.menu.addMenuItem(remindItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const prefsItem = new PopupMenu.PopupMenuItem(_('Settings'));
        prefsItem.connect('activate', () => this._extension._openPreferences());
        this.menu.addMenuItem(prefsItem);
    }
});

// ── Main Extension ────────────────────────────────────────────────────────────
export default class WaterReminderExtension extends Extension {
    enable() {
        this._settings = this.getSettings(SCHEMA_ID);
        this._notifSource = null;
        this._timerId = null;

        this._indicator = new WaterReminderIndicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        this._startTimer();

        this._settingsChangedId = this._settings.connect('changed', () => {
            this._restartTimer();
        });
    }

    disable() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        this._stopTimer();
        this._notifSource = null;
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._settings = null;
    }

    // ── Timer ─────────────────────────────────────────────────────────────────

    _startTimer() {
        this._stopTimer();

        // Use timeout_add_seconds — more reliable than timeout_add for long
        // intervals because it avoids millisecond integer-overflow edge cases.
        const intervalSeconds = this._settings.get_int('interval-minutes') * 60;

        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            intervalSeconds,
            () => {
                if (this._isWithinActiveHours())
                    this._sendNotification();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _stopTimer() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }

    _restartTimer() {
        this._startTimer();
    }

    // ── Schedule check ────────────────────────────────────────────────────────

    _isWithinActiveHours() {
        const startTime = this._settings.get_string('start-time');
        const endTime   = this._settings.get_string('end-time');

        const now          = GLib.DateTime.new_now_local();
        const currentTotal = now.get_hour() * 60 + now.get_minute();

        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);

        return currentTotal >= sh * 60 + sm && currentTotal <= eh * 60 + em;
    }

    // ── Notification ──────────────────────────────────────────────────────────

    _getOrCreateSource() {
        if (this._notifSource !== null)
            return this._notifSource;

        this._notifSource = new MessageTray.Source({
            title: _('Water Reminder'),
            iconName: 'dialog-information-symbolic',
        });

        // Clear the cached reference when the tray destroys the source.
        this._notifSource.connect('destroy', () => {
            this._notifSource = null;
        });

        Main.messageTray.add(this._notifSource);
        return this._notifSource;
    }

    _sendNotification() {
        const source = this._getOrCreateSource();

        const notification = new MessageTray.Notification({
            source,
            title: _('Time to Drink Water! 💧'),
            body: _('Stay hydrated. Take a moment to drink a glass of water.'),
        });

        source.addNotification(notification);
        this._playSound();
    }

    _playSound() {
        try {
            // canberra-gtk-play uses the system sound theme — works with
            // PipeWire and PulseAudio without needing a specific file path.
            Gio.Subprocess.new(
                ['canberra-gtk-play', '-i', SOUND_EVENT],
                Gio.SubprocessFlags.NONE
            );
        } catch (_e) {
            // Sound not available — fail silently.
        }
    }

    // ── Public API (called from indicator) ───────────────────────────────────

    remindNow() {
        this._sendNotification();
    }

    _openPreferences() {
        super.openPreferences();
    }
}
