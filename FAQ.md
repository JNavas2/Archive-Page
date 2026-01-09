# FAQ (Frequently Asked Questions)

## What happened to the context menu (right click) “Search” action?
The toolbar button has always been the primary way to use the extension, and it now supports a dropdown menu (the default) and a direct Search action. The old context‑menu “Search” entry was originally a workaround for users who wanted quick access to Search, but the improved toolbar button now covers that use case more cleanly. To reduce context‑menu clutter (something most users prefer) the context‑menu Search item has been removed by default, but the direct Archive item remains, preserving the original behavior for users who prefer it.   
**To restore the old behavior** (direct Archive on the toolbar and “Search” in the context menu) simply change the toolbar button setting to “Archive” in Options. That restores the classic split: toolbar Archive, context menu Search.

## Toolbar icon does nothing
**Why does nothing happen when I click the toolbar icon?**
* **The extension was "silently disabled" by a browser update**: When the Archive Page icon is unresponsive, click the Extensions icon in your browser toolbar or Extensions menu, and then click on Archive Page to re-enable it.
* **You are on a blank tab or internal browser page**: If you click on Archive Page when on a blank page or internal browser page, the extension may ask for Action but will then do nothing because there is no web page to archive.

## Chrome "Action Required" / Permissions
**Why does the extension now ask for permission to access all websites?** Due to a documented regression in Chrome's update logic ([Chromium Issue 472803133](https://issues.chromium.org/issues/472803133)), extensions using the `activeTab` permission are being "silently killed" (automatically disabled) during updates, even when permissions remain static. To prevent this, the extension moved to **Optional Host Permissions**. There is currently no lower-permission option or alternative workaround that prevents this automatic disabling while still allowing the extension to access the page URL when requested by the user. This permission only needs to be granted **once** via the "Action Required" bridge page.

## Connection Problems   
When you have trouble connecting to Archive Today, the likely cause is **blocking** by your Internet service.   
Possible work-arounds:
1. **Different Internet service**.
2. **Different DNS resolver**, e.g., [Google Public DNS](https://developers.google.com/speed/public-dns), [Quad9](https://quad9.net), [OpenDNS](https://www.opendns.com/).
3. **VPN**, e.g., [Private Internet Access](https://www.privateinternetaccess.com/), [Surfshark](https://surfshark.com), [Proton VPN](https://protonvpn.com/), [NordVPN](https://nordvpn.com/).   
4. **Alias** of Archive Today. Archive Page now supports selecting an alias (e.g., archive.is) in **Options**.
