// Archive Page extension for use with archive.today and aliases
// © JOHN NAVAS 2025, ALL RIGHTS RESERVED
// 1. Toolbar icon to send current tab to archive in new tab
// 2. Page context menu to search Archive for the page URL
// 3. Link context menu items to Archive or Search with archive
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive tabs (archive & search)
// Option to select .today or an alias
// Options saved in sync, not local.

// Helper: Generate the archive/search URLs using the selected TLD
function getArchiveUrls(tld) {
    tld = tld || 'today';
    const base = `https://archive.${tld}`;
    return {
        archive: `${base}/?run=1&url=`,
        search: `${base}/search/?q=`
    };
}

// Archive page URL
function doArchivePage(uri, act) {
    chrome.storage.sync.get({ tabOption: 0, archiveTld: 'today' }, function (result) {
        const urls = getArchiveUrls(result.archiveTld);
        switch (result.tabOption) {
            case 1: // NEW TAB AT END
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.create({
                        url: urls.archive + encodeURIComponent(uri),
                        index: 999, // CLAMPED TO END BY BROWSER
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
                break;
            case 2: // ACTIVE TAB
                chrome.tabs.update({
                    url: urls.archive + encodeURIComponent(uri)
                });
                break;
            default: // NEW TAB ADJACENT
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.create({
                        url: urls.archive + encodeURIComponent(uri),
                        index: tabs[0].index + 1, // ADJACENT
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
        }
    });
}

// Search page URL
function doSearchPage(uri, act) {
    chrome.storage.sync.get({ tabOption: 0, archiveTld: 'today' }, function (result) {
        const urls = getArchiveUrls(result.archiveTld);
        switch (result.tabOption) {
            case 1: // NEW TAB AT END
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.create({
                        url: urls.search + encodeURIComponent(uri),
                        index: 999, // CLAMPED TO END BY BROWSER
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
                break;
            case 2: // ACTIVE TAB (NULL)
            default: // NEW TAB ADJACENT
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.create({
                        url: urls.search + encodeURIComponent(uri),
                        index: tabs[0].index + 1,
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
        }
    });
}

// Listen for toolbar button click
chrome.action.onClicked.addListener(function (tab) {
    chrome.storage.sync.get({ activateButtonNew: true }, function (result) {
        doArchivePage(tab.url, result.activateButtonNew);
    });
});

// V3: Add a listener to create the initial context menu items
chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "my_page_menu_id",
        "title": "Search archive for this page",
        "contexts": ["page"],
        "documentUrlPatterns": ["https://*/*", "http://*/*"],
    });
    var parentId = chrome.contextMenus.create({
        id: "my_link_menu_id",
        "title": "Archive",
        "contexts": ["link"]
    },
        function () {
            chrome.contextMenus.create({
                id: "my_link_menu_archive_id",
                "parentId": parentId,
                "title": "Archive link",
                "contexts": ["link"],
            });
            chrome.contextMenus.create({
                id: "my_link_menu_search_id",
                "parentId": parentId,
                "title": "Search link",
                "contexts": ["link"],
            });
        }
    );
});

// Add a listener for ONBOARDING
chrome.runtime.onInstalled.addListener((details) => {
    switch (details.reason) {
        case chrome.runtime.OnInstalledReason.UPDATE:
            chrome.permissions.contains({ permissions: ['notifications'] }, (enabled) => {
                if (enabled) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'images/Share2Archive-48.png',
                        title: 'Archive Page extension',
                        priority: 0,
                        message: 'Updated.\nSee Options to customize.'
                    });
                    chrome.runtime.openOptionsPage();
                }
            });
            break;
        case chrome.runtime.OnInstalledReason.INSTALL:
            chrome.runtime.openOptionsPage();
            break;
    }
});

// V3: Listen for button click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "my_link_menu_archive_id":
            myArchive(info, tab);
            break;
        case "my_link_menu_search_id":
        case "my_page_menu_id":
            mySearch(info, tab);
            break;
        default:
        // Unknown menu item
    }
});

// Archive link
function myArchive(info, tab) {
    chrome.storage.sync.get({ activateArchiveNew: false }, function (result) {
        doArchivePage(info.linkUrl, result.activateArchiveNew);
    });
}

// Search link
function mySearch(info, tab) {
    if (info.linkUrl) {
        chrome.storage.sync.get({ activateSearchNew: true }, function (result) {
            doSearchPage(info.linkUrl, result.activateSearchNew);
        });
    } else {
        chrome.storage.sync.get({ activatePageNew: true }, function (result) {
            doSearchPage(tab.url, result.activatePageNew);
        });
    }
}

// === Keyboard Shortcuts Support ===
chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "search-page") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            mySearch({ linkUrl: tabs[0].url }, tabs[0]);
        });
    }
});
