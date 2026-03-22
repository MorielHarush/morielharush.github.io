---
layout: post
title: "CVE-2025-46389: Emby MediaBrowser - Unverified Password Change"
date: 2025-07-20
cve: "CVE-2025-46389"
severity: "Medium"
cvss: "6.5"
affected: "Emby MediaBrowser version 4.9.0.35"
---

Emby is a popular self-hosted media server platform used to organize, stream, and share personal media libraries across devices. It handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-620: Unverified Password Change**

The password change functionality in Emby MediaBrowser version 4.9.0.35 does not require the user to provide their current password. The request only expects a single parameter:

```
NewPw=<new_password>
```

That's it. No current password verification. No confirmation step. No re-authentication challenge. Just send the new password and it's done.

This means that if an attacker gains even brief access to an authenticated session - whether through session hijacking, an unattended browser, CSRF, or any form of temporary access - they can permanently take over the account by changing the password. The legitimate user gets locked out with no indication of what happened.

<img width="1024" alt="Emby password change request showing only NewPw parameter required" src="/assets/images/unverifiedpasswordchangedobf.png" />

*The POST request to change a user's password - notice only `NewPw` is required, with no current password verification.*

The request is sent to the password endpoint with nothing more than the new password value. The server accepts it, updates the credentials, and returns a `204 No Content` - password changed, no questions asked.

## Impact

- **Account takeover** - Any temporary session access becomes permanent access
- **No audit trail for the victim** - The legitimate user has no way to know their password was changed until they try to log in
- **Privilege escalation path** - If an admin session is compromised, the attacker locks out the admin and owns the entire server
- **Chained with other vulnerabilities** - Combined with XSS or CSRF, this becomes a one-click account takeover

## Advisory

- **ILVN-ID:** ILVN-2025-0237
- **CVE-ID:** CVE-2025-46389
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46389 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46389)
