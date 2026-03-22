---
layout: post
title: "CVE-2025-46390: Emby MediaBrowser - User Enumeration via Registration Response Discrepancy"
date: 2025-07-20
cve: "CVE-2025-46390"
severity: "High"
cvss: "7.5"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform used to organize, stream, and share personal media libraries across devices. It handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-204: Observable Response Discrepancy (User Enumeration)**

The Emby MediaBrowser registration endpoint returns different responses depending on whether the submitted username already exists in the system or not. This allows an attacker to enumerate valid usernames without any authentication.

The registration endpoint:

```
POST /register.php
```

When a **valid (existing) username** is submitted, the server responds with a message stating the user already exists:

<img width="1024" alt="Registration response for an existing user" src="/assets/images/userenum1.png" />

*An existing username - the server responds with "this user already exists in the system", confirming the account is valid.*

When an **invalid (non-existing) username** is submitted, the server returns a different response indicating a registration email has been sent:

<img width="1024" alt="Registration response for a non-existing user" src="/assets/images/userenum2ob.png" />

*A non-existing username - the server responds with "Email has been sent to your email address", confirming this user does not exist.*

The difference is completely obvious. An attacker can simply submit usernames to the registration form and the server will confirm which ones are taken.

## Impact

- **Username enumeration** - An attacker can build a list of every valid user on the server by submitting usernames to the registration endpoint
- **No authentication required** - The registration page is publicly accessible, making this a zero-auth reconnaissance vector
- **Targeted attacks** - Knowing which usernames exist makes password brute-force and credential stuffing attacks far more effective
- **Reconnaissance for chaining** - Combined with other Emby vulnerabilities (IDOR, unverified password change), a confirmed username becomes the first step in a full account takeover chain

## Advisory

- **ILVN-ID:** ILVN-2025-0238
- **CVE-ID:** CVE-2025-46390
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46390 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46390)
