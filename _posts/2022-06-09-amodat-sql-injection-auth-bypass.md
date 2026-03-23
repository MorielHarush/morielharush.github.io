---
layout: post
title: "CVE-2022-23168: Amodat Mobile Application Gateway - SQL Injection Authentication Bypass"
date: 2022-06-09
cve: "CVE-2022-23168"
severity: "Critical"
cvss: "9.8"
affected: "Amodat Mobile Application Gateway"
---

Amodat Mobile Application Gateway (MAG) is a mobile workforce management platform used by organizations to manage field operations, employee tasks, and mobile access to enterprise systems.

## Vulnerability Details

**CWE-89: Improper Neutralization of Special Elements used in an SQL Command (SQL Injection)**

The login form's username field is vulnerable to SQL injection, allowing a complete authentication bypass. By entering a simple SQL payload in the username field, an attacker logs in as the admin without knowing the password.

```
admin'--
```

<img width="1024" alt="SQL injection auth bypass with admin'-- in the username field" src="/assets/images/Amodat-CVE-2022-23168.jpg" />

*The login page with `admin'--` in the username field - the single quote closes the SQL string and the double dash comments out the password check. The attacker is authenticated as admin.*

The payload works because the application concatenates user input directly into the SQL query without parameterization - something confirmed by reading the source code through the LFI vulnerability (CVE-2022-23167).

## Impact

- **Full authentication bypass** - An attacker gains admin access without any credentials
- **Zero-click** - No brute-force, no credential theft, just a single login attempt
- **Complete system access** - Admin privileges grant control over all mobile workforce operations, employee data, and system configurations
- **Chaining** - The LFI (CVE-2022-23167) revealed the vulnerable SQL query in the source code, making this exploitation trivial

## Advisory

- **ILVN-ID:** ILVN-2022-0023
- **CVE-ID:** CVE-2022-23168
- **Affected Products:** Amodat Mobile Application Gateway
- **Credit:** Moriel Harush
- **Solution:** Update to 7.12.00.09 version

## References

- [CVE-2022-23168 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-23168)
