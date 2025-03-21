// Archive Page extension for use with archive.today
// Written by John Navas
// 1. Toolbar icon to send current tab to archive.today in new tab
// 2. Page context menu to search archive.today for the page URL
// 3. Link context menu items to Archive or Search with archive.today
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive.today tabs (archive & search)
// Options saved in sync, not local.

const URLA = 'https://archive.today/?run=1&url=';   // URL to invoke archive.today
const URLS = 'https://archive.today/search/?q='     // URL to search archive.today

// Archive page URL
function doArchivePage(uri, act) {
    console.log('doArchivePage act: ' + act); // DEBUG
    chrome.storage.sync.get({ tabOption: 0 }, function(result) {
        console.log('tabOption: ' + result.tabOption); // DEBUG
        switch (result.tabOption) {
            case 1: // NEW TAB AT END
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.create({
                        url: URLA + encodeURIComponent(uri),
                        index: 999, // CLAMPED TO END BY BROWSER
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
                break;
            case 2: // ACTIVE TAB
                chrome.tabs.update({
                    url: URLA + encodeURIComponent(uri)
                });
                break;
            default: // NEW TAB ADJACENT
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.create({
                        url: URLA + encodeURIComponent(uri),
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
    console.log('doSearchPage act: ' + act); // DEBUG
    chrome.storage.sync.get({ tabOption: 0 }, function(result) {
        console.log('tabOption: ' + result.tabOption); // DEBUG
        switch (result.tabOption) {
            case 1: // NEW TAB AT END
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.create({
                        url: URLS + encodeURIComponent(uri),
                        index: 999, // CLAMPED TO END BY BROWSER
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
                break;
            case 2: // ACTIVE TAB (NULL)
            default: // NEW TAB ADJACENT
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.create({
                        url: URLS + encodeURIComponent(uri),
                        index: tabs[0].index + 1,
                        openerTabId: tabs[0].id,
                        active: act
                    });
                });
        }
    });
}

// Listen for toolbar button click
chrome.action.onClicked.addListener(function(tab) {
    // get activate option
    chrome.storage.sync.get({ activateButtonNew: true }, function(result) {
        console.log('activateButtonNew: ' + result.activateButtonNew); // DEBUG
        console.log('ArchivePage: ' + tab.url);   // DEBUG
        doArchivePage(tab.url, result.activateButtonNew);
    });
});

// V3: Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "my_page_menu_id",
        "title": "Search archive.today for this page",
        "contexts": ["page"],
        "documentUrlPatterns": ["https://*/*", "http://*/*"],
        // "onclick": mySearch
    });
    var parentId = chrome.contextMenus.create({
        id: "my_link_menu_id",
        "title": "Archive",
        "contexts": ["link"]
        },
        function() {
            chrome.contextMenus.create({
                id: "my_link_menu_archive_id",
                "parentId": parentId,
                "title": "Archive link",
                "contexts": ["link"],
                // "onclick": myArchive
            });
            chrome.contextMenus.create({
                id: "my_link_menu_search_id",
                "parentId": parentId,
                "title": "Search link",
                "contexts": ["link"],
                // "onclick": mySearch
            });
        }
    );        
});

// Add a listener for ONBOARDING
chrome.runtime.onInstalled.addListener((details) => {
    switch (details.reason) {
        case chrome.runtime.OnInstalledReason.UPDATE:
            chrome.permissions.contains({ permissions: ['notifications'] }, (enabled) => {
                if (enabled) { // The extension has the permission
                    chrome.notifications.create({
                        type: 'basic', iconUrl: 'images\\Share2Archive-48.png', title: 'Archive Page extension',
                        priority: 0, message: 'Updated.\nSee Options to customize.'
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
        case "my_link_menu_archive_id": // context menu Link → Archive
            console.log('Archive: ' + tab.url); // DEBUG
            myArchive(info, tab);   // invoke my archive for page URL
            break;
        case "my_link_menu_search_id":  // context menu Link → Search
        case "my_page_menu_id":         // context menu Page
            console.log('Search: ' + tab.url);  // DEBUG
            mySearch(info, tab);    // invoke my search for page URL
            break;
        default:
            console.log('Error!'); // DEBUG
    }
})

// Archive link
function myArchive(info, tab) {
    // get activate option
    chrome.storage.sync.get({ activateArchiveNew: false }, function(result) {
        console.log('activateArchiveNew: ' + result.activateArchiveNew); // DEBUG
        doArchivePage(info.linkUrl, result.activateArchiveNew);
    });
}

// Search link
function mySearch(info, tab) {
    console.log('tab.url: ' + tab.url); // DEBUG
    if (info.linkUrl) {
        // get activate option
        chrome.storage.sync.get({ activateSearchNew: true }, function(result) {
            console.log('activateSearchNew: ' + result.activateSearchNew); // DEBUG
            doSearchPage(info.linkUrl, result.activateSearchNew);
        });
    } else {
        // get activate option
        chrome.storage.sync.get({ activatePageNew: true }, function(result) {
            console.log('activatePageNew: ' + result.activatePageNew); // DEBUG
            doSearchPage(tab.url, result.activatePageNew);
        });
    }
}

// END