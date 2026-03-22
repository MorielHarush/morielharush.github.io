---
layout: post
title: "CVE-2023-37218: Tadiran Telecom Aeonix - Local File Inclusion via fileName Parameter"
date: 2023-07-20
cve: "CVE-2023-37218"
severity: "High"
cvss: "7.5"
affected: "Tadiran Telecom Aeonix"
---

Tadiran Telecom Aeonix is a unified communications platform used by enterprises for VoIP, call management, and telephony services. It is widely deployed in corporate and government environments.

## Vulnerability Details

**CWE-22: Improper Limitation of a Pathname to a Restricted Directory (Local File Inclusion)**

The Aeonix platform is vulnerable to Local File Inclusion through the `fileName` parameter in the download endpoint. By encoding the traversal payload, an attacker can read arbitrary files from the underlying system without authentication.

```
GET /aeonix/download?fileName=..%2F..%2F..%2F..%2F..%2F..%2F..%2Fetc%2Fpasswd
```

<img width="1024" alt="LFI via fileName parameter reading /etc/passwd" src="/assets/images/TadiranAeonix-CVE-2023-37218.jpg" />

*The GET request with an encoded traversal path in the `fileName` parameter - the server returns the full contents of `/etc/passwd`, exposing all system users including service accounts for PostgreSQL, MySQL, and the Aeonix application itself.*

The response reveals dozens of system accounts including `aeonixadmin`, `postgres`, `mysql`, `qmailadmin`, and other service users - providing a complete map of the services running on the system.

## Impact

- **Arbitrary file read** - Any file accessible to the web server process can be retrieved
- **System reconnaissance** - `/etc/passwd` reveals all user accounts and running services
- **Credential exposure** - Configuration files containing database passwords and API keys are readable
- **Unauthenticated** - No login required to exploit
- **Chaining** - Disclosed system users can be combined with the user enumeration vulnerability (CVE-2023-37217) for targeted attacks

## Advisory

- **ILVN-ID:** ILVN-2023-0120
- **CVE-ID:** CVE-2023-37218
- **Affected Products:** Tadiran Telecom Aeonix
- **Credit:** Moriel Harush
- **Solution:** Upgrade to the latest version

## References

- [CVE-2023-37218 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-37218)
