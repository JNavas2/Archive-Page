/*
    options.js - Archive Page Extension Options Logic
    Handles auto-saving, default values, and tab management.
    © 2025 John Navas, All Rights Reserved
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

const MAP = {
  cb: [{ k: 'cbButtonNew', i: 'cbButtonNew' }, { k: 'cbPageNew', i: 'cbPageNew' },
  { k: 'cbArchiveNew', i: 'cbArchiveNew' }, { k: 'cbSearchNew', i: 'cbSearchNew' },
  { k: 'cbNotify', i: 'cbNotify' }],
  rd: [{ k: 'archiveTld', n: 'archiveTld' }, { k: 'toolbarAction', n: 'toolbarAction' }],
  tab: { 'tabAdj': 'adjacent', 'tabEnd': 'end', 'tabAct': 'active' }
};

async function restoreOptions() {
  // FIXED: Passing defaults directly to get() ensures first-run values
  const items = await browserAPI.storage.local.get({
    archiveTld: 'today',
    toolbarAction: 'menu',
    tabCtl: 'adjacent',
    cbButtonNew: true,
    cbPageNew: true,
    cbArchiveNew: true,
    cbSearchNew: true,
    cbNotify: false
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

  // Restore Radio Buttons (Default logic now handled by storage.get)
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

async function removeOptions() {
  browserAPI.management.uninstallSelf({ showConfirmDialog: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  await restoreOptions();

  // Attach auto-save to all inputs for immediate saving
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', saveOptions);
  });

  // Close tab logic with Android fallback
  document.getElementById('bClose').addEventListener('click', () => {
    browserAPI.tabs.getCurrent(tab => {
      if (tab) browserAPI.tabs.remove(tab.id);
      else window.close();
    });
  });

  document.getElementById('bRemove').addEventListener('click', removeOptions);
  document.getElementById('bHelp').addEventListener('click', () =>
    browserAPI.tabs.create({ url: "https://github.com/JNavas2/Archive-Page/blob/main/README.md" })
  );
});