/*
    options.js - Archive Page Extension Options Logic
    Handles all scripting for options.html
    © 2025 John Navas, All Rights Reserved
*/

const MAP = {
    cb: [
        { k: 'activateButtonNew', i: 'cbButtonNew' },
        { k: 'activatePageNew', i: 'cbPageNew' },
        { k: 'activateArchiveNew', i: 'cbArchiveNew' },
        { k: 'activateSearchNew', i: 'cbSearchNew' },
        { k: 'notifyOption', i: 'cbNotify' }
    ],
    tab: { 'tabAdj': 0, 'tabEnd': 1, 'tabAct': 2 }
};

// Restores settings from chrome.storage.sync
async function restore_options() {
    chrome.storage.sync.get({
        tabOption: 0,
        activateButtonNew: true,
        activatePageNew: true,
        activateArchiveNew: true,
        activateSearchNew: true,
        notifyOption: false,
        archiveTld: "today",
        toolbarAction: "menu"
    }, (items) => {
        // Restore checkboxes
        MAP.cb.forEach(c => {
            const el = document.getElementById(c.i);
            if (el) el.checked = items[c.k];
        });

        // Restore "Open Archive in" radio buttons
        const tabId = Object.keys(MAP.tab).find(key => MAP.tab[key] === items.tabOption);
        if (tabId) document.getElementById(tabId).checked = true;

        // Restore Archive Domain
        const tldRadio = document.querySelector(`input[name="archiveTld"][value="${items.archiveTld}"]`);
        if (tldRadio) tldRadio.checked = true;

        // Restore Toolbar Action (New in 1.4.0)
        const actionRadio = document.querySelector(`input[name="toolbarAction"][value="${items.toolbarAction}"]`);
        if (actionRadio) actionRadio.checked = true;
    });
}

// Saves settings to chrome.storage.sync
async function save_options() {
    let bNotify = document.getElementById('cbNotify').checked;

    // Optional Notification Permission handling
    if (bNotify) {
        const granted = await chrome.permissions.request({ permissions: ['notifications'] });
        if (!granted) {
            bNotify = false;
            document.getElementById('cbNotify').checked = false;
        }
    } else {
        chrome.permissions.remove({ permissions: ['notifications'] });
    }

    const settings = {
        tabOption: MAP.tab[document.querySelector('input[name="tabCtl"]:checked').id],
        archiveTld: document.querySelector('input[name="archiveTld"]:checked').value,
        toolbarAction: document.querySelector('input[name="toolbarAction"]:checked').value,
        notifyOption: bNotify
    };

    // Map checkboxes to storage keys
    MAP.cb.forEach(c => {
        if (c.k !== 'notifyOption') {
            settings[c.k] = document.getElementById(c.i).checked;
        }
    });

    chrome.storage.sync.set(settings, () => {
        const status = document.getElementById('status');
        status.textContent = 'Saved!';
        setTimeout(() => { status.textContent = ''; }, 750);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('bSave').addEventListener('click', save_options);

// Remove button: Clear settings and prompt for manual uninstall
document.getElementById('bRemove').addEventListener('click', () => {
    chrome.management.uninstallSelf({ showConfirmDialog: true });
});

// Help button: Open the GitHub repository
document.getElementById('bHelp').addEventListener('click', () => {
    window.open('https://github.com/JNavas2/Archive-Page', '_blank');
});