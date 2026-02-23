---
layout: post
title: "CVE-2025-46387: Emby MediaBrowser — Authorization Bypass Through User-Controlled Key"
date: 2025-07-20
cve: "CVE-2025-46387"
severity: "TBD"
cvss: "TBD"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform that allows users to organize, stream, and share their personal media libraries — including movies, TV shows, music, and photos — across a wide range of devices. As a central hub for home media management, Emby handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-639: Authorization Bypass Through User-Controlled Key**

An authorization bypass vulnerability was identified in Emby MediaBrowser version 4.9.0.35. The application uses a user-controlled key (such as a user ID or resource identifier) to determine access rights without proper server-side validation. By manipulating this key, an attacker can bypass authorization checks and access or modify resources belonging to other users — a classic Insecure Direct Object Reference (IDOR) scenario.

- **ILVN-ID:** ILVN-2025-0235
- **CVE-ID:** CVE-2025-46387
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46387 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46387)
