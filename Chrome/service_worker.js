// Archive Page extension for use with archive.today and aliases
// © JOHN NAVAS 2025, ALL RIGHTS RESERVED
// 1. Toolbar icon to send current tab to archive in new tab
// 2. Page context menu to search Archive for the page URL
// 3. Link context menu items to Archive or Search with archive
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive tabs (archive & search)
// Option to select .today or an alias
// Options saved in sync, not local.

// 1. Helper: URL Generation
const getUrls = (t) => ({
    archive: `https://archive.${t}/?run=1&url=`,
    search: `https://archive.${t}/search/?q=`
});

// 2. Helper: Promisified Storage
const getSet = (k) => new Promise(r => chrome.storage.sync.get(k, r));

// 3. Central UI Manager: Handles Toolbar and Context Menus
async function updateUI() {
    const s = await getSet({ toolbarAction: "menu" });
    // Toggle between Dropdown and Direct Click
    chrome.action.setPopup({ popup: s.toolbarAction === "menu" ? "dropdown.html" : "" });

    await chrome.contextMenus.removeAll();
    // Only show Page Search context menu if Toolbar is set to Archive Only
    if (s.toolbarAction === "archive") {
        chrome.contextMenus.create({ id: "searchPage", title: "Search archive for page", contexts: ["page"] });
    }
    chrome.contextMenus.create({ id: "archiveLink", title: "Archive link", contexts: ["link"] });
    chrome.contextMenus.create({ id: "searchLink", title: "Search link", contexts: ["link"] });
}

// 4. Core Execution Engine
async function doAction(uri, act, type) {
    try {
        const s = await getSet({ tabOption: 0, archiveTld: "today" });
        const u = getUrls(s.archiveTld)[type];
        const url = u + encodeURIComponent(uri);

        // Handle "Active Tab" preference for archives
        if (type === 'archive' && s.tabOption === 2) return chrome.tabs.update({ url });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const idx = s.tabOption === 1 ? 999 : tabs[0].index + 1;
            chrome.tabs.create({ url, index: idx, openerTabId: tabs[0].id, active: act });
        });
    } catch (e) { console.error(`Action failed:`, e); }
}

// 5. Action & Menu Listeners
chrome.action.onClicked.addListener(async (tab) => {
    const s = await getSet({ toolbarAction: "menu", activateButtonNew: true });
    if (s.toolbarAction !== "menu") doAction(tab.url, s.activateButtonNew, s.toolbarAction);
});

chrome.contextMenus.onClicked.addListener(async (i, t) => {
    if (i.menuItemId === "archiveLink") {
        // Updated to true to match options default
        const s = await getSet({ activateArchiveNew: true });
        doAction(i.linkUrl, s.activateArchiveNew, 'archive');
    } else {
        const k = i.menuItemId === "searchLink" ? "activateSearchNew" : "activatePageNew";
        const s = await getSet({ [k]: true });
        doAction(i.linkUrl || t.url, s[k], 'search');
    }
});

// 6. Commands & Messages
chrome.commands.onCommand.addListener(async (c, t) => {
    if (c === "search-page") doAction(t.url, (await getSet({ activatePageNew: true })).activatePageNew, 'search');
});

chrome.runtime.onMessage.addListener(m => {
    if (!m.action) return;
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
        const act = (await getSet({ activateButtonNew: true })).activateButtonNew;
        doAction(tabs[0].url, act, m.action.toLowerCase().includes("search") ? "search" : "archive");
    });
});

// 7. Lifecycle: Onboarding & Upboarding
chrome.runtime.onInstalled.addListener((d) => {
    setTimeout(async () => {
        if (d.reason === "update") {
            const e = await new Promise(r => chrome.permissions.contains({ permissions: ['notifications'] }, r));
            if (e) chrome.notifications.create({ type: 'basic', iconUrl: 'images/icon-48.png', title: 'Archive Page', message: 'Updated.' });
        }
        try { await chrome.runtime.openOptionsPage(); } catch (e) { chrome.tabs.create({ url: chrome.runtime.getURL("options.html") }); }
    }, 200);
    updateUI();
});

chrome.storage.onChanged.addListener((c) => { if (c.toolbarAction || c.archiveTld) updateUI(); });