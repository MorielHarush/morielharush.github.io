---
layout: post
title: "CVE-2023-42495: Dasan Networks W-Web - Command Injection via Login Username Field"
date: 2023-12-11
cve: "CVE-2023-42495"
severity: "Critical"
cvss: "9.8"
affected: "Dasan Networks W-Web versions 1.22-1.27"
---

Dasan Networks W-Web is a web-based management interface used to configure and manage Dasan network devices. Versions 1.22 through 1.27 are affected by a critical command injection vulnerability in the login form itself.

## Vulnerability Details

**CWE-78: Improper Neutralization of Special Elements used in an OS Command (Command Injection)**

The login form's username field (`tbxID`) is vulnerable to OS command injection. The application passes the username value directly to a system command without any sanitization. An attacker does not need valid credentials - the injection happens before any authentication check.

```
POST /cgi-bin/cstecgi.cgi/main/login_proc.php

tbxID=<injected_command>&tbxPW=...
```

<img width="1024" alt="Command injection via tbxID parameter in login form" src="/assets/images/DasanRCE-CVE-2023-42495.png" />

*The POST request to the login endpoint - the `tbxID` parameter contains an injected command. The server processes it before authentication, executing the payload on the underlying OS.*

The injection point is the username field of the login page. No authentication. No session. Just visit the login page and inject commands through the username input.

## Impact

- **Unauthenticated RCE** - Command execution without any valid credentials
- **Pre-auth exploitation** - The injection happens before the authentication logic, making every exposed device vulnerable
- **Full device takeover** - Arbitrary command execution on the network device
- **Network pivot** - Compromised network devices provide a foothold for lateral movement across the network
- **Mass exploitation potential** - Any internet-facing Dasan W-Web instance running versions 1.22-1.27 is exploitable

## Advisory

- **ILVN-ID:** ILVN-2023-0146
- **CVE-ID:** CVE-2023-42495
- **Affected Products:** Dasan Networks W-Web versions 1.22-1.27
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-42495 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-42495)
