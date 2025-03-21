// Uninstall the extension if button clicked
function remove_me() {
    chrome.management.uninstallSelf({ showConfirmDialog: true });
}

document.getElementById('bRemove').addEventListener('click', remove_me);
