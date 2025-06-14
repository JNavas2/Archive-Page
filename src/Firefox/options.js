// options.js - Archive Page options logic for Firefox/Chrome
// © 2025 John Navas, All Rights Reserved.

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Restore saved options to the form
function restoreOptions() {
    browserAPI.storage.local.get({
        tabOption: "tabAdj",
        archiveTld: "today",
        activateButtonNew: true,
        activatePageNew: true,
        activateArchiveNew: true,
        activateSearchNew: true,
        notify: false
    }, (result) => {
        // Tab Option radios
        document.getElementById("tabAdj").checked = result.tabOption === "tabAdj";
        document.getElementById("tabEnd").checked = result.tabOption === "tabEnd";
        document.getElementById("tabAct").checked = result.tabOption === "tabAct";

        // Archive domain radios
        const tlds = ["today", "is", "ph", "md", "vn", "li", "fo"];
        tlds.forEach(tld => {
            const el = document.getElementById("tld" + tld.charAt(0).toUpperCase() + tld.slice(1));
            if (el) el.checked = result.archiveTld === tld;
        });

        // Checkboxes
        document.getElementById("cbButtonNew").checked = !!result.activateButtonNew;
        document.getElementById("cbPageNew").checked = !!result.activatePageNew;
        document.getElementById("cbArchiveNew").checked = !!result.activateArchiveNew;
        document.getElementById("cbSearchNew").checked = !!result.activateSearchNew;
        document.getElementById("cbNotify").checked = !!result.notify;
    });
}

// Save options from the form to storage
function saveOptions() {
    // Tab Option
    let tabOption = "tabAdj";
    if (document.getElementById("tabEnd").checked) tabOption = "tabEnd";
    else if (document.getElementById("tabAct").checked) tabOption = "tabAct";

    // Archive Domain
    const tldRadios = document.querySelectorAll('input[name="archiveTld"]');
    let archiveTld = "today";
    tldRadios.forEach(radio => { if (radio.checked) archiveTld = radio.value; });

    // Checkboxes
    const activateButtonNew = document.getElementById("cbButtonNew").checked;
    const activatePageNew = document.getElementById("cbPageNew").checked;
    const activateArchiveNew = document.getElementById("cbArchiveNew").checked;
    const activateSearchNew = document.getElementById("cbSearchNew").checked;
    const notify = document.getElementById("cbNotify").checked;

    browserAPI.storage.local.set({
        tabOption,
        archiveTld,
        activateButtonNew,
        activatePageNew,
        activateArchiveNew,
        activateSearchNew,
        notify
    }, () => {
        showStatus("Saved!");
    });
}

// Remove all options from storage
function removeOptions() {
    browserAPI.storage.local.clear(() => {
        showStatus("Options removed!");
        restoreOptions(); // Reset form to defaults
    });
}

// Show status message
function showStatus(msg) {
    const status = document.getElementById("status");
    status.textContent = msg;
    setTimeout(() => { status.textContent = ""; }, 2000);
}

// Help button action
function showHelp() {
    // Open help in a new tab (edit URL as needed)
    window.open("https://github.com/JNavas2/Archive-Page", "_blank");
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
    restoreOptions();
    document.getElementById("bSave").addEventListener("click", saveOptions);
    document.getElementById("bRemove").addEventListener("click", removeOptions);
    document.getElementById("bHelp").addEventListener("click", showHelp);
});
