---
layout: post
title: "CVE-2024-45253: Avigilon VideoIQ - Path Traversal via GET Request"
date: 2024-11-12
cve: "CVE-2024-45253"
severity: "High"
cvss: "7.5"
affected: "Avigilon VideoIQ iCVR HD camera"
---

Avigilon VideoIQ iCVR HD is an IP-based surveillance camera used in enterprise and commercial security deployments. The camera exposes a web interface for configuration and management.

## Vulnerability Details

**CWE-22: Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)**

The Avigilon VideoIQ camera is vulnerable to Local File Inclusion (LFI) through a simple GET request. The web interface fails to sanitize path traversal sequences in the URL, allowing an attacker to read arbitrary files from the underlying Linux filesystem.

A straightforward directory traversal in the GET request path is all it takes to reach `/etc/passwd`:

```
GET /..%2F..%2F..%2F..%2F..%2F..%2F..%2Fetc/passwd
```

<img width="1024" alt="Path traversal reading /etc/passwd from Avigilon camera" src="/assets/images/AvigilonLFI.jpg" />

*The GET request with path traversal sequences - the server responds with the contents of `/etc/passwd`, exposing system users `root` and `mfg`.*

No authentication required. No special headers. Just a GET request with `../` sequences and the camera serves up any file on disk.

## Impact

- **Arbitrary file read** - An attacker can read any file accessible to the web server process
- **Credential exposure** - System files like `/etc/passwd` and potentially `/etc/shadow` reveal user accounts and may contain password hashes
- **Configuration theft** - Camera configuration files, network settings, and stored credentials are all readable
- **Reconnaissance** - Reading system files provides the information needed for further exploitation
- **No authentication needed** - The traversal works without any login, making it exploitable by anyone with network access to the camera

## Advisory

- **ILVN-ID:** ILVN-2024-0205
- **CVE-ID:** CVE-2024-45253
- **Affected Products:** Avigilon VideoIQ iCVR HD camera
- **Credit:** Moriel Harush
- **Solution:** The VideoIQ line is EOL. Upgrade to a newer product or limit access from the internet to trusted addresses only.

## References

- [CVE-2024-45253 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-45253)
