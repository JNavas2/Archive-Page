// REMOVE.JS for Options Page removal in Archive Page browser extension
// © JOHN NAVAS 2025, ALL RIGHTS RESERVED 

function remove_me() {
    chrome.management.uninstallSelf({ showConfirmDialog: true }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error uninstalling extension:', chrome.runtime.lastError);
            alert('Failed to uninstall the extension.');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const removeButton = document.getElementById('bRemove');
    if (removeButton) {
        removeButton.addEventListener('click', remove_me);
    } else {
        console.warn('Remove button not found.');
    }
});
