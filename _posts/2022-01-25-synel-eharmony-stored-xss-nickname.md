---
layout: post
title: "CVE-2022-22791: Synel eHarmony - Blind Stored XSS via Nickname Field"
date: 2022-01-25
cve: "CVE-2022-22791"
severity: "Medium"
cvss: "6.1"
affected: "Synel eHarmony version 8.0.2.3"
---

Synel eHarmony is a workforce management and time attendance platform used by organizations to manage employee records, scheduling, and HR processes.

## Vulnerability Details

**CWE-79: Improper Neutralization of Input During Web Page Generation (Stored XSS)**

A Blind Stored XSS vulnerability exists in the Nickname text box within the eHarmony application. An attacker can inject a JavaScript payload into the nickname field that persists in the system and executes whenever another user views the profile.

<img width="1024" alt="XSS payload injected into the nickname field" src="/assets/images/Harmony-CVE-22791.png" />

*The XSS payload injected into the Nickname text box - the payload is stored and executes for every user who views the profile.*

Because this is a Stored (Blind) XSS, the attacker does not need to be present when the payload fires. Any user or administrator who views the employee profile triggers the script.

## Impact

- **Session hijacking** - The attacker receives session cookies from every user who views the profile
- **Blind execution** - Cookies are exfiltrated automatically without the attacker being present
- **Admin targeting** - HR personnel and administrators reviewing employee records are primary targets
- **Persistent** - The payload remains active until the nickname field is cleaned

## Advisory

- **ILVN-ID:** ILVN-2022-0012
- **CVE-ID:** CVE-2022-22791
- **Affected Products:** Synel eHarmony version 8.0.2.3
- **Credit:** Moriel Harush
- **Solution:** Update to eHarmony version 11

## References

- [CVE-2022-22791 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-22791)
