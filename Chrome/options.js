/*
    options.js - Archive Page Extension Options Logic
    Handles all scripting for options.html
    © 2026 John Navas, All Rights Reserved
*/

const MAP = {
    cb: [
        { k: 'cbButtonNew', i: 'cbButtonNew' },
        { k: 'cbPageNew', i: 'cbPageNew' },
        { k: 'cbArchiveNew', i: 'cbArchiveNew' },
        { k: 'cbSearchNew', i: 'cbSearchNew' }
    ],
    rd: [{ k: 'archiveTld', n: 'archiveTld' }, { k: 'toolbarAction', n: 'toolbarAction' }],
    tab: { 'tabAdj': 'adjacent', 'tabEnd': 'end', 'tabAct': 'active' }
};

async function restoreOptions() {
    // FIXED: Default initialization for first run
    const items = await chrome.storage.sync.get({
        tabCtl: 'adjacent',
        cbButtonNew: true,
        cbPageNew: true,
        cbArchiveNew: true,
        cbSearchNew: true,
        archiveTld: "today",
        toolbarAction: "menu"
    });

    const info = await chrome.runtime.getPlatformInfo();
    const isAndroid = info.os === "android";

    // Restore checkboxes
    MAP.cb.forEach(c => {
        const el = document.getElementById(c.i);
        if (el) el.checked = items[c.k];
    });

    // Restore radio buttons
    MAP.rd.forEach(r => {
        const el = document.querySelector(`input[name="${r.n}"][value="${items[r.k]}"]`);
        if (el) el.checked = true;
    });

    // Restore Open In radios
    const tabId = Object.keys(MAP.tab).find(key => MAP.tab[key] === items.tabCtl);
    if (tabId) document.getElementById(tabId).checked = true;

    // Sync the shortcut permission checkbox state
    const hasTabs = await chrome.permissions.contains({ permissions: ['tabs'] });
    const section = document.getElementById('sectionShortcuts');
    const cbShortcuts = document.getElementById('cbShortcuts');
    if (cbShortcuts) cbShortcuts.checked = hasTabs;

    // Signal failed shortcut attempt if redirected via hash
    if (!hasTabs && window.location.hash === "#shortcuts" && section) {
        section.classList.add('signal-pulse');
    }
}

async function saveOptions() {
    const settings = {};
    MAP.cb.forEach(c => { settings[c.k] = document.getElementById(c.i).checked; });
    MAP.rd.forEach(r => { settings[r.k] = document.querySelector(`input[name="${r.n}"]:checked`).value; });
    settings.tabCtl = MAP.tab[document.querySelector('input[name="tabCtl"]:checked').id];

    await chrome.storage.sync.set(settings);
    const status = document.getElementById('status');
    status.textContent = 'Saved';
    setTimeout(() => { status.textContent = ''; }, 750);
}

document.addEventListener('DOMContentLoaded', async () => {
    await restoreOptions();

    // Exclude the permission checkbox from standard saveOptions
    document.querySelectorAll('input:not(#cbShortcuts)').forEach(input => {
        input.addEventListener('change', saveOptions);
    });

    // Special listener for optional permission toggle
    const cbShortcuts = document.getElementById('cbShortcuts');
    if (cbShortcuts) {
        cbShortcuts.addEventListener('change', (e) => {
            const section = document.getElementById('sectionShortcuts');
            if (e.target.checked) {
                chrome.permissions.request({ permissions: ['tabs'] }, (granted) => {
                    if (granted && section) section.classList.remove('signal-pulse');
                    else e.target.checked = false; // Reset if user cancels Chrome prompt
                });
            } else {
                chrome.permissions.remove({ permissions: ['tabs'] }, () => {
                    if (section) section.classList.remove('signal-pulse');
                });
            }
        });
    }

    document.getElementById('bClose').addEventListener('click', () => {
        chrome.tabs.getCurrent(tab => {
            if (tab) chrome.tabs.remove(tab.id);
            else window.close();
        });
    });

    document.getElementById('bRemove').addEventListener('click', () => chrome.management.uninstallSelf({ showConfirmDialog: true }));
    document.getElementById('bHelp').addEventListener('click', () => window.open('https://github.com/JNavas2/Archive-Page', '_blank'));
});