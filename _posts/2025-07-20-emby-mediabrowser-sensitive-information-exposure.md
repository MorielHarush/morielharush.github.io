---
layout: post
title: "CVE-2025-46388: Emby MediaBrowser - IDOR Exposing User Configurations and Pin Codes"
date: 2025-07-20
cve: "CVE-2025-46388"
severity: "Medium"
cvss: "4.3"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform used to organize, stream, and share personal media libraries across devices. It handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor (IDOR)**

While officially classified under CWE-200, this vulnerability is a textbook Insecure Direct Object Reference (IDOR). The Emby MediaBrowser API uses the user's UUID directly in the URL to fetch user data. There is no server-side validation to confirm the requesting user is authorized to access that specific profile.

The vulnerable endpoint follows this pattern:

```
GET /emby/Users/<UUID>/...
```

Any authenticated user can simply swap their own UUID with another user's UUID in the request URL and gain full access to that user's configuration, including their **Pin code** and account settings.

<img width="1024" alt="IDOR request showing access to another user's configuration" src="/assets/images/idorobf1.png" />

*Requesting another user's profile by changing the UUID in the URL - the server returns their full configuration including Pin code.*

No privilege escalation needed. No special tokens. Just change the UUID and the server hands over everything.

<img width="1024" alt="IDOR response exposing user Pin code and settings" src="/assets/images/idorobf2.png" />

*A second user's data accessed the same way - full configuration and Pin code exposed.*

## Impact

- **Access any user's configuration** - Every user's settings, preferences, and metadata are readable by any other authenticated user
- **Pin code exposure** - Pin codes meant to protect parental controls or restricted content are fully visible
- **Account enumeration** - An attacker can iterate through UUIDs to map out all users on the server
- **Chaining potential** - Combined with the unverified password change (CVE-2025-46389), an attacker can read a target's data and then lock them out permanently

## Advisory

- **ILVN-ID:** ILVN-2025-0236
- **CVE-ID:** CVE-2025-46388
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46388 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46388)
