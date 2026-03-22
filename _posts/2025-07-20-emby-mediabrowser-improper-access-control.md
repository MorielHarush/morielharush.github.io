---
layout: post
title: "CVE-2025-46391: Emby MediaBrowser - Session Token Exposed in URL"
date: 2025-07-20
cve: "CVE-2025-46391"
severity: "Medium"
cvss: "6.5"
affected: "Emby MediaBrowser version 4.9.0.35"
---
<img width="1024" height="752" src="/assets/images/embylogo.jpg" />

Emby is a popular self-hosted media server platform used to organize, stream, and share personal media libraries across devices. It handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-284: Improper Access Control (Session Token in URL)**

Emby MediaBrowser version 4.9.0.35 transmits the session token (`Emby-Token`) directly in the URL as a query parameter instead of in a secure HTTP header.

```
GET /emby/Users/...?X-Emby-Token=<session_token>
```

<img width="1024" alt="Emby session token exposed in the URL" src="/assets/images/sessionsinurlobf.png" />

*The Emby-Token is passed directly in the URL (highlighted), exposing the session token in logs, browser history, and referrer headers.*

Session tokens should never be placed in URLs. This is a well-known security anti-pattern because URLs are stored and leaked in multiple places:

- **Browser history** - Anyone with access to the browser can extract the token
- **Server access logs** - The full URL including the token gets written to web server logs
- **Proxy and CDN logs** - Any intermediate proxy or load balancer logs the token in plain text
- **Referrer headers** - If the user clicks any external link from an Emby page, the full URL (including the token) is sent to the external site via the `Referer` header
- **Shoulder surfing** - The token is visible in the address bar

## Impact

- **Session hijacking** - Anyone who obtains the URL has full access to the user's session
- **Token leakage at rest** - Tokens persist in log files, browser history, and cached pages long after the session should have expired
- **Referrer-based theft** - Clicking any external link from the Emby interface leaks the active session token to the third-party site
- **Chaining potential** - A stolen session token combined with the unverified password change (CVE-2025-46389) gives an attacker permanent account takeover

## Advisory

- **ILVN-ID:** ILVN-2025-0239
- **CVE-ID:** CVE-2025-46391
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46391 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46391)
