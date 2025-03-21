// Archive Page extension for Mozilla Firefox for use with archive.today
// Written by John Navas
// 1. Toolbar icon to send current tab to archive.today in new tab
// 2. Page context menu to search archive.today for the page URL
// 3. Link context menu items to Archive or Search with archive.today
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive.today tabs (archive & search)
// For Firefox, options saved in local, not sync!

const URLA = 'https://archive.today/?run=1&url='; // URL to invoke archive.today
const URLS = 'https://archive.today/search/?q=' // URL to search archive.today

// Archive page URL
function doArchivePage(uri, act) {
    console.log('doArchivePage act: ' + act); // DEBUG
    chrome.storage.local.get({ tabOption: 0 }, function(result) {
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
    chrome.storage.local.get({ tabOption: 0 }, function(result) {
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
chrome.browserAction.onClicked.addListener(function(tab) {
    // get activate option
    chrome.storage.local.get({ activateButtonNew: true }, function(result) {
        console.log('activateButtonNew: ' + result.activateButtonNew); // DEBUG
        doArchivePage(tab.url, result.activateButtonNew);
    });
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

// Page context menu: Search for page URL
chrome.contextMenus.create({
    "title": "Search archive.today for page",
    "contexts": ["page"],
    "onclick": mySearch
});

// Link context menu: Archive or Search link
var parentId = chrome.contextMenus.create({
        "title": "Archive",
        "contexts": ["link"]
    },
    function() {
        chrome.contextMenus.create({
            "parentId": parentId,
            "title": "Archive link",
            "contexts": ["link"],
            "onclick": myArchive
        });
        chrome.contextMenus.create({
            "parentId": parentId,
            "title": "Search link",
            "contexts": ["link"],
            "onclick": mySearch
        });
    }
);

// Archive link
function myArchive(info, tab) {
    // get activate option
    chrome.storage.local.get({ activateArchiveNew: false }, function(result) {
        console.log('activateArchiveNew: ' + result.activateArchiveNew); // DEBUG
        doArchivePage(info.linkUrl, result.activateArchiveNew);
    });
}

// Search link
function mySearch(info, tab) {
    console.log('info.linkUrl: ' + info.linkUrl); // DEBUG
    console.log('tab.url: ' + tab.url); // DEBUG
    if (info.linkUrl) {
        // get activate option
        chrome.storage.local.get({ activateSearchNew: true }, function(result) {
            console.log('activateSearchNew: ' + result.activateSearchNew); // DEBUG
            doSearchPage(info.linkUrl, result.activateSearchNew);
        });
    } else {
        // get activate option
        chrome.storage.local.get({ activatePageNew: true }, function(result) {
            console.log('activatePageNew: ' + result.activatePageNew); // DEBUG
            doSearchPage(tab.url, result.activatePageNew);
        });
    }
}

// END