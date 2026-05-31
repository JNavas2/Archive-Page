/*
    welcome.js - Archive Page Extension Onboarding
    Logic for the Welcome page buttons
    © 2026 John Navas, All Rights Reserved
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {

    // Platform Detection for Buttons
    const info = await browserAPI.runtime.getPlatformInfo();
    const isAndroid = info.os === "android";

    function openUrlFirefox(url) {
        if (isAndroid) {
            window.open(url, "_blank");
        } else {
            browserAPI.tabs.create({ url });
        }
    }

    function closeWindowFirefox() {
        if (isAndroid) {
            window.close();
        } else {
            browserAPI.tabs.getCurrent(tab => {
                if (tab) browserAPI.tabs.remove(tab.id);
                else window.close();
            });
        }
    }

    // 1. Options
    document.getElementById('bOptions').addEventListener('click', () => {
        if (isAndroid) {
            openUrlFirefox(browserAPI.runtime.getURL("options.html"));
        } else {
            browserAPI.runtime.openOptionsPage().catch(() => {
                openUrlFirefox(browserAPI.runtime.getURL("options.html"));
            });
        }
    });

    // 2. Close
    document.getElementById('bClose').addEventListener('click', closeWindowFirefox);

    // 3. Remove
    document.getElementById('bRemove').addEventListener('click', () => {
        browserAPI.management.uninstallSelf({ showConfirmDialog: true });
    });

    // 4. Help
    document.getElementById('bHelp').addEventListener('click', () => {
        openUrlFirefox("https://github.com/JNavas2/Archive-Page");
    });
});