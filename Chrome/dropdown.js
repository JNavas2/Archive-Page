/*
    dropdown.js - Archive Page Extension Dropdown Logic
    Handles communication with the service worker for Desktop actions.
    © 2026 John Navas, All Rights Reserved
*/

document.getElementById('mSearch').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "execSearch" }, () => window.close());
});

document.getElementById('mArchive').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "execArchive" }, () => window.close());
});

document.getElementById('mOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
});