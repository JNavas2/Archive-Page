// Archive Page extension for use with Archive Today and aliases
// © JOHN NAVAS 2026, ALL RIGHTS RESERVED
// 1. Toolbar icon to send current tab to archive in new tab
// 2. Page context menu to search Archive for the page URL
// 3. Link context menu items to Archive or Search with archive
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive tabs (archive & search)
// Option to select .today or an alias
// Options saved in sync, not local.

const getUrls = (t) => ({
    archive: `https://archive.${t}/?run=1&url=`,
    search: `https://archive.${t}/search/?q=`
});

const getSet = (k) => new Promise(r => chrome.storage.sync.get(k, r));

async function updateUI() {
    const s = await getSet({ toolbarAction: "menu" });
    chrome.action.setPopup({ popup: s.toolbarAction === "menu" ? "dropdown.html" : "" });

    chrome.contextMenus.removeAll(() => {
        if (s.toolbarAction === "archive") {
            chrome.contextMenus.create({
                id: "searchPage",
                title: "Search archive for page",
                contexts: ["page"]
            }, () => { if (chrome.runtime.lastError) { } });
        }
        chrome.contextMenus.create({
            id: "searchLink",
            title: "Search link",
            contexts: ["link"]
        }, () => { if (chrome.runtime.lastError) { } });
        chrome.contextMenus.create({
            id: "archiveLink",
            title: "Archive link",
            contexts: ["link"]
        }, () => { if (chrome.runtime.lastError) { } });
    });
}

async function doAction(uri, act, type) {
    if (uri === "" || (uri && (uri.startsWith('chrome://') || uri.startsWith('about:')))) {
        return;
    }

    if (typeof uri === 'undefined') {
        chrome.tabs.create({ url: chrome.runtime.getURL("request.html") });
        return;
    }

    try {
        const s = await getSet({ tabCtl: "adjacent", archiveTld: "today" });
        const u = getUrls(s.archiveTld)[type];
        const url = u + encodeURIComponent(uri);
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs[0]) return;

        if (type === 'archive' && s.tabCtl === 'active') {
            return chrome.tabs.update(tabs[0].id, { url });
        }

        const idx = s.tabCtl === 'end' ? 999 : tabs[0].index + 1;
        await chrome.tabs.create({ url, index: idx, active: act });
    } catch (e) { console.error(`Action failed:`, e); }
}

chrome.action.onClicked.addListener(async (tab) => {
    const s = await getSet({ toolbarAction: "menu", cbButtonNew: true });
    if (s.toolbarAction !== "menu") {
        doAction(tab.url, s.cbButtonNew, s.toolbarAction);
    }
});

// FIXED: Only show Welcome page on fresh install OR version ending in ".0"
// Prevents up-boarding on browser updates or minor patch releases.
chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion = chrome.runtime.getManifest().version;

    if (details.reason === "install") {
        showWelcome();
    } else if (details.reason === "update") {
        // Only show for major releases (e.g., "1.5.0")
        if (currentVersion.endsWith('.0')) {
            showWelcome();
        }
    }
    updateUI();
});

function showWelcome() {
    setTimeout(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
    }, 200);
}

chrome.runtime.onMessage.addListener((m) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs[0]) return;
        if (m.action === "execSearch") {
            const s = await getSet({ cbSearchNew: true });
            doAction(tabs[0].url, s.cbSearchNew, "search");
        }
        if (m.action === "execArchive") {
            const s = await getSet({ cbArchiveNew: true });
            doAction(tabs[0].url, s.cbArchiveNew, "archive");
        }
    });
});

chrome.storage.onChanged.addListener((c, area) => {
    if (area === "sync" && (c.toolbarAction || c.archiveTld)) updateUI();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const s = await getSet({ cbArchiveNew: true, cbSearchNew: true, cbPageNew: true });
    if (info.menuItemId === "archiveLink") doAction(info.linkUrl, s.cbArchiveNew, "archive");
    else if (info.menuItemId === "searchLink") doAction(info.linkUrl, s.cbSearchNew, "search");
    else if (info.menuItemId === "searchPage") doAction(tab.url, s.cbPageNew, "search");
});

// Handle keyboard shortcuts
if (chrome.commands) {
    chrome.commands.onCommand.addListener(async (command) => {
        const hasTabs = await chrome.permissions.contains({ permissions: ['tabs'] });

        if (!hasTabs) {
            chrome.tabs.create({ url: chrome.runtime.getURL("options.html#shortcuts") });
            return;
        }

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0] || !tabs[0].url) return;

        if (command === "mySearch") {
            const s = await getSet({ cbSearchNew: true });
            doAction(tabs[0].url, s.cbSearchNew, "search");
        }
        else if (command === "myArchive") {
            const s = await getSet({ cbArchiveNew: true });
            doAction(tabs[0].url, s.cbArchiveNew, "archive");
        }
    });
}

// Initialize on startup
updateUI();