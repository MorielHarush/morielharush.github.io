---
layout: post
title: "CVE-2022-23169: Amodat Mobile Application Gateway - Error-Based SQL Injection"
date: 2022-06-09
cve: "CVE-2022-23169"
severity: "High"
cvss: "7.2"
affected: "Amodat Mobile Application Gateway"
---

Amodat Mobile Application Gateway (MAG) is a mobile workforce management platform used by organizations to manage field operations, employee tasks, and mobile access to enterprise systems.

## Vulnerability Details

**CWE-89: Improper Neutralization of Special Elements used in an SQL Command (Error-Based SQL Injection)**

The `ID` parameter in the `usergroup_relate.aspx` endpoint is vulnerable to error-based SQL injection. The server returns detailed SQL error messages that reveal database structure and can be used to extract data.

```
GET /mag/asp/Admin/usergroup_relate.aspx?ID=1'%--
```

<img width="1024" alt="Error-based SQL injection showing unclosed quotation mark error" src="/assets/images/Amodat-CVE-2022-23169.jpg" />

*The server responds with HTTP 500 and a detailed error message - "Unclosed quotation mark after the character string" - confirming the SQL injection. The error also reveals the backend is Microsoft IIS with ASP.NET.*

The error messages leak enough information to perform data extraction through error-based techniques without needing UNION queries or blind injection.

## Impact

- **Database extraction** - Error-based techniques allow extracting data from the database through crafted queries
- **Server fingerprinting** - Error messages reveal Microsoft IIS 10.0, ASP.NET, and the database technology
- **Authenticated but low-privilege** - Any authenticated user can exploit this endpoint
- **Chaining** - Combined with the auth bypass (CVE-2022-23168), an unauthenticated attacker gains access and then extracts database contents

## Advisory

- **ILVN-ID:** ILVN-2022-0024
- **CVE-ID:** CVE-2022-23169
- **Affected Products:** Amodat Mobile Application Gateway
- **Credit:** Moriel Harush
- **Solution:** Update to 7.12.00.09 version

## References

- [CVE-2022-23169 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-23169)
