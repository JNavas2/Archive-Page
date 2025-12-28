/*
    dropdown.js - Archive Page Extension Dropdown Logic
    Handles communication with the service worker for Desktop actions.
    © 2025 John Navas, All Rights Reserved
*/

document.addEventListener('DOMContentLoaded', () => {
    // Send Search request to service worker
    document.getElementById('mSearch').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "execSearch" });
        window.close();
    });

    // Send Archive request to service worker
    document.getElementById('mArchive').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "execArchive" });
        window.close();
    });

    // Open the Options page directly
    document.getElementById('mOptions').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        window.close();
    });
});