---
layout: post
title: "CVE-2023-23467: Media CP Control Panel - Reflected XSS in Multiple Parameters"
date: 2023-01-23
cve: "CVE-2023-23467"
severity: "High"
cvss: "8.1"
affected: "Media CP Media Control Panel"
---

Media CP is a web-based media hosting control panel used to manage streaming services, media servers, and user accounts.

## Vulnerability Details

**CWE-79: Improper Neutralization of Input During Web Page Generation (Reflected XSS)**

Two parameters in the Media CP application are vulnerable to Reflected Cross-Site Scripting:

1. The `m` parameter
2. The `searchParam` parameter

Both parameters reflect user input into the page without sanitization, allowing an attacker to inject arbitrary JavaScript that executes in the victim's browser context.

**XSS via `searchParam` parameter:**

<img width="1024" alt="XSS via searchParam parameter" src="/assets/images/MediaCP-CVE-2023-23467-1.png" />

*The `searchParam` parameter injected with `<script>alert(1)</script>` - the payload executes and the alert fires in the victim's browser.*

**XSS via `m` parameter:**

<img width="1024" alt="XSS via m parameter" src="/assets/images/MediaCP-CVE-2023-23467-2.png" />

*The `m` parameter injected with the same payload - another successful XSS execution, proving both parameters are vulnerable.*

An attacker crafts a link containing the XSS payload in either parameter. When a logged-in user clicks the link, the script executes with their session privileges.

## Impact

- **Session hijacking** - The attacker steals the victim's `PHPSESSID` cookie and takes over their session
- **Account takeover** - With the session cookie, the attacker has full access to the victim's account
- **Admin compromise** - If an admin clicks the link, the attacker gains administrative access to the entire media platform
- **Chaining** - Combined with the CSRF vulnerability (CVE-2023-23465), an attacker can chain XSS to trigger actions on behalf of the victim

## Advisory

- **ILVN-ID:** ILVN-2023-0084
- **CVE-ID:** CVE-2023-23467
- **Affected Products:** Media CP Media Control Panel
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-23467 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-23467)
