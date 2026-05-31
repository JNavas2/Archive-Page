/*
  options.js - Archive Page Extension Options Logic
  Handles auto-saving, default values, and tab management.
  © 2026 John Navas, All Rights Reserved
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

const MAP = {
  cb: [
    { k: 'cbButtonNew', i: 'cbButtonNew' },
    { k: 'cbPageNew', i: 'cbPageNew' },
    { k: 'cbArchiveNew', i: 'cbArchiveNew' },
    { k: 'cbSearchNew', i: 'cbSearchNew' }
  ],
  rd: [
    { k: 'archiveTld', n: 'archiveTld' },
    { k: 'toolbarAction', n: 'toolbarAction' }
  ],
  tab: { 'tabAdj': 'adjacent', 'tabEnd': 'end', 'tabAct': 'active' }
};

async function restoreOptions() {
  const items = await browserAPI.storage.local.get({
    archiveTld: 'today',
    toolbarAction: 'menu',
    tabCtl: 'adjacent',
    cbButtonNew: true,
    cbPageNew: true,
    cbArchiveNew: true,
    cbSearchNew: true
  });
  const info = await browserAPI.runtime.getPlatformInfo();
  const isAndroid = info.os === "android";
  if (isAndroid) {
    ['sectionToolbarAction', 'sectionOpenIn', 'sectionActivate'].forEach(id => {
      const s = document.getElementById(id);
      if (s) {
        s.classList.add('disabled-section');
        s.querySelectorAll('input').forEach(i => i.disabled = true);
      }
    });
  }
  // Restore Checkboxes
  MAP.cb.forEach(c => {
    const e = document.getElementById(c.i);
    if (e) e.checked = items[c.k];
  });
  // Restore Radio Buttons
  MAP.rd.forEach(r => {
    if (isAndroid && r.k === 'toolbarAction') return;
    const e = document.querySelector(`input[name="${r.n}"][value="${items[r.k]}"]`);
    if (e) e.checked = true;
  });
  // Restore Tab Control
  const tId = Object.keys(MAP.tab).find(k => MAP.tab[k] === items.tabCtl);
  if (tId) document.getElementById(tId).checked = true;
}

async function saveOptions() {
  const s = {};
  MAP.cb.forEach(c => { const e = document.getElementById(c.i); if (e && !e.disabled) s[c.k] = e.checked; });
  MAP.rd.forEach(r => { const e = document.querySelector(`input[name="${r.n}"]:checked`); if (e && !e.disabled) s[r.k] = e.value; });
  const t = document.querySelector('input[name="tabCtl"]:checked');
  if (t && !t.disabled) s.tabCtl = MAP.tab[t.id] || 'adjacent';
  await browserAPI.storage.local.set(s);
  const st = document.getElementById('status');
  st.textContent = 'Saved';
  setTimeout(() => st.textContent = '', 750);
}

document.addEventListener('DOMContentLoaded', async () => {
  await restoreOptions();

  // Platform Detection for Buttons
  const info = await browserAPI.runtime.getPlatformInfo();
  const isAndroid = info.os === "android";

  function openUrlFirefox(url) {
    if (isAndroid) {
      window.open(url, "_blank");
    } else {
      browserAPI.tabs.create({ url });
    }
  }

  function closeWindowFirefox() {
    if (isAndroid) {
      window.close();
    } else {
      browserAPI.tabs.getCurrent(tab => {
        if (tab) browserAPI.tabs.remove(tab.id);
        else window.close();
      });
    }
  }

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', saveOptions);
  });

  // Action Buttons
  document.getElementById('bClose').addEventListener('click', closeWindowFirefox);

  document.getElementById('bRemove').addEventListener('click', () => {
    browserAPI.management.uninstallSelf({ showConfirmDialog: true });
  });

  document.getElementById('bHelp').addEventListener('click', () =>
    openUrlFirefox("https://github.com/JNavas2/Archive-Page")
  );

  document.getElementById('bReview').addEventListener('click', () =>
    openUrlFirefox("https://addons.mozilla.org/en-US/firefox/addon/archive-page/")
  );

  document.getElementById('bIssue').addEventListener('click', () =>
    openUrlFirefox("https://github.com/JNavas2/Archive-Page/issues")
  );

  document.getElementById('bSuggest').addEventListener('click', () =>
    openUrlFirefox("https://github.com/JNavas2/Archive-Page/discussions")
  );
});