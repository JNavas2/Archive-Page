// OPTIONS.JS for Options Page in Archive Page browser extension
// © JOHN NAVAS 2025, ALL RIGHTS RESERVED 

// Saves options to chrome.storage
function save_options() {
    // Determine tab option based on radio buttons
    const iTabOption = document.getElementById('tabEnd').checked ? 1
        : document.getElementById('tabAct').checked ? 2
        : 0;

    const bButtonNew = document.getElementById('cbButtonNew').checked;
    const bPageNew = document.getElementById('cbPageNew').checked;
    const bArchiveNew = document.getElementById('cbArchiveNew').checked;
    const bSearchNew = document.getElementById('cbSearchNew').checked;
    let bNotify = document.getElementById('cbNotify').checked;

    // Handle notifications permission request if Notify option is checked
    if (bNotify) {
        chrome.permissions.request({ permissions: ['notifications'] }, granted => {
            if (!granted) {
                bNotify = false;
                document.getElementById('cbNotify').checked = false;
            }
            // Save options after permission request completes
            saveToStorage();
        });
    } else {
        // Remove notifications permission if unchecked
        chrome.permissions.remove({ permissions: ['notifications'] });
        saveToStorage();
    }

    // Function to save options to chrome.storage
    function saveToStorage() {
        chrome.storage.sync.set({
            tabOption: iTabOption,
            activateButtonNew: bButtonNew,
            activatePageNew: bPageNew,
            activateArchiveNew: bArchiveNew,
            activateSearchNew: bSearchNew,
            notifyOption: bNotify
        }, () => {
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(() => { status.textContent = ''; }, 750);
        });
    }
}

// Restores options from chrome.storage
function restore_options() {
    chrome.storage.sync.get({
        tabOption: 0,
        activateButtonNew: true,
        activatePageNew: true,
        activateArchiveNew: false,
        activateSearchNew: true,
        notifyOption: false
    }, items => {
        switch (items.tabOption) {
            case 1:
                document.getElementById('tabEnd').checked = true;
                break;
            case 2:
                document.getElementById('tabAct').checked = true;
                break;
            default:
                document.getElementById('tabAdj').checked = true;
        }
        document.getElementById('cbButtonNew').checked = items.activateButtonNew;
        document.getElementById('cbPageNew').checked = items.activatePageNew;
        document.getElementById('cbArchiveNew').checked = items.activateArchiveNew;
        document.getElementById('cbSearchNew').checked = items.activateSearchNew;
        document.getElementById('cbNotify').checked = items.notifyOption;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    restore_options();
    document.getElementById('bSave').addEventListener('click', save_options);
});
