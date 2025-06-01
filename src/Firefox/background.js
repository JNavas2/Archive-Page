// Archive Page extension for Mozilla Firefox for use with archive.today
// Written by John Navas
// 1. Toolbar icon to send current tab to archive.today in new tab
// 2. Page context menu to search archive.today for the page URL
// 3. Link context menu items to Archive or Search with archive.today
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new archive.today tabs (archive & search)
// For Firefox, options saved in local, not sync!

const URLA = 'https://archive.today/?run=1&url=';
const URLS = 'https://archive.today/search/?q=';

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

function doArchivePage(uri, act) {
  console.log('doArchivePage act: ' + act);
  browserAPI.storage.local.get({ tabOption: 0 }, function (result) {
    console.log('tabOption: ' + result.tabOption);
    switch (result.tabOption) {
      case 1:
        browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          browserAPI.tabs.create({
            url: URLA + encodeURIComponent(uri),
            index: 999,
            // openerTabId removed for Firefox compatibility
            active: act
          });
        });
        break;
      case 2:
        browserAPI.tabs.update({
          url: URLA + encodeURIComponent(uri)
        });
        break;
      default:
        browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          browserAPI.tabs.create({
            url: URLA + encodeURIComponent(uri),
            index: tabs[0].index + 1,
            // openerTabId removed for Firefox compatibility
            active: act
          });
        });
    }
  });
}

function doSearchPage(uri, act) {
  console.log('doSearchPage act: ' + act);
  browserAPI.storage.local.get({ tabOption: 0 }, function (result) {
    console.log('tabOption: ' + result.tabOption);
    switch (result.tabOption) {
      case 1:
        browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          browserAPI.tabs.create({
            url: URLS + encodeURIComponent(uri),
            index: 999,
            // openerTabId removed for Firefox compatibility
            active: act
          });
        });
        break;
      case 2:
      default:
        browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          browserAPI.tabs.create({
            url: URLS + encodeURIComponent(uri),
            index: tabs[0].index + 1,
            // openerTabId removed for Firefox compatibility
            active: act
          });
        });
    }
  });
}

function myArchive(info, tab) {
  browserAPI.storage.local.get({ activateArchiveNew: false }, function (result) {
    console.log('activateArchiveNew: ' + result.activateArchiveNew);
    doArchivePage(info.linkUrl, result.activateArchiveNew);
  });
}

function mySearch(info, tab) {
  console.log('info.linkUrl: ' + info.linkUrl);
  console.log('tab.url: ' + tab.url);
  if (info.linkUrl) {
    browserAPI.storage.local.get({ activateSearchNew: true }, function (result) {
      console.log('activateSearchNew: ' + result.activateSearchNew);
      doSearchPage(info.linkUrl, result.activateSearchNew);
    });
  } else {
    browserAPI.storage.local.get({ activatePageNew: true }, function (result) {
      console.log('activatePageNew: ' + result.activatePageNew);
      doSearchPage(tab.url, result.activatePageNew);
    });
  }
}

browserAPI.runtime.getPlatformInfo().then(info => {
  const isAndroid = info.os === "android";

  if (!isAndroid) {
    // Desktop: create context menus
    browserAPI.contextMenus.create({
      "title": "Search archive.today for page",
      "contexts": ["page"],
      "onclick": mySearch
    });

    const parentId = browserAPI.contextMenus.create({
      "title": "Archive",
      "contexts": ["link"]
    }, () => {
      browserAPI.contextMenus.create({
        "parentId": parentId,
        "title": "Archive link",
        "contexts": ["link"],
        "onclick": myArchive
      });
      browserAPI.contextMenus.create({
        "parentId": parentId,
        "title": "Search link",
        "contexts": ["link"],
        "onclick": mySearch
      });
    });

    if (browserAPI.commands && browserAPI.commands.onCommand) {
      browserAPI.commands.onCommand.addListener(command => {
        browserAPI.tabs.query({ active: true, currentWindow: true }).then(tabs => {
          const tab = tabs[0];
          if (!tab) return;

          if (command === "myArchive") {
            myArchive({ linkUrl: tab.url }, tab);
          } else if (command === "mySearch") {
            mySearch({ linkUrl: tab.url }, tab);
          }
        });
      });
    }
  } else {
    // Android: handle extension icon click by injecting selection detection
    browserAPI.browserAction.onClicked.addListener((tab) => {
      browserAPI.tabs.executeScript(tab.id, {
        code: `(${function() {
          function findSelectedLink() {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) return null;
            const range = selection.getRangeAt(0);
            let node = range.startContainer;
            while (node) {
              if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A' && node.href) {
                return node.href;
              }
              node = node.parentNode;
            }
            return null;
          }
          const url = findSelectedLink() || location.href;
          browser.runtime.sendMessage({ type: 'archiveUrl', url });
        }} )();`
      });
    });

    // Listen for message from injected script on Android
    browserAPI.runtime.onMessage.addListener((message, sender) => {
      if (message && message.type === 'archiveUrl' && message.url) {
        doArchivePage(message.url, true);
      }
    });
  }

  // browserAction.onClicked listener for desktop and Android handled above
  if (!isAndroid) {
    browserAPI.browserAction.onClicked.addListener(tab => {
      browserAPI.storage.local.get({ activateButtonNew: true }, result => {
        console.log('activateButtonNew: ' + result.activateButtonNew);
        doArchivePage(tab.url, result.activateButtonNew);
      });
    });
  }
});

browserAPI.runtime.onInstalled.addListener(details => {
  switch (details.reason) {
    case browserAPI.runtime.OnInstalledReason.UPDATE:
      browserAPI.permissions.contains({ permissions: ['notifications'] }, enabled => {
        if (enabled) {
          browserAPI.notifications.create({
            type: 'basic',
            iconUrl: 'images/Share2Archive-48.png',
            title: 'Archive Page extension',
            priority: 0,
            message: 'Updated.\nSee Options to customize.'
          });
          browserAPI.runtime.openOptionsPage();
        }
      });
      break;
    case browserAPI.runtime.OnInstalledReason.INSTALL:
      browserAPI.runtime.openOptionsPage();
      break;
  }
});
