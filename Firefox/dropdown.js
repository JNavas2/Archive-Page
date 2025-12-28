/*
    dropdown.js - Archive Page Extension Dropdown Logic
    Handles Desktop-specific menu actions.
    © 2025 John Navas, All Rights Reserved
*/

document.addEventListener('DOMContentLoaded', () => {
    // Search Action
    document.getElementById('mSearch').addEventListener('click', () => {
        browser.runtime.sendMessage({ action: "execSearch" });
        window.close();
    });

    // Archive Action
    document.getElementById('mArchive').addEventListener('click', () => {
        browser.runtime.sendMessage({ action: "execArchive" });
        window.close();
    });

    // Options Action
    document.getElementById('mOptions').addEventListener('click', () => {
        browser.runtime.openOptionsPage();
        window.close();
    });
});