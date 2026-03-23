---
layout: post
title: "CVE-2022-22796: SysAid - Unauthenticated Account Takeover via Setup Wizard Abuse"
date: 2022-05-09
cve: "CVE-2022-22796"
severity: "Critical"
cvss: "9.8"
affected: "SysAid"
---

SysAid is a widely used IT service management (ITSM) platform that provides helpdesk, asset management, and IT automation capabilities for organizations.

## Vulnerability Details

**CWE-284: Improper Access Control (Account Takeover)**

The SysAid application exposes internal setup and session management endpoints that are accessible without authentication. By navigating through a specific sequence of pages, an unauthenticated attacker can obtain a full admin session and take over the entire ITSM platform.

## Exploitation

**Step 1 - Access the WMI Wizard**

Navigate to `/WmiWizard.jsp` and click "Continue". This setup wizard page is accessible without any authentication:

<img width="1024" alt="WmiWizard.jsp accessible without authentication" src="/assets/images/Sysaid-CVE-2022-22796-1.jpeg" />

*The WMI Wizard setup page at `/WmiWizard.jsp` - accessible to anyone without credentials. Clicking "Continue" initiates a session.*

**Step 2 - Hijack the concurrent session**

Navigate to `/ConcurrentLogin.jsp` and click "Log in". This page handles concurrent session management and grants the attacker access to an existing admin session:

<img width="1024" alt="ConcurrentLogin.jsp granting session access" src="/assets/images/Sysaid-CVE-2022-22796-2.jpeg" />

*The Concurrent Login page at `/ConcurrentLogin.jsp` - clicking "Log in" takes over the active admin session.*

**Step 3 - Full admin access**

Navigate to `/Home.jsp` and receive a full admin session as "Guest" with complete administrative privileges:

<img width="1024" alt="Full admin dashboard accessible as Guest" src="/assets/images/Sysaid-CVE-2022-22796-3.jpeg" />

*The SysAid admin dashboard at `/Home.jsp` - full access to the support center, asset management (426 items), and all administrative functions. No credentials were entered at any point.*

Three page visits. Zero credentials. Full admin access to the company's entire IT service management platform.

## Impact

- **Complete ITSM takeover** - Full admin access to helpdesk, assets, and IT automation
- **Asset inventory exposure** - All company assets (devices, servers, software) are visible and modifiable
- **Ticket data access** - Support tickets containing sensitive information, internal communications, and incident reports are exposed
- **IT infrastructure control** - Admin access enables modifying IT automation rules, deploying agents, and controlling managed devices
- **Zero authentication** - The entire attack requires no credentials whatsoever

## Advisory

- **ILVN-ID:** ILVN-2022-0017
- **CVE-ID:** CVE-2022-22796
- **Affected Products:** SysAid
- **Credit:** Moriel Harush
- **Solution:** Update to 21.1.30 cloud version, or to 21.4.45 on premise version

## References

- [CVE-2022-22796 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-22796)
