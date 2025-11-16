// options.js - Archive Page options logic for Firefox/Chrome
// © 2025 John Navas, All Rights Reserved.

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

const elements = {
  tabAdj: document.getElementById("tabAdj"),
  tabEnd: document.getElementById("tabEnd"),
  tabAct: document.getElementById("tabAct"),
  cbButtonNew: document.getElementById("cbButtonNew"),
  cbPageNew: document.getElementById("cbPageNew"),
  cbArchiveNew: document.getElementById("cbArchiveNew"),
  cbSearchNew: document.getElementById("cbSearchNew"),
  cbNotify: document.getElementById("cbNotify")
};

async function restoreOptions() {
  const result = await browserAPI.storage.local.get({
    tabOption: "tabAdj",
    archiveTld: "today",
    activateButtonNew: true,
    activatePageNew: true,
    activateArchiveNew: true,
    activateSearchNew: true,
    notify: false
  });

  elements.tabAdj.checked = result.tabOption === "tabAdj";
  elements.tabEnd.checked = result.tabOption === "tabEnd";
  elements.tabAct.checked = result.tabOption === "tabAct";

  const tlds = ["today", "is", "ph", "md", "vn", "li", "fo"];
  tlds.forEach(tld => {
    const el = document.getElementById("tld" + tld.charAt(0).toUpperCase() + tld.slice(1));
    if (el) el.checked = result.archiveTld === tld;
  });

  elements.cbButtonNew.checked = !!result.activateButtonNew;
  elements.cbPageNew.checked = !!result.activatePageNew;
  elements.cbArchiveNew.checked = !!result.activateArchiveNew;
  elements.cbSearchNew.checked = !!result.activateSearchNew;
  elements.cbNotify.checked = !!result.notify;
}

async function saveOptions() {
  const tabOption = elements.tabAdj.checked ? "tabAdj" :
                    elements.tabEnd.checked ? "tabEnd" : "tabAct";

  const archiveTld = Array.from(document.querySelectorAll('input[name="archiveTld"]'))
                         .find(radio => radio.checked)?.value || "today";

  await browserAPI.storage.local.set({
    tabOption,
    archiveTld,
    activateButtonNew: elements.cbButtonNew.checked,
    activatePageNew: elements.cbPageNew.checked,
    activateArchiveNew: elements.cbArchiveNew.checked,
    activateSearchNew: elements.cbSearchNew.checked,
    notify: elements.cbNotify.checked
  });

  showStatus("Saved!");
}

async function removeOptions() {
  await browserAPI.storage.local.clear();
  showStatus("Options removed!");
  restoreOptions();
}

function showStatus(msg) {
  const status = document.getElementById("status");
  status.textContent = msg;
  setTimeout(() => { status.textContent = ""; }, 2000);
}

function showHelp() {
  window.open("https://github.com/JNavas2/Archive-Page", "_blank");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("bSave").addEventListener("click", saveOptions);
document.getElementById("bRemove").addEventListener("click", removeOptions);
document.getElementById("bHelp").addEventListener("click", showHelp);
