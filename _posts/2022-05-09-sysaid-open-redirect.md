---
layout: post
title: "CVE-2022-22797: SysAid - Open Redirect via redirectURL Parameter"
date: 2022-05-09
cve: "CVE-2022-22797"
severity: "Medium"
cvss: "6.1"
affected: "SysAid"
---

SysAid is a widely used IT service management (ITSM) platform that provides helpdesk, asset management, and IT automation capabilities for organizations.

## Vulnerability Details

**CWE-601: URL Redirection to Untrusted Site (Open Redirect)**

The `redirectURL` parameter in SysAid is vulnerable to open redirect. The application does not validate the redirect destination, allowing an attacker to craft a URL that redirects users to any external site.

```
?redirectURL=https://google.com
```

<img width="1024" alt="Open redirect via redirectURL parameter" src="/assets/images/Sysaid-CVE-2022-22797.png" />

*The request with a manipulated `redirectURL` parameter - the server follows the redirect to the attacker-controlled URL.*

## Impact

- **Phishing** - An attacker crafts a link on the trusted SysAid domain that redirects to a fake login page
- **Credential harvesting** - Users trust the legitimate ITSM domain and enter credentials on the phishing destination
- **IT staff targeting** - SysAid is used by IT teams, making this a high-value phishing vector for targeting IT administrators

## Advisory

- **ILVN-ID:** ILVN-2022-0018
- **CVE-ID:** CVE-2022-22797
- **Affected Products:** SysAid
- **Credit:** Moriel Harush
- **Solution:** Update to 22.1.50 cloud version, or to 22.1.64 on premise version

## References

- [CVE-2022-22797 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-22797)
