---
layout: post
title: "CVE-2022-39181: GLPI Reports Plugin - Reflected Cross-Site Scripting (XSS)"
date: 2022-11-14
cve: "CVE-2022-39181"
severity: "Medium"
cvss: "TBD"
affected: "GLPI Reports Plugin"
---

GLPI is an open-source IT asset management and helpdesk platform used by enterprises to manage IT infrastructure, track assets, and handle support tickets. The Reports plugin extends GLPI with additional reporting and analytics capabilities.

## Vulnerability Details

**CWE-79: Improper Neutralization of Input During Web Page Generation (Reflected XSS)**

A Reflected Cross-Site Scripting vulnerability was identified in the Reports plugin for GLPI. The application fails to properly sanitize user-supplied input before reflecting it in the page, allowing an attacker to inject arbitrary JavaScript that executes in the context of a victim's browser session.

## Impact

- **Session hijacking** - An attacker can steal the victim's session cookie and gain access to the GLPI platform
- **IT infrastructure exposure** - GLPI manages IT assets, tickets, and configurations - a compromised session exposes the entire IT inventory
- **Privilege escalation** - If an admin is targeted, the attacker gains administrative access to the asset management platform
- **Data exfiltration** - Injected scripts can extract asset data, user information, and configuration details from the GLPI interface

## Advisory

- **ILVN-ID:** ILVN-2022-0062
- **CVE-ID:** CVE-2022-39181
- **Affected Products:** GLPI Reports Plugin
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2022-39181 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-39181)
