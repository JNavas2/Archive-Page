/*
    welcome.js - Archive Page Extension Onboarding
    Logic for the Welcome page buttons
    © 2026 John Navas, All Rights Reserved
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {

    // 1. Options: Opens the extension Options page
    document.getElementById('bOptions').addEventListener('click', () => {
        try {
            browserAPI.runtime.openOptionsPage();
        } catch (e) {
            browserAPI.tabs.create({ url: browserAPI.runtime.getURL("options.html") });
        }
    });

    // 2. Close: Closes the current Welcome tab with Android fallback
    document.getElementById('bClose').addEventListener('click', () => {
        browserAPI.tabs.getCurrent(tab => {
            if (tab) {
                browserAPI.tabs.remove(tab.id);
            } else {
                window.close(); // Logic fallback for mobile/Android
            }
        });
    });

    // 3. Remove: Triggers native Firefox uninstallation
    document.getElementById('bRemove').addEventListener('click', () => {
        browserAPI.management.uninstallSelf({ showConfirmDialog: true });
    });

    // 4. Help: Opens the GitHub extension home page
    document.getElementById('bHelp').addEventListener('click', () => {
        browserAPI.tabs.create({
            url: "https://github.com/JNavas2/Archive-Page"
        });
    });
});