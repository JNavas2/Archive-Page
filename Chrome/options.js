/*
    options.js - Archive Page Extension Options Logic
    Handles all scripting for options.html
    © 2025 John Navas, All Rights Reserved
*/

const MAP = {
    cb: [
        { k: 'cbButtonNew', i: 'cbButtonNew' },
        { k: 'cbPageNew', i: 'cbPageNew' },
        { k: 'cbArchiveNew', i: 'cbArchiveNew' },
        { k: 'cbSearchNew', i: 'cbSearchNew' },
        { k: 'cbNotify', i: 'cbNotify' }
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
        cbNotify: false,
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
    document.querySelectorAll('input').forEach(input => input.addEventListener('change', saveOptions));

    document.getElementById('bClose').addEventListener('click', () => {
        chrome.tabs.getCurrent(tab => {
            if (tab) chrome.tabs.remove(tab.id);
            else window.close();
        });
    });

    document.getElementById('bRemove').addEventListener('click', () => chrome.management.uninstallSelf({ showConfirmDialog: true }));
    document.getElementById('bHelp').addEventListener('click', () => window.open('https://github.com/JNavas2/Archive-Page', '_blank'));
});