/*
    android_action_tab.js - Archive Page Extension
    Android action tab for Archive, Search, and Options
    © 2026 John Navas, All Rights Reserved
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

function sendAction(action) {
  browserAPI.runtime.sendMessage({ action });
  window.close();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('archiveBtn').addEventListener('click', () => sendAction("archive"));
  document.getElementById('searchBtn').addEventListener('click', () => sendAction("search"));
  document.getElementById('optionsBtn').addEventListener('click', () => sendAction("options"));
});