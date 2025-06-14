/*
    options.js - Archive Page Extension Options Logic
    Handles all scripting for options.html
    © 2025 John Navas, All Rights Reserved
*/

// Saves options to chrome.storage
function save_options() {
    var iTabOption = document.getElementById('tabEnd').checked ? 1 : (document.getElementById('tabAct').checked ? 2 : 0);
    var bButtonNew = document.getElementById('cbButtonNew').checked;
    var bPageNew = document.getElementById('cbPageNew').checked;
    var bArchiveNew = document.getElementById('cbArchiveNew').checked;
    var bSearchNew = document.getElementById('cbSearchNew').checked;
    var bNotify = document.getElementById('cbNotify').checked;
    var archiveTld = document.querySelector('input[name="archiveTld"]:checked').value;

    // Request permission for notifications when the Notify option is checked
    if (bNotify) {
        chrome.permissions.request({
            permissions: ['notifications']
        }, (granted) => {
            if (!granted) {
                bNotify = false;
                document.getElementById('cbNotify').checked = false;
            }
            // Save after permission check
            do_save();
        });
        return; // Prevent saving until permission is resolved
    } else {
        chrome.permissions.remove({ permissions: ['notifications'] });
    }

    do_save();

    function do_save() {
        chrome.storage.sync.set({
            tabOption: iTabOption,
            activateButtonNew: bButtonNew,
            activatePageNew: bPageNew,
            activateArchiveNew: bArchiveNew,
            activateSearchNew: bSearchNew,
            notifyOption: bNotify,
            archiveTld: archiveTld
        }, function() {
            var status = document.getElementById('status');
            status.textContent = 'Saved!';
            setTimeout(function() {
                status.textContent = '';
            }, 750);
        });
    }
}

// Restores all options from chrome.storage
function restore_options() {
    chrome.storage.sync.get({
        tabOption: 0,
        activateButtonNew: true,
        activatePageNew: true,
        activateArchiveNew: true,
        activateSearchNew: true,
        notifyOption: false,
        archiveTld: "today"
    }, function(items) {
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

        // Restore archive domain radio selection
        var tldRadio = document.querySelector('input[name="archiveTld"][value="' + items.archiveTld + '"]');
        if (tldRadio) tldRadio.checked = true;
    });
}

// Event listeners for DOMContentLoaded and Save button
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('bSave').addEventListener('click', save_options);

// Remove button: Uninstall the extension (with confirmation)
function remove_me() {
    if (chrome.management && chrome.management.uninstallSelf) {
        chrome.management.uninstallSelf({ showConfirmDialog: true });
    } else {
        // Fallback: clear settings and prompt for manual uninstall
        chrome.storage && chrome.storage.sync && chrome.storage.sync.clear();
        var status = document.getElementById('status');
        status.textContent = 'Settings cleared. Uninstall manually.';
        setTimeout(function () {
            status.textContent = '';
        }, 1500);
    }
}
document.getElementById('bRemove').addEventListener('click', remove_me);

// Help button: Open the extension's help page
document.getElementById('bHelp').addEventListener('click', function() {
    window.open('https://github.com/JNavas2/Archive-Page', '_blank');
});
