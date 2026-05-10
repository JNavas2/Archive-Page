/*
    android_action_tab.js - Archive Page Extension
    Android action tab for Archive, Search, and Options
    © 2026 John Navas, All Rights Reserved
*/

const browserAPI = browser;  // Firefox-only

async function sendAction(action) {
  try {
    await browserAPI.runtime.sendMessage({ action });
  } catch (e) {
    console.error("Message failed:", e);
  } finally {
    window.close();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('archiveBtn').addEventListener('click', () => sendAction("archive"));
  document.getElementById('searchBtn').addEventListener('click', () => sendAction("search"));
  document.getElementById('optionsBtn').addEventListener('click', () => sendAction("options"));
});
