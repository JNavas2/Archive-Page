/*
    popup.js - Archive Page Extension
    Popup menu for action on Android (only)
    © 2025 John Navas, All Rights Reserved
*/

const browserAPI = (typeof browser !== "undefined") ? browser : chrome;

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function showError(invalidUrl) {
  const container = document.querySelector('.popup-container');
  if (!container) return;
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.fontWeight = 'bold';
  errorDiv.style.marginBottom = '1em';
  errorDiv.textContent = `Not a valid URL: ${invalidUrl}`;
  container.insertBefore(errorDiv, container.firstChild);
}

async function getSavedUrl() {
  return new Promise(resolve => {
    browserAPI.storage.local.get('savedActiveUrl', (result) => {
      resolve(result.savedActiveUrl || null);
    });
  });
}

async function archive() {
  const url = await getSavedUrl();
  if (url) {
    browserAPI.runtime.sendMessage({ action: "archive", url });
    window.close();
  }
}

async function search() {
  const url = await getSavedUrl();
  if (url) {
    browserAPI.runtime.sendMessage({ action: "search", url });
    window.close();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const archiveBtn = document.getElementById('archiveBtn');
  const searchBtn = document.getElementById('searchBtn');

  archiveBtn.disabled = true;
  searchBtn.disabled = true;

  const url = await getSavedUrl();

  if (!isValidUrl(url)) {
    showError(url || "Unknown URL");
    return;
  }

  archiveBtn.disabled = false;
  searchBtn.disabled = false;

  archiveBtn.addEventListener('click', archive);
  searchBtn.addEventListener('click', search);
});
