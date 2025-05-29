// Archive Page extension for use with archive.today
// © JOHN NAVAS 2025, ALL RIGHTS RESERVED
// 1. Toolbar icon to send current tab to archive.today in new tab
// 2. Page context menu to search archive.today for the page URL
// 3. Link context menu items to Archive or Search with archive.today
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive.today tabs (archive & search)
// Options saved in sync, not local.

const URLA = 'https://archive.today/?run=1&url=';   // URL to invoke archive.today
const URLS = 'https://archive.today/search/?q='     // URL to search archive.today

// Helper: promisify chrome.storage.sync.get
function getStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(keys, resolve);
    });
}

// Helper: promisify chrome.tabs.query
function queryTabs(queryInfo) {
    return new Promise((resolve) => {
        chrome.tabs.query(queryInfo, resolve);
    });
}

// Helper: promisify chrome.tabs.create
function createTab(createProperties) {
    return new Promise((resolve) => {
        chrome.tabs.create(createProperties, resolve);
    });
}

// Helper: promisify chrome.tabs.update
function updateTab(updateProperties) {
    return new Promise((resolve) => {
        chrome.tabs.update(updateProperties, resolve);
    });
}

// Archive page URL
async function doArchivePage(uri, act) {
    try {
        const result = await getStorage({ tabOption: 0 });
        const postPageUrl = chrome.runtime.getURL('post.html') + '?url=' + encodeURIComponent(uri);

        switch (result.tabOption) {
            case 1: // NEW TAB AT END
                {
                    const tabs = await queryTabs({ active: true, currentWindow: true });
                    await createTab({
                        url: postPageUrl,
                        index: 999,
                        openerTabId: tabs[0]?.id,
                        active: act
                    });
                }
                break;
            case 2: // ACTIVE TAB
                await updateTab({ url: postPageUrl });
                break;
            default: // NEW TAB ADJACENT
                {
                    const tabs = await queryTabs({ active: true, currentWindow: true });
                    await createTab({
                        url: postPageUrl,
                        index: (tabs[0]?.index ?? 0) + 1,
                        openerTabId: tabs[0]?.id,
                        active: act
                    });
                }
        }
    } catch (error) {
        console.error('Error in doArchivePage:', error);
    }
}

// Search page URL
async function doSearchPage(uri, act) {
    try {
        console.log('doSearchPage act:', act); // DEBUG
        const result = await getStorage({ tabOption: 0 });
        console.log('tabOption:', result.tabOption); // DEBUG

        switch (result.tabOption) {
            case 1: // NEW TAB AT END
                {
                    const tabs = await queryTabs({ active: true, currentWindow: true });
                    await createTab({
                        url: URLS + encodeURIComponent(uri),
                        index: 999,
                        openerTabId: tabs[0]?.id,
                        active: act
                    });
                }
                break;
            case 2: // ACTIVE TAB (NULL)
            default: // NEW TAB ADJACENT
                {
                    const tabs = await queryTabs({ active: true, currentWindow: true });
                    await createTab({
                        url: URLS + encodeURIComponent(uri),
                        index: (tabs[0]?.index ?? 0) + 1,
                        openerTabId: tabs[0]?.id,
                        active: act
                    });
                }
        }
    } catch (error) {
        console.error('Error in doSearchPage:', error);
    }
}

// Listen for toolbar button click
chrome.action.onClicked.addListener(async (tab) => {
    try {
        const result = await getStorage({ activateButtonNew: true });
        console.log('activateButtonNew:', result.activateButtonNew); // DEBUG
        console.log('ArchivePage:', tab.url);   // DEBUG
        await doArchivePage(tab.url, result.activateButtonNew);
    } catch (error) {
        console.error('Error handling toolbar button click:', error);
    }
});

// Create context menu items on install
chrome.runtime.onInstalled.addListener(() => {
    try {
        chrome.contextMenus.create({
            id: "my_page_menu_id",
            title: "Search archive.today for this page",
            contexts: ["page"],
            documentUrlPatterns: ["https://*/*", "http://*/*"]
        });

        chrome.contextMenus.create({
            id: "my_link_menu_id",
            title: "Archive",
            contexts: ["link"],
            onclick: null // no onclick here, handled globally
        }, () => {
            chrome.contextMenus.create({
                id: "my_link_menu_archive_id",
                parentId: "my_link_menu_id",
                title: "Archive link",
                contexts: ["link"]
            });
            chrome.contextMenus.create({
                id: "my_link_menu_search_id",
                parentId: "my_link_menu_id",
                title: "Search link",
                contexts: ["link"]
            });
        });
    } catch (error) {
        console.error('Error creating context menus:', error);
    }
});

// Onboarding: open options page and show notification on update/install
chrome.runtime.onInstalled.addListener(async (details) => {
    try {
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
    } catch (error) {
        console.error('Error during onboarding:', error);
    }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        switch (info.menuItemId) {
            case "my_link_menu_archive_id": // context menu Link → Archive
                console.log('Archive:', tab.url); // DEBUG
                await myArchive(info, tab);
                break;
            case "my_link_menu_search_id":  // context menu Link → Search
            case "my_page_menu_id":         // context menu Page
                console.log('Search:', tab.url);  // DEBUG
                await mySearch(info, tab);
                break;
            default:
                console.log('Unknown context menu item clicked:', info.menuItemId);
        }
    } catch (error) {
        console.error('Error handling context menu click:', error);
    }
});

// Archive link
async function myArchive(info, tab) {
    try {
        const result = await getStorage({ activateArchiveNew: false });
        console.log('activateArchiveNew:', result.activateArchiveNew); // DEBUG
        if (info.linkUrl) {
            await doArchivePage(info.linkUrl, result.activateArchiveNew);
        } else {
            console.warn('No linkUrl found for archive action.');
        }
    } catch (error) {
        console.error('Error in myArchive:', error);
    }
}

// Search link or page
async function mySearch(info, tab) {
    try {
        console.log('tab.url:', tab.url); // DEBUG
        if (info.linkUrl) {
            const result = await getStorage({ activateSearchNew: true });
            console.log('activateSearchNew:', result.activateSearchNew); // DEBUG
            await doSearchPage(info.linkUrl, result.activateSearchNew);
        } else if (tab?.url) {
            const result = await getStorage({ activatePageNew: true });
            console.log('activatePageNew:', result.activatePageNew); // DEBUG
            await doSearchPage(tab.url, result.activatePageNew);
        } else {
            console.warn('No URL found to search.');
        }
    } catch (error) {
        console.error('Error in mySearch:', error);
    }
}

// END
