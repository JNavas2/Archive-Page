/*
// Archive Page extension for Mozilla Firefox for use with Archive Today
// © 2026 John Navas, All Rights Reserved
// 1. Toolbar icon to send current tab to Archive in new tab
// 2. Page context menu to search Archive for the page URL
// 3. Link context menu items to Archive or Search with Archive
// Option to open in adjacent tab, tab at end, or current tab (archive only)
// Options to control activation of new Archive tabs (Archive & Search)
// Option to select the domain, .today or an alias
// For Firefox, options saved in local, not sync!
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;
let IS_ANDROID = false;

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
    const settings = await getSettings({ tabCtl: "adjacent", archiveTld: "today" });
    const urls = getArchiveUrls(settings.archiveTld);
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

    if (settings.tabCtl === "end") {
      await browserAPI.tabs.create({ url: urls.archive + encodeURIComponent(uri), index: 999, active: activate });
    } else if (settings.tabCtl === "active") {
      await browserAPI.tabs.update(tabs[0].id, { url: urls.archive + encodeURIComponent(uri) });
    } else {
      await browserAPI.tabs.create({ url: urls.archive + encodeURIComponent(uri), index: tabs[0].index + 1, active: activate });
    }
  } catch (e) { console.error("Archive failed:", e); }
}

async function doSearchPage(uri, activate) {
  try {
    const settings = await getSettings({ tabCtl: "adjacent", archiveTld: "today" });
    const urls = getArchiveUrls(settings.archiveTld);
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const idx = settings.tabCtl === "end" ? 999 : tabs[0].index + 1;
    await browserAPI.tabs.create({ url: urls.search + encodeURIComponent(uri), index: idx, active: activate });
  } catch (e) { console.error("Search failed:", e); }
}

async function updateUI() {
  if (IS_ANDROID) return;
  const s = await getSettings({ toolbarAction: "menu" });
  browserAPI.browserAction.setPopup({ popup: s.toolbarAction === "menu" ? "dropdown.html" : "" });
  await browserAPI.contextMenus.removeAll();
  if (s.toolbarAction === "archive") browserAPI.contextMenus.create({ id: "searchPage", title: "Search archive for page", contexts: ["page"] });
  browserAPI.contextMenus.create({ id: "searchLink", title: "Search link", contexts: ["link"] });
  browserAPI.contextMenus.create({ id: "archiveLink", title: "Archive link", contexts: ["link"] });
}

async function saveActiveTabUrl() {
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    let url = tabs[0].url;

    if (url.startsWith('moz-extension://') || url.startsWith('about:')) {
      const all = await browserAPI.tabs.query({ currentWindow: true });
      url = all.find(t => t.url && /^https?:\/\//i.test(t.url))?.url || url;
    }

    await browserAPI.storage.local.set({ savedActiveUrl: url });
  }
}

browserAPI.runtime.getPlatformInfo().then(async info => {
  IS_ANDROID = (info.os === "android");

  if (IS_ANDROID) {
    browserAPI.browserAction.setPopup({ popup: "" });

    browserAPI.browserAction.onClicked.addListener(async () => {
      await saveActiveTabUrl();
      browserAPI.tabs.create({ url: browserAPI.runtime.getURL("android_action_tab.html") });
    });

  } else {
    updateUI();

    browserAPI.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.toolbarAction) {
        updateUI();
      }
    });

    browserAPI.browserAction.onClicked.addListener(async t => {
      const s = await getSettings({ toolbarAction: "menu", activateButtonNew: true });
      if (s.toolbarAction !== "menu") {
        s.toolbarAction === "archive" ? doArchivePage(t.url, s.activateButtonNew)
          : doSearchPage(t.url, s.activateButtonNew);
      }
    });

    if (browserAPI.commands) {
      browserAPI.commands.onCommand.addListener(async c => {
        const t = (await browserAPI.tabs.query({ active: true, currentWindow: true }))[0];
        if (t) c === "myArchive" ? doArchivePage(t.url, true) : doSearchPage(t.url, true);
      });
    }

    browserAPI.contextMenus.onClicked.addListener(async (i, t) => {
      const s = await getSettings({ activateArchiveNew: true, activateSearchNew: true, activatePageNew: true });
      if (i.menuItemId === "archiveLink") doArchivePage(i.linkUrl, s.activateArchiveNew);
      else if (i.menuItemId === "searchLink") doSearchPage(i.linkUrl, s.activateSearchNew);
      else if (i.menuItemId === "searchPage") doSearchPage(t.url, s.activatePageNew);
    });
  }
});

browserAPI.runtime.onMessage.addListener((message, sender) => {
  if (!message || !message.action) return;

  if (message.action === "archive") {
    if (IS_ANDROID) {
      browserAPI.storage.local.get(["savedActiveUrl", "cbArchiveNew"], result => {
        const act = (result.cbArchiveNew !== undefined) ? result.cbArchiveNew : true;
        if (result.savedActiveUrl) doArchivePage(result.savedActiveUrl, act);
      });
    } else {
      browserAPI.tabs.query({ active: true, currentWindow: true }).then(async tabs => {
        if (tabs[0] && tabs[0].url) {
          const s = await getSettings({ cbArchiveNew: true });
          doArchivePage(tabs[0].url, s.cbArchiveNew);
        }
      });
    }
  }

  else if (message.action === "search") {
    if (IS_ANDROID) {
      browserAPI.storage.local.get(["savedActiveUrl", "cbSearchNew"], result => {
        const act = (result.cbSearchNew !== undefined) ? result.cbSearchNew : true;
        if (result.savedActiveUrl) doSearchPage(result.savedActiveUrl, act);
      });
    } else {
      browserAPI.tabs.query({ active: true, currentWindow: true }).then(async tabs => {
        if (tabs[0] && tabs[0].url) {
          const s = await getSettings({ cbSearchNew: true });
          doSearchPage(tabs[0].url, s.cbSearchNew);
        }
      });
    }
  }

  else if (message.action === "options") {
    browserAPI.tabs.create({ url: browserAPI.runtime.getURL("options.html") });
  }
});

// FIXED: Only show Welcome page on fresh install OR version ending in ".0"
// Prevents up-boarding on browser updates or minor patch releases.
browserAPI.runtime.onInstalled.addListener((details) => {
  const currentVersion = browserAPI.runtime.getManifest().version;

  if (details.reason === "install") {
    showWelcome();
  } else if (details.reason === "update") {
    // Only show for major releases (e.g., "1.5.0")
    if (currentVersion.endsWith('.0')) {
      showWelcome();
    }
  }
});

function showWelcome() {
  setTimeout(() => {
    browserAPI.tabs.create({ url: browserAPI.runtime.getURL("welcome.html") });
  }, 200);
}