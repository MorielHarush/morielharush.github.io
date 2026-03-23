---
layout: post
title: "CVE-2022-39178: WebVendome - Internal Server IP Disclosure"
date: 2022-11-13
cve: "CVE-2022-39178"
severity: "Medium"
cvss: "5.3"
affected: "WebVendome"
---

WebVendome is a web-based document management and business process platform.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor**

The WebVendome application discloses the internal server IP address in the response to a standard GET request. The private IP is visible in the page source, leaking internal network information to any user.

<img width="1024" alt="Response containing internal server IP address" src="/assets/images/WebVendome-CVE-2022-39178.png" />

*The server response contains the internal private IP address embedded in the page - visible to anyone accessing the application.*

## Impact

- **Internal network reconnaissance** - The leaked private IP reveals the server's position in the internal network
- **Attack planning** - Knowledge of internal IP ranges helps an attacker plan lateral movement and target other systems
- **Bypassing protections** - Internal IPs can be used in SSRF attacks or to bypass IP-based access controls

## Advisory

- **ILVN-ID:** ILVN-2022-0059
- **CVE-ID:** CVE-2022-39178
- **Affected Products:** WebVendome
- **Credit:** Moriel Harush
- **Solution:** Update to the latest version

## References

- [CVE-2022-39178 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-39178)
