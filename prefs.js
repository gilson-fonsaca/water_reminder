import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const SCHEMA_ID = 'org.gnome.shell.extensions.water-reminder';
const GITHUB_URL = 'https://github.com/gilson-fonsaca/water_reminder';
const BMC_URL = 'https://www.buymeacoffee.com/Gilsonf';
const FLATICON_URL = 'https://www.flaticon.com/free-icons/glass';

export default class WaterReminderPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings(SCHEMA_ID);

        window.set_default_size(620, 500);

        window.add(_buildGeneralPage(settings));
        window.add(_buildDonatePage());
        window.add(_buildAboutPage(this.metadata));
    }
}

// ── General page ──────────────────────────────────────────────────────────────

function _buildGeneralPage(settings) {
    const page = new Adw.PreferencesPage({
        title: _('General'),
        icon_name: 'preferences-system-symbolic',
    });

    // Schedule group
    const scheduleGroup = new Adw.PreferencesGroup({
        title: _('Schedule'),
        description: _('Define the time window for receiving reminders.'),
    });
    page.add(scheduleGroup);

    scheduleGroup.add(_buildTimeRow(
        _('Start Time'),
        _('Reminders will begin from this time.'),
        settings, 'start-time', '09:00'
    ));
    scheduleGroup.add(_buildTimeRow(
        _('End Time'),
        _('Reminders will stop after this time.'),
        settings, 'end-time', '18:00'
    ));

    // Interval group
    const intervalGroup = new Adw.PreferencesGroup({
        title: _('Reminder Interval'),
        description: _('How often you want to be reminded.'),
    });
    page.add(intervalGroup);

    const intervalRow = new Adw.ActionRow({
        title: _('Interval'),
        subtitle: _('Time between reminders (in minutes).'),
    });
    const intervalSpin = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 5,
            upper: 240,
            step_increment: 5,
            page_increment: 15,
            value: settings.get_int('interval-minutes'),
        }),
        valign: Gtk.Align.CENTER,
        numeric: true,
    });
    intervalSpin.connect('value-changed', () => {
        settings.set_int('interval-minutes', intervalSpin.get_value_as_int());
    });
    const minLabel = new Gtk.Label({
        label: _('min'),
        valign: Gtk.Align.CENTER,
        css_classes: ['dim-label'],
    });
    const spinBox = new Gtk.Box({ spacing: 6, valign: Gtk.Align.CENTER });
    spinBox.append(intervalSpin);
    spinBox.append(minLabel);
    intervalRow.add_suffix(spinBox);
    intervalRow.set_activatable_widget(intervalSpin);
    intervalGroup.add(intervalRow);

    return page;
}

// ── Donate page ───────────────────────────────────────────────────────────────

function _buildDonatePage() {
    const page = new Adw.PreferencesPage({
        title: _('Donate'),
        icon_name: 'emblem-favorite-symbolic',
    });

    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Hero message
    const heroBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 12,
        margin_top: 24,
        margin_bottom: 24,
        margin_start: 12,
        margin_end: 12,
        halign: Gtk.Align.CENTER,
    });

    const coffeeLabel = new Gtk.Label({
        label: '☕',
        css_classes: ['title-1'],
    });

    const titleLabel = new Gtk.Label({
        label: _('Support this project'),
        css_classes: ['title-2'],
        halign: Gtk.Align.CENTER,
    });

    const bodyLabel = new Gtk.Label({
        label: _(
            'Water Reminder is free and open source.\n' +
            'If it helps you stay hydrated, consider buying me a coffee!'
        ),
        justify: Gtk.Justification.CENTER,
        wrap: true,
        halign: Gtk.Align.CENTER,
        css_classes: ['body', 'dim-label'],
    });

    heroBox.append(coffeeLabel);
    heroBox.append(titleLabel);
    heroBox.append(bodyLabel);

    const heroRow = new Adw.ActionRow();
    heroRow.set_child(heroBox);
    group.add(heroRow);

    // Buy Me a Coffee button row
    group.add(_buildLinkRow(
        _('Buy Me a Coffee ☕'),
        BMC_URL,
        BMC_URL
    ));

    // GitHub link row
    group.add(_buildLinkRow(
        _('Source Code'),
        GITHUB_URL,
        GITHUB_URL
    ));

    return page;
}

// ── About page ────────────────────────────────────────────────────────────────

function _buildAboutPage(metadata) {
    const page = new Adw.PreferencesPage({
        title: _('About'),
        icon_name: 'help-about-symbolic',
    });

    const group = new Adw.PreferencesGroup();
    page.add(group);

    group.add(new Adw.ActionRow({
        title: _('Version'),
        subtitle: String(metadata.version),
    }));

    group.add(_buildLinkRow(
        _('Source Code'),
        'GitHub',
        GITHUB_URL
    ));

    group.add(_buildLinkRow(
        _('Icon'),
        'Glass icons by DinosoftLabs – Flaticon',
        FLATICON_URL
    ));

    return page;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _buildTimeRow(title, subtitle, settings, key, placeholder) {
    const row = new Adw.ActionRow({ title, subtitle });
    const entry = new Gtk.Entry({
        text: settings.get_string(key),
        placeholder_text: placeholder,
        max_length: 5,
        width_chars: 6,
        valign: Gtk.Align.CENTER,
        css_classes: ['monospace'],
    });
    entry.connect('changed', () => {
        const value = entry.get_text();
        if (_isValidTime(value)) {
            settings.set_string(key, value);
            entry.remove_css_class('error');
        } else {
            entry.add_css_class('error');
        }
    });
    row.add_suffix(entry);
    row.set_activatable_widget(entry);
    return row;
}

function _buildLinkRow(title, subtitle, url) {
    const row = new Adw.ActionRow({ title, subtitle, activatable: true });
    row.add_suffix(new Gtk.Image({
        icon_name: 'adw-external-link-symbolic',
        valign: Gtk.Align.CENTER,
    }));
    row.connect('activated', () => {
        Gio.AppInfo.launch_default_for_uri_async(url, null, null, null);
    });
    return row;
}

function _isValidTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
