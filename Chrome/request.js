/*
    request.js - Archive Page Extension (Chrome MV3)
    Permission bridge for optional_host_permissions
    © 2026 John Navas, All Rights Reserved
*/

document.getElementById('bGrant').addEventListener('click', () => {
    // Permission request must be triggered by a synchronous user gesture
    chrome.permissions.request({
        origins: ["<all_urls>"]
    }, (granted) => {
        if (granted) {
            // Update UI to tell the user to redo their action
            document.getElementById('request-state').style.display = 'none';
            document.getElementById('success-state').style.display = 'block';
        }
    });
});

// Manual close button logic for the success state
document.getElementById('bClose').addEventListener('click', () => {
    chrome.tabs.getCurrent(tab => {
        if (tab) {
            chrome.tabs.remove(tab.id);
        } else {
            window.close();
        }
    });
});