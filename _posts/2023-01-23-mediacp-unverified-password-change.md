---
layout: post
title: "CVE-2023-23466: Media CP Control Panel - Unverified Password Change"
date: 2023-01-23
cve: "CVE-2023-23466"
severity: "High"
cvss: "7.5"
affected: "Media CP Media Control Panel"
---

Media CP is a web-based media hosting control panel used to manage streaming services, media servers, and user accounts.

## Vulnerability Details

**CWE-522: Insufficiently Protected Credential Change**

The password change functionality in Media CP does not require the user to provide their current password. A user can set a new password by simply submitting the new value - no verification of the original credentials.

<img width="1024" alt="Password change request without current password verification" src="/assets/images/MediaCP-CVE-2023-23466.png" />

*The password change request - only the new password is required. No current password field, no re-authentication challenge.*

This means that if an attacker gains even brief access to an authenticated session - through XSS (CVE-2023-23467), CSRF (CVE-2023-23465), or an unattended browser - they can permanently take over the account by changing the password.

## Impact

- **Account takeover** - Any temporary session access becomes permanent
- **No victim awareness** - The legitimate user has no indication their password was changed until they try to log in
- **Chaining** - Combined with XSS or CSRF, this becomes a one-click permanent account takeover

## Advisory

- **ILVN-ID:** ILVN-2023-0083
- **CVE-ID:** CVE-2023-23466
- **Affected Products:** Media CP Media Control Panel
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-23466 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-23466)
