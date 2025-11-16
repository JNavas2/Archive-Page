// Archive Page extension for Mozilla Firefox for use with archive.today
// © 2025 John Navas, All Rights Reserved
// 1. Toolbar icon to send current tab to Archive in new tab
// 2. Page context menu to search Archive for the page URL
// 3. Link context menu items to Archive or Search with Archive
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new Archive tabs (Archive & Search)
// Option to select the domain, .today or an alias
// For Firefox, options saved in local, not sync!

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

function getArchiveUrls(tld = 'today') {
  const base = `https://archive.${tld}`;
  return {
    archive: `${base}/?run=1&url=`,
    search: `${base}/search/?q=`
  };
}

async function getSettings(defaults) {
  return new Promise(resolve => {
    browserAPI.storage.local.get(defaults, resolve);
  });
}

async function doArchivePage(uri, activate) {
  try {
    const settings = await getSettings({ tabOption: "tabAdj", archiveTld: "today" });
    const urls = getArchiveUrls(settings.archiveTld);
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

    switch (settings.tabOption) {
      case "tabEnd":
        await browserAPI.tabs.create({ url: urls.archive + encodeURIComponent(uri), index: 999, active: activate });
        break;
      case "tabAct":
        await browserAPI.tabs.update(tabs[0].id, { url: urls.archive + encodeURIComponent(uri) });
        break;
      default: // tabAdj
        await browserAPI.tabs.create({ url: urls.archive + encodeURIComponent(uri), index: tabs[0].index + 1, active: activate });
    }
  } catch (e) {
    console.error("Failed to archive page:", e);
  }
}

async function doSearchPage(uri, activate) {
  try {
    const settings = await getSettings({ tabOption: "tabAdj", archiveTld: "today" });
    const urls = getArchiveUrls(settings.archiveTld);
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

    switch (settings.tabOption) {
      case "tabEnd":
        await browserAPI.tabs.create({ url: urls.search + encodeURIComponent(uri), index: 999, active: activate });
        break;
      case "tabAct":
      default: // tabAdj
        await browserAPI.tabs.create({ url: urls.search + encodeURIComponent(uri), index: tabs[0].index + 1, active: activate });
    }
  } catch (e) {
    console.error("Failed to search archive:", e);
  }
}

async function myArchive(info, tab) {
  const settings = await getSettings({ activateArchiveNew: false });
  await doArchivePage(info.linkUrl, settings.activateArchiveNew);
}

async function mySearch(info, tab) {
  if (info.linkUrl) {
    const settings = await getSettings({ activateSearchNew: true });
    await doSearchPage(info.linkUrl, settings.activateSearchNew);
  } else {
    const settings = await getSettings({ activatePageNew: true });
    await doSearchPage(tab.url, settings.activatePageNew);
  }
}

async function saveActiveTabUrl() {
  try {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      let url = tabs[0].url;
      if (url.startsWith('moz-extension://') || url.startsWith('about:')) {
        const allTabs = await browserAPI.tabs.query({ currentWindow: true });
        const candidate = allTabs.find(t => t.url && /^https?:\/\//i.test(t.url));
        if (candidate) url = candidate.url;
      }
      await browserAPI.storage.local.set({ savedActiveUrl: url });
    }
  } catch (e) {
    console.error("Failed to save active tab URL:", e);
  }
}

browserAPI.runtime.getPlatformInfo().then(async info => {
  const isAndroid = info.os === "android";

  if (!isAndroid) {
    await browserAPI.contextMenus.removeAll();

    browserAPI.contextMenus.create({
      title: "Search archive for page",
      contexts: ["page"],
      onclick: mySearch
    });

    browserAPI.contextMenus.create({
      title: "Archive link",
      contexts: ["link"],
      onclick: myArchive
    });

    browserAPI.contextMenus.create({
      title: "Search link",
      contexts: ["link"],
      onclick: mySearch
    });

    if (browserAPI.commands && browserAPI.commands.onCommand) {
      browserAPI.commands.onCommand.addListener(async command => {
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (!tab) return;

        if (command === "myArchive") {
          myArchive({ linkUrl: tab.url }, tab);
        } else if (command === "mySearch") {
          mySearch({ linkUrl: tab.url }, tab);
        }
      });
    }

    browserAPI.browserAction.onClicked.addListener(async tab => {
      try {
        const settings = await getSettings({ activateButtonNew: true });
        doArchivePage(tab.url, settings.activateButtonNew);
      } catch (e) {
        console.error("Failed to handle toolbar button click:", e);
      }
    });

  } else {
    // Android: save active tab URL before opening popup tab
    browserAPI.browserAction.onClicked.addListener(async () => {
      try {
        await saveActiveTabUrl();
        const popupUrl = browserAPI.runtime.getURL("popup.html");
        await browserAPI.tabs.create({ url: popupUrl });
      } catch (e) {
        console.error("Failed to open popup tab on Android:", e);
      }
    });
  }
});

browserAPI.runtime.onMessage.addListener((message, sender) => {
  if (message && message.action && message.url) {
    if (message.action === "archive") {
      doArchivePage(message.url, true);
    } else if (message.action === "search") {
      doSearchPage(message.url, true);
    }
  }
});

browserAPI.runtime.onInstalled.addListener(details => {
  switch (details.reason) {
    case browserAPI.runtime.OnInstalledReason.UPDATE:
      browserAPI.permissions.contains({ permissions: ['notifications'] }, enabled => {
        if (enabled) {
          browserAPI.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon-48.png',
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
