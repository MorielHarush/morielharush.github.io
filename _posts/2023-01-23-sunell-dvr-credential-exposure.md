---
layout: post
title: "CVE-2023-23458: Sunell DVR - Full Credential Exposure Leading to Account Takeover"
date: 2023-01-23
cve: "CVE-2023-23458"
severity: "Medium"
cvss: "6.5"
affected: "Sunell DVR"
---

Sunell is a manufacturer of surveillance and security equipment including DVR (Digital Video Recorder) systems used for CCTV recording and playback in commercial and residential environments.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor**

An API endpoint on the Sunell DVR exposes the complete list of usernames and passwords for all accounts configured on the system. The credentials are returned in the response body in clear text.

<img width="1024" alt="API response exposing all DVR usernames and passwords in clear text" src="/assets/images/Sunell-CVE-2023-23458.jpg" />

*The API response returns every user account on the DVR system - usernames and passwords are fully visible in the response body (highlighted). Complete account takeover with a single request.*

One request. Every credential on the system. No brute-force, no guessing, no exploitation chain - just call the endpoint and the DVR hands over the keys.

## Impact

- **Full account takeover** - Every account on the DVR is compromised in a single request
- **Admin access** - Administrative credentials are included, granting full control over the DVR
- **Surveillance access** - An attacker gains access to live and recorded camera feeds
- **Recording tampering** - With admin access, an attacker can delete, modify, or disable recordings
- **Physical security compromise** - DVR systems are the backbone of physical security monitoring - compromising them undermines the entire surveillance infrastructure

## Advisory

- **ILVN-ID:** ILVN-2022-0075
- **CVE-ID:** CVE-2023-23458
- **Affected Products:** Sunell DVR
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-23458 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-23458)
