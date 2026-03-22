---
layout: post
title: "CVE-2024-45247: Sonarr - Open Redirect via returnUrl Parameter"
date: 2024-10-01
cve: "CVE-2024-45247"
severity: "Medium"
cvss: "TBD"
affected: "Sonarr before version 4.0.9.2244"
---

Sonarr is a popular open-source PVR (Personal Video Recorder) application used to automate downloading and managing TV series. It is widely deployed on home servers, NAS devices, and media management setups.

## Vulnerability Details

**CWE-601: URL Redirection to Untrusted Site (Open Redirect)**

The login page in Sonarr accepts a `returnUrl` parameter that controls where the user is redirected after authentication. This parameter is not validated, allowing an attacker to craft a login URL that redirects users to any external site after they enter their credentials.

```
/login?returnUrl=https://google.com
```

<img width="1024" alt="Open redirect via returnUrl parameter in Sonarr login" src="/assets/images/SonarOpenRedirect.png" />

*The login request with a manipulated `returnUrl` parameter - after authentication the server redirects the user to the attacker-controlled URL.*

An attacker sends a victim a link to their legitimate Sonarr instance with a crafted `returnUrl`. The victim sees the real Sonarr login page, enters their credentials, and gets seamlessly redirected to a phishing site or malicious page.

## Impact

- **Phishing** - The victim trusts the legitimate login page and has no reason to suspect the redirect destination
- **Credential harvesting** - The attacker's site can present a fake "session expired" page to capture credentials a second time
- **Post-auth exploitation** - Since the redirect happens after login, the victim is already authenticated and may trust the destination more

## Advisory

- **ILVN-ID:** ILVN-2024-0199
- **CVE-ID:** CVE-2024-45247
- **Affected Products:** Sonarr before version 4.0.9.2244
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 4.0.9.2244 or higher

## References

- [CVE-2024-45247 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-45247)
