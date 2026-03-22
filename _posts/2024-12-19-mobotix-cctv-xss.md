---
layout: post
title: "CVE-2024-47917: Mobotix CCTV - Cross-Site Scripting (XSS)"
date: 2024-12-19
cve: "CVE-2024-47917"
severity: "High"
cvss: "7.5"
affected: "Mobotix CCTV FW version MX-V3.4.2.16"
---

Mobotix is a manufacturer of IP-based CCTV and surveillance camera systems widely deployed in enterprise and government environments. The web-based management interface allows administrators to configure camera settings, view feeds, and manage access controls.

## Vulnerability Details

**CWE-79: Improper Neutralization of Input During Web Page Generation (Cross-Site Scripting)**

A Reflected XSS vulnerability was identified in the Mobotix CCTV web management interface running firmware version MX-V3.4.2.16. The application fails to properly sanitize user-supplied input before rendering it in the browser, allowing an attacker to inject and execute arbitrary JavaScript in the context of a victim's session.

## Impact

- **Session hijacking** - An attacker can steal the admin's session cookie and gain full access to the camera management interface
- **Camera configuration tampering** - With a hijacked session, an attacker can modify camera settings, disable recording, or alter feed configurations
- **Credential theft** - Injected scripts can capture keystrokes or present fake login forms to harvest admin credentials
- **Surveillance access** - Compromising the management interface of a CCTV system can grant access to live and recorded video feeds

## Advisory

- **ILVN-ID:** ILVN-2024-0210
- **CVE-ID:** CVE-2024-47917
- **Affected Products:** Mobotix CCTV FW version MX-V3.4.2.16
- **Credit:** Moriel Harush
- **Solution:** This firmware version is EOL. Update to the latest firmware version.

## References

- [CVE-2024-47917 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-47917)
