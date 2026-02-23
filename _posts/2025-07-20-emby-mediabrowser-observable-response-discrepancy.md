---
layout: post
title: "CVE-2025-46390: Emby MediaBrowser — Observable Response Discrepancy"
date: 2025-07-20
cve: "CVE-2025-46390"
severity: "TBD"
cvss: "TBD"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform that allows users to organize, stream, and share their personal media libraries — including movies, TV shows, music, and photos — across a wide range of devices. As a central hub for home media management, Emby handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-204: Observable Response Discrepancy**

An observable response discrepancy vulnerability was identified in Emby MediaBrowser version 4.9.0.35. The application returns distinguishably different responses depending on internal state, which can be leveraged by an attacker to enumerate valid usernames, identify existing resources, or infer other sensitive information about the system's configuration.

- **ILVN-ID:** ILVN-2025-0238
- **CVE-ID:** CVE-2025-46390
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46390 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46390)
