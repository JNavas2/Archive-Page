// Saves options to chrome.storage (LOCAL, NOT SYNC)
function save_options() {
    var iTabOption = document.getElementById('tabEnd').checked ? 1 : (document.getElementById('tabAct').checked ? 2 : 0);
    var bButtonNew = document.getElementById('cbButtonNew').checked;
    var bPageNew = document.getElementById('cbPageNew').checked;
    var bArchiveNew = document.getElementById('cbArchiveNew').checked;
    var bSearchNew = document.getElementById('cbSearchNew').checked;
    var bNotify = document.getElementById('cbNotify').checked;

    // request permission for notifications when the Notify option is checked
    if (bNotify) {
        chrome.permissions.request({
            permissions: ['notifications'] }, (granted) => {
            // The callback argument will be true if the user granted the permissions.
            if (granted) {
                // do nothing
            } else {
                bNotify = false;
                document.getElementById('cbNotify').checked = false;
            }
        });                    
    } else {
        chrome.permissions.remove({ permissions: ['notifications'] })
    }

    chrome.storage.local.set({
        tabOption: iTabOption,
        activateButtonNew: bButtonNew,
        activatePageNew: bPageNew,
        activateArchiveNew: bArchiveNew,
        activateSearchNew: bSearchNew,
        notifyOption: bNotify
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage (LOCAL, NOT SYNC)
function restore_options() {
    // Default tab option is Adjacent (0, 1: end, 2: active)
    // defaults values for all activate options.
    chrome.storage.local.get({
        tabOption: 0,
        activateButtonNew: true,
        activatePageNew: true,
        activateArchiveNew: false,
        activateSearchNew: true,
        notifyOption: false
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
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('bSave').addEventListener('click', save_options);