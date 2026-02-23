---
layout: post
title: "CVE-2025-46389: Emby MediaBrowser — Unverified Password Change"
date: 2025-07-20
cve: "CVE-2025-46389"
severity: "TBD"
cvss: "TBD"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform that allows users to organize, stream, and share their personal media libraries — including movies, TV shows, music, and photos — across a wide range of devices. As a central hub for home media management, Emby handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-620: Unverified Password Change**

An unverified password change vulnerability was identified in Emby MediaBrowser version 4.9.0.35. The application allows password changes without adequately verifying the identity of the requesting user, such as requiring the current password. This could enable an attacker who has gained temporary access to a session to permanently take over an account by resetting its credentials.

- **ILVN-ID:** ILVN-2025-0237
- **CVE-ID:** CVE-2025-46389
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46389 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46389)
