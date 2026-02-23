---
layout: post
title: "CVE-2025-46388: Emby MediaBrowser — Exposure of Sensitive Information to an Unauthorized Actor"
date: 2025-07-20
cve: "CVE-2025-46388"
severity: "TBD"
cvss: "TBD"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform that allows users to organize, stream, and share their personal media libraries — including movies, TV shows, music, and photos — across a wide range of devices. As a central hub for home media management, Emby handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor**

A sensitive information exposure vulnerability was identified in Emby MediaBrowser version 4.9.0.35. The application exposes sensitive data — such as internal configuration details, user metadata, or system information — to actors who are not authorized to access it. This information leakage could assist an attacker in further reconnaissance or escalation of privileges within the environment.

- **ILVN-ID:** ILVN-2025-0236
- **CVE-ID:** CVE-2025-46388
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46388 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46388)
