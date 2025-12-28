/*
    options.js - Archive Page Extension Options Logic
    Handles saving and restoring extension configuration.
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
  const items = await browserAPI.storage.local.get();
  const info = await browserAPI.runtime.getPlatformInfo();
  const isAndroid = info.os === "android";

  if (isAndroid) {
    ['sectionToolbarAction', 'sectionOpenIn', 'sectionActivate'].forEach(id => {
      const s = document.getElementById(id);
      if (s) { s.classList.add('disabled-section'); s.querySelectorAll('input').forEach(i => i.disabled = true); }
    });
  }

  MAP.cb.forEach(c => { const e = document.getElementById(c.i); if (e) e.checked = items[c.k] !== undefined ? items[c.k] : true; });
  MAP.rd.forEach(r => {
    if (isAndroid && r.k === 'toolbarAction') return;
    const e = document.querySelector(`input[name="${r.n}"][value="${items[r.k] || 'today'}"]`);
    if (e) e.checked = true;
  });

  const tId = Object.keys(MAP.tab).find(k => MAP.tab[k] === (items.tabCtl || 'adjacent'));
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
  st.textContent = 'Saved'; setTimeout(() => st.textContent = '', 750);
}

async function removeOptions() {
  await browserAPI.storage.local.clear();
  document.getElementById('status').textContent = 'Cleared';
  setTimeout(() => location.reload(), 750);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('bSave').addEventListener('click', saveOptions);
document.getElementById('bRemove').addEventListener('click', removeOptions);
document.getElementById('bHelp').addEventListener('click', () => browserAPI.tabs.create({ url: "https://github.com/JNavas2/Archive-Page/blob/main/README.md" }));