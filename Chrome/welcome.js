/*
    welcome.js - Archive Page Extension Onboarding (Chrome MV3)
    Logic for the Welcome page buttons
    © 2025 John Navas, All Rights Reserved
*/

document.addEventListener('DOMContentLoaded', () => {

    // 1. Options: Opens the extension Options page
    document.getElementById('bOptions').addEventListener('click', () => {
        try {
            chrome.runtime.openOptionsPage();
        } catch (e) {
            chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
        }
    });

    // 2. Close: Closes the current Welcome tab with Android fallback
    document.getElementById('bClose').addEventListener('click', () => {
        chrome.tabs.getCurrent(tab => {
            if (tab) {
                chrome.tabs.remove(tab.id);
            } else {
                window.close(); // Fallback for mobile/settings context
            }
        });
    });

    // 3. Remove: Triggers native Chrome uninstallation
    document.getElementById('bRemove').addEventListener('click', () => {
        chrome.management.uninstallSelf({ showConfirmDialog: true });
    });

    // 4. Help: Opens the GitHub extension home page
    document.getElementById('bHelp').addEventListener('click', () => {
        chrome.tabs.create({
            url: "https://github.com/JNavas2/Archive-Page"
        });
    });
});