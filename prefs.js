import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const SCHEMA_ID = 'org.gnome.shell.extensions.water-reminder';

export default class WaterReminderPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings(SCHEMA_ID);

        window.set_default_size(600, 400);

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        // ── Schedule group ────────────────────────────────────────────────────
        const scheduleGroup = new Adw.PreferencesGroup({
            title: _('Schedule'),
            description: _('Define the time window for receiving reminders.'),
        });
        page.add(scheduleGroup);

        // Start time row
        const startRow = new Adw.ActionRow({
            title: _('Start Time'),
            subtitle: _('Reminders will begin from this time.'),
        });
        const startEntry = new Gtk.Entry({
            text: settings.get_string('start-time'),
            placeholder_text: '09:00',
            max_length: 5,
            width_chars: 6,
            valign: Gtk.Align.CENTER,
            css_classes: ['monospace'],
        });
        startEntry.connect('changed', () => {
            const value = startEntry.get_text();
            if (_isValidTime(value)) {
                settings.set_string('start-time', value);
                startEntry.remove_css_class('error');
            } else {
                startEntry.add_css_class('error');
            }
        });
        startRow.add_suffix(startEntry);
        startRow.set_activatable_widget(startEntry);
        scheduleGroup.add(startRow);

        // End time row
        const endRow = new Adw.ActionRow({
            title: _('End Time'),
            subtitle: _('Reminders will stop after this time.'),
        });
        const endEntry = new Gtk.Entry({
            text: settings.get_string('end-time'),
            placeholder_text: '18:00',
            max_length: 5,
            width_chars: 6,
            valign: Gtk.Align.CENTER,
            css_classes: ['monospace'],
        });
        endEntry.connect('changed', () => {
            const value = endEntry.get_text();
            if (_isValidTime(value)) {
                settings.set_string('end-time', value);
                endEntry.remove_css_class('error');
            } else {
                endEntry.add_css_class('error');
            }
        });
        endRow.add_suffix(endEntry);
        endRow.set_activatable_widget(endEntry);
        scheduleGroup.add(endRow);

        // ── Interval group ────────────────────────────────────────────────────
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

        const minutesLabel = new Gtk.Label({
            label: _('min'),
            valign: Gtk.Align.CENTER,
            css_classes: ['dim-label'],
        });

        const box = new Gtk.Box({ spacing: 6, valign: Gtk.Align.CENTER });
        box.append(intervalSpin);
        box.append(minutesLabel);

        intervalRow.add_suffix(box);
        intervalRow.set_activatable_widget(intervalSpin);
        intervalGroup.add(intervalRow);

        // ── About group ───────────────────────────────────────────────────────
        const aboutGroup = new Adw.PreferencesGroup({ title: _('About') });
        page.add(aboutGroup);

        const versionRow = new Adw.ActionRow({
            title: _('Version'),
            subtitle: String(this.metadata.version),
        });
        aboutGroup.add(versionRow);

        // Source code link
        const sourceRow = new Adw.ActionRow({
            title: _('Source Code'),
            subtitle: 'https://gitlab.com/gilson.fonsaca/drink_water',
            activatable: true,
        });
        const sourceIcon = new Gtk.Image({
            icon_name: 'adw-external-link-symbolic',
            valign: Gtk.Align.CENTER,
        });
        sourceRow.add_suffix(sourceIcon);
        sourceRow.connect('activated', () => {
            Gio.AppInfo.launch_default_for_uri_async(
                'https://gitlab.com/gilson.fonsaca/drink_water',
                null, null, null
            );
        });
        aboutGroup.add(sourceRow);

        // Icon attribution
        const iconRow = new Adw.ActionRow({
            title: _('Icon'),
            subtitle: 'Glass icons by DinosoftLabs – Flaticon',
            activatable: true,
        });
        const iconLinkIcon = new Gtk.Image({
            icon_name: 'adw-external-link-symbolic',
            valign: Gtk.Align.CENTER,
        });
        iconRow.add_suffix(iconLinkIcon);
        iconRow.connect('activated', () => {
            Gio.AppInfo.launch_default_for_uri_async(
                'https://www.flaticon.com/free-icons/glass',
                null, null, null
            );
        });
        aboutGroup.add(iconRow);
    }
}

function _isValidTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
