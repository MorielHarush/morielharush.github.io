---
layout: post
title: "CVE-2022-36787: WebVendome - SQL Injection via DocNumber Parameter"
date: 2022-11-13
cve: "CVE-2022-36787"
severity: "Critical"
cvss: "9.8"
affected: "WebVendome"
---

WebVendome is a web-based document management and business process platform.

## Vulnerability Details

**CWE-89: Improper Neutralization of Special Elements used in an SQL Command (SQL Injection)**

The `DocNumber` parameter in the WebVendome application is vulnerable to SQL Injection. The application passes the parameter value directly into an SQL query without sanitization, allowing an attacker to extract the entire database.

Using SQLMap, we were able to confirm the injection and dump all databases from the backend Microsoft SQL Server:

<img width="1024" alt="SQLMap dumping databases from WebVendome via DocNumber injection" src="/assets/images/WebVendome-CVE-2022-36787.png" />

*SQLMap confirms the SQL Injection in the `DocNumber` parameter - the backend is Microsoft SQL Server and all databases are enumerated and dumped.*

The injection is a boolean-based blind and UNION query type, giving full read access to the entire database server.

## Impact

- **Full database access** - An attacker can read every table in every database on the SQL Server
- **Credential theft** - User accounts, passwords, and session data are extractable
- **Data exfiltration** - All business documents, customer data, and sensitive records stored in the platform are accessible
- **Potential RCE** - On Microsoft SQL Server, `xp_cmdshell` can be enabled to execute operating system commands, leading to full server takeover
- **Unauthenticated** - The injection point does not require authentication

## Advisory

- **ILVN-ID:** ILVN-2022-0058
- **CVE-ID:** CVE-2022-36787
- **Affected Products:** WebVendome
- **Credit:** Moriel Harush
- **Solution:** Update to the latest version

## References

- [CVE-2022-36787 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-36787)
