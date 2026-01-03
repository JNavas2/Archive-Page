# FAQ (Frequently Asked Questions)

## Chrome "Action Required" / Permissions
**Why does the extension now ask for permission to access all websites?** Due to a documented regression in Chrome's update logic ([Chromium Issue 472803133](https://issues.chromium.org/issues/472803133)), extensions using the `activeTab` permission are being "silently killed" (automatically disabled) during updates, even when permissions remain static. To prevent this, the extension moved to **Optional Host Permissions**. There is currently no lower-permission option or alternative workaround that prevents this automatic disabling while still allowing the extension to access the page URL when requested by the user. This permission only needs to be granted **once** via the "Action Required" bridge page.

## Connection Problems   
When you have trouble connecting to Archive Today, the likely cause is **blocking** by your Internet service.   
Possible work-arounds:
1. **Different Internet service**.
2. **Different DNS resolver**, e.g., [Google Public DNS](https://developers.google.com/speed/public-dns), [Quad9](https://quad9.net), [OpenDNS](https://www.opendns.com/).
3. **VPN**, e.g., [Private Internet Access](https://www.privateinternetaccess.com/), [Surfshark](https://surfshark.com), [Proton VPN](https://protonvpn.com/), [NordVPN](https://nordvpn.com/).   
4. **Alias** of Archive Today. Archive Page extension now supports selecting an alias (e.g., archive.is) in its **Options**.
