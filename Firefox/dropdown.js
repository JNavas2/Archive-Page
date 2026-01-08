/*
    dropdown.js - Archive Page Extension Dropdown Logic
    Handles Desktop-specific menu actions.
    © 2026 John Navas, All Rights Reserved
*/

document.addEventListener('DOMContentLoaded', () => {
    // Search Action
    document.getElementById('mSearch').addEventListener('click', () => {
        browser.runtime.sendMessage({ action: "search" });
        window.close();
    });

    // Archive Action
    document.getElementById('mArchive').addEventListener('click', () => {
        browser.runtime.sendMessage({ action: "archive" });
        window.close();
    });

    // Options Action
    document.getElementById('mOptions').addEventListener('click', () => {
        browser.runtime.openOptionsPage();
        window.close();
    });
});