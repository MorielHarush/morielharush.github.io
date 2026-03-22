---
layout: post
title: "CVE-2025-46386: Emby MediaBrowser - Account Takeover via IDOR Pin Code Exposure"
date: 2025-07-20
cve: "CVE-2025-46386"
severity: "High"
cvss: "8.8"
affected: "Emby MediaBrowser version 4.9.0.35"
---
<img width="1024" src="/assets/images/embylogo.jpg" />

Emby is a popular self-hosted media server platform used to organize, stream, and share personal media libraries across devices. It handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-639: Authorization Bypass Through User-Controlled Key (Account Takeover)**

This vulnerability chains directly with the IDOR in CVE-2025-46388. By accessing another user's profile through UUID manipulation, an attacker can retrieve the victim's Pin code (`ProfilePin`) in clear text - and use it to take over their account.

## Exploitation

The IDOR vulnerability (CVE-2025-46388) allows any authenticated user to access another user's configuration by swapping the UUID in the API request:

```
GET /emby/Users/<victim-UUID>
```

The server responds with the full user profile, which includes the `ProfilePin` field containing the account Pin code in clear text:

<img width="1024" alt="IDOR response exposing user Pin code in clear text" src="/assets/images/ATO1.png" />

*The victim's profile retrieved via IDOR - the `ProfilePin` (Pin code) is returned in clear text (highlighted), giving the attacker everything needed for account takeover.*

With the username (obtained via IDOR or user enumeration) and the Pin code in clear text, the attacker can simply log in as the victim. No password needed. No additional exploitation. Just a username and a Pin.

## Impact

- **Full account takeover** - The exposed Pin code and username are enough to log in as the victim
- **Credential theft** - Pin codes are returned in clear text, not hashed or masked
- **No victim interaction** - The entire attack happens server-side with zero indication to the victim
- **Scalable** - An attacker can iterate through UUIDs and harvest Pin codes for every user on the server

## Full Attack Chain

This CVE is the culmination of multiple Emby vulnerabilities working together:

1. **CVE-2025-46390** - Enumerate valid usernames via registration response discrepancy
2. **CVE-2025-46388** - Access any user's profile via IDOR, extract their Pin code in clear text
3. **CVE-2025-46386** - Log in as the victim using their username and exposed Pin code (this CVE)

## Advisory

- **ILVN-ID:** ILVN-2025-0234
- **CVE-ID:** CVE-2025-46386
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46386 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46386)
