# FAQ (Frequently Asked Questions)

## What happened to the context menu (right click) “Search” action?
The toolbar icon has always been the primary way to use the extension, and it now supports an option for dropdown menu (the default) and direct Search action in addition to the original Archive action. The old context menu “Search” entry was originally a workaround for users who wanted quick access to Search, but the improved toolbar icon now covers that use case more cleanly. To reduce context menu clutter (something most users prefer) the context menu Search item has been removed by default, but the direct Archive item remains, preserving the original behavior for users who prefer it.   
**To restore the old behavior** (direct Archive on the toolbar and “Search” in the context menu) simply change the Toolbar icon setting to “Archive (only)” in extension Options (easily accessed in the toolbar icon dropdown menu).

## Toolbar icon does nothing
**Why does nothing happen when I click the toolbar icon?**
* **The extension was "silently disabled" by a browser update**: When the Archive Page icon is unresponsive, click the Extensions icon in your browser toolbar or Extensions menu, and then click on Archive Page to re-enable it.
* **You are on a blank tab or internal browser page**: If you click on Archive Page when on a blank page or internal browser page, the extension may ask for Action but will then do nothing because there is no web page to archive.

## Firefox Opens New Tab With Endless Spinning Icon
Firefox sends a **blank Referer** on extension‑initiated main_frame navigations to external sites. Chrome and Edge send a non‑empty Referer for the same operation. Because **archive.today recently began rejecting requests with an empty Referer**, Firefox enters an indefinite loading state while Chrome and Edge load the same URL normally.   
A possible workaround exists to inject a fallback Referer. However, adding these permissions mid‑lifecycle causes Firefox to immediately disable the extension and require explicit user approval. This is a significant user‑experience regression and not viable for the extension’s audience.   
Unless and until Firefox changes its Referrer rules, Firefox users will have to live with the **work-around** of **clicking the Location bar and pressing Enter**.   
**Bugzilla**: [2052080 - WebExtension Tabs.Create Opens New Tab Page With Endless Spinning Icon](https://bugzilla.mozilla.org/show_bug.cgi?id=2052080)

## Connection Problems   
When you have trouble connecting to Archive Today, the likely cause is **blocking** by your Internet service.   
Possible work-arounds:
1. **Different Internet service**.
2. **Different DNS resolver**, e.g., [Google Public DNS](https://developers.google.com/speed/public-dns), [Quad9](https://quad9.net), [OpenDNS](https://www.opendns.com/).
3. **VPN**, e.g., [Private Internet Access](https://www.privateinternetaccess.com/), [Surfshark](https://surfshark.com), [Proton VPN](https://protonvpn.com/), [NordVPN](https://nordvpn.com/).   
4. **Alias** of Archive Today. Archive Page now supports selecting an alias (e.g., archive.is) in **Options**.
