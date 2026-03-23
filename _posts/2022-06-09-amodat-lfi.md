---
layout: post
title: "CVE-2022-23167: Amodat Mobile Application Gateway - Local File Inclusion"
date: 2022-06-09
cve: "CVE-2022-23167"
severity: "Critical"
cvss: "9.8"
affected: "Amodat Mobile Application Gateway"
---

Amodat Mobile Application Gateway (MAG) is a mobile workforce management platform used by organizations to manage field operations, employee tasks, and mobile access to enterprise systems.

## Vulnerability Details

**CWE-22: Improper Limitation of a Pathname to a Restricted Directory (Local File Inclusion)**

The `Downloadfile.aspx` endpoint accepts a `filename` parameter vulnerable to path traversal. By using `..\ ` sequences, an attacker can read arbitrary files from the server - including application source code.

```
GET /Mobile/Downloadfile.aspx?filename=..\MAGWebUI\asp\common\login_do.aspx
```

<img width="1024" alt="LFI reading application source code including login logic" src="/assets/images/AmodatCVE-2022-23167.png" />

*The LFI response returns the full source code of `login_do.aspx` - exposing database connection strings, SQL queries, authentication logic, and credential handling. The source reveals that user input is concatenated directly into SQL queries without parameterization.*

The disclosed source code reveals the entire authentication logic, including how credentials are validated against the database - which directly led to the discovery of the SQL injection vulnerabilities (CVE-2022-23168 and CVE-2022-23169).

## Impact

- **Source code disclosure** - Application source files including authentication logic are readable
- **Credential exposure** - Database connection strings and hardcoded values in the source are exposed
- **Vulnerability discovery** - Reading the source code reveals additional attack vectors like SQL injection
- **Unauthenticated** - No login required to exploit

## Advisory

- **ILVN-ID:** ILVN-2022-0022
- **CVE-ID:** CVE-2022-23167
- **Affected Products:** Amodat Mobile Application Gateway
- **Credit:** Moriel Harush
- **Solution:** Update to 7.12.00.09 version

## References

- [CVE-2022-23167 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-23167)
