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
let IS_ANDROID = false;

const getUrls = (tld = 'today') => ({
  archive: `https://archive.${tld}/?run=1&url=`,
  search: `https://archive.${tld}/search/?q=`
});

const getSet = async (d) => new Promise(r => browserAPI.storage.local.get(d, r));

async function updateUI() {
  if (IS_ANDROID) return;
  const s = await getSet({ toolbarAction: "menu" });
  browserAPI.browserAction.setPopup({ popup: s.toolbarAction === "menu" ? "dropdown.html" : "" });
  await browserAPI.contextMenus.removeAll();
  if (s.toolbarAction === "archive") browserAPI.contextMenus.create({ id: "searchPage", title: "Search archive for page", contexts: ["page"] });
  browserAPI.contextMenus.create({ id: "archiveLink", title: "Archive link", contexts: ["link"] });
  browserAPI.contextMenus.create({ id: "searchLink", title: "Search link", contexts: ["link"] });
}

async function doAction(uri, act, type) {
  try {
    // Default tabCtl corrected to 'adjacent' to match options.js
    const s = await getSet({ tabCtl: "adjacent", archiveTld: "today" });
    const u = getUrls(s.archiveTld)[type];
    const url = u + encodeURIComponent(uri);
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });

    // Handle 'active' for archive
    if (type === 'archive' && s.tabCtl === 'active') return browserAPI.tabs.update(tabs[0].id, { url });

    // Handle 'end' vs 'adjacent' positioning
    const idx = s.tabCtl === 'end' ? 999 : tabs[0].index + 1; // 999 correctly clamps to the end in Firefox

    await browserAPI.tabs.create({ url, index: idx, active: act });
  } catch (e) { console.error(`Archive Page ${type} failed:`, e); }
}

browserAPI.contextMenus.onClicked.addListener((i, t) => {
  if (i.menuItemId === "archiveLink") myArchive(i);
  else mySearch(i, t);
});

// Activate options standardized to true (match options.html defaults)
const myArchive = async (i) => doAction(i.linkUrl, (await getSet({ cbArchiveNew: true })).cbArchiveNew, 'archive');
const mySearch = async (i, t) => {
  const k = i.linkUrl ? "cbSearchNew" : "cbPageNew";
  doAction(i.linkUrl || t.url, (await getSet({ [k]: true }))[k], 'search');
};

async function saveUrl() {
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]) return;
  let url = tabs[0].url;
  if (url.startsWith('moz-extension://') || url.startsWith('about:')) {
    const all = await browserAPI.tabs.query({ currentWindow: true });
    url = all.find(t => t.url && /^https?:\/\//i.test(t.url))?.url || url;
  }
  await browserAPI.storage.local.set({ savedActiveUrl: url });
}

browserAPI.runtime.getPlatformInfo().then(async info => {
  IS_ANDROID = info.os === "android";
  if (!IS_ANDROID) {
    updateUI();
    browserAPI.browserAction.onClicked.addListener(async t => {
      const s = await getSet({ toolbarAction: "menu", cbButtonNew: true });
      if (s.toolbarAction !== "menu") doAction(t.url, s.cbButtonNew, s.toolbarAction);
    });
    if (browserAPI.commands) browserAPI.commands.onCommand.addListener(async c => {
      const t = (await browserAPI.tabs.query({ active: true, currentWindow: true }))[0];
      if (t) c === "myArchive" ? myArchive({ linkUrl: t.url }) : mySearch({ linkUrl: t.url }, t);
    });
  } else browserAPI.browserAction.onClicked.addListener(async () => { await saveUrl(); browserAPI.tabs.create({ url: browserAPI.runtime.getURL("popup.html") }); });
});

browserAPI.storage.onChanged.addListener((c, a) => { if (a === "local" && c.toolbarAction) updateUI(); });

browserAPI.runtime.onMessage.addListener(m => {
  if (!m.action) return;
  browserAPI.tabs.query({ active: true, currentWindow: true }).then(async tabs => {
    const url = m.url || tabs[0]?.url; if (!url) return;
    const act = IS_ANDROID || (await getSet({ cbButtonNew: true })).cbButtonNew;
    doAction(url, act, m.action.toLowerCase().includes("search") ? "search" : "archive");
  });
});

browserAPI.runtime.onInstalled.addListener((d) => {
  setTimeout(async () => {
    if (d.reason === "update") {
      const e = await new Promise(r => browserAPI.permissions.contains({ permissions: ['notifications'] }, r));
      if (e) browserAPI.notifications.create({ type: 'basic', iconUrl: 'images/icon-48.png', title: 'Archive Page', message: 'Updated.' });
    }
    try { await browserAPI.runtime.openOptionsPage(); } catch (e) { browserAPI.tabs.create({ url: browserAPI.runtime.getURL("options.html") }); }
  }, 200);
});