---
layout: post
title: "CVE-2024-41695: Cybonet PineApp Mail Relay - Unauthenticated Local File Inclusion via Base64 Encoded Path"
date: 2024-07-23
cve: "CVE-2024-41695"
severity: "High"
cvss: "7.5"
affected: "PineApp Mail Relay"
---

PineApp Mail Relay by Cybonet is an email security gateway used by organizations to filter, relay, and manage email traffic. It provides spam filtering, antivirus scanning, and email policy enforcement.

## Vulnerability Details

**CWE-22: Improper Limitation of a Pathname to a Restricted Directory (Local File Inclusion)**

The PineApp Mail Relay application is vulnerable to unauthenticated Local File Inclusion. The application accepts a file path parameter that is Base64 encoded. By encoding an arbitrary file path and passing it in the request, an attacker can read any file on the system without any authentication.

<img width="1024" alt="LFI request with Base64 encoded path reading server source code" src="/assets/images/CybonetCVE-2024-41695.png" />

*The GET request with a Base64 encoded file path - the server decodes it and returns the file contents, including PHP source code with database credentials and internal logic.*

The Base64 encoding is not a security measure - it is just how the application handles the parameter. Decoding the value reveals the actual file path being requested:

<img width="1024" alt="Base64 decoded path showing the target file" src="/assets/images/CybonetCVE-2024-41695-2.png" />

*The Base64 string decoded - it translates to `/srv/www/htdocs/manage/db.fuctions/SQL_list.php`, a server-side file containing database functions.*

The application reads whatever file path is encoded in the parameter and returns its contents. No path validation. No authentication. No restrictions.

## Impact

- **Arbitrary file read** - Any file on the system readable by the web server process is accessible
- **Source code disclosure** - PHP source files containing database queries, credentials, and internal logic are exposed
- **Credential theft** - Configuration files with database passwords, API keys, and service credentials are readable
- **Unauthenticated** - No login required, making this exploitable by anyone with network access
- **Chained escalation** - Disclosed credentials and source code enable further attacks on the mail relay and connected infrastructure

## Advisory

- **ILVN-ID:** ILVN-2024-0179
- **CVE-ID:** CVE-2024-41695
- **Affected Products:** PineApp Mail Relay
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 5.2.1 revision 20jun24 security update

## References

- [CVE-2024-41695 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-41695)
