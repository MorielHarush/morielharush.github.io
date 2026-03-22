---
layout: post
title: "CVE-2025-46387: Emby MediaBrowser - Privilege Escalation to Admin via Response Manipulation"
date: 2025-07-20
cve: "CVE-2025-46387"
severity: "High"
cvss: "8.8"
affected: "Emby MediaBrowser version 4.9.0.35"
---
<img width="1024" height="752" src="/assets/images/embylogo.jpg" />

Emby is a popular self-hosted media server platform used to organize, stream, and share personal media libraries across devices. It handles user authentication, access permissions, and sensitive media metadata, making its security posture critical.

## Vulnerability Details

**CWE-639: Authorization Bypass Through User-Controlled Key (Privilege Escalation)**

Emby MediaBrowser version 4.9.0.35 relies on the client-side response to determine user privileges. The authorization decision for admin access is based on a parameter in the login response body rather than being enforced server-side. This allows any regular user to escalate to full administrator privileges.

## Exploitation

**Step 1 - Intercept the login response and flip the flag**

A regular user logs in and intercepts the authentication response using a proxy like Burp Suite. The response contains a JSON body with a parameter `IsAdministrator` set to `false`. Changing this value to `true` is all it takes.

<img width="1024" alt="Intercepting login response and changing IsAdministrator to true" src="/assets/images/admin1obf.png" />

*The login response intercepted in Burp Suite - `IsAdministrator` changed from `false` to `true` (highlighted).*

**Step 2 - Full admin access granted**

After forwarding the modified response, the application grants the regular user full access to the Administrator Panel, including server management, user management, and all privileged operations.

<img width="1024" alt="Admin dashboard accessible after privilege escalation" src="/assets/images/admin2obff.png" />

*The admin dashboard - fully accessible to a regular user after the response manipulation.*

No server-side validation. No additional checks. The application trusts the response it sent to the client, and if the client says "I'm an admin", the application believes it.

## Impact

- **Full admin takeover** - Any authenticated user becomes a server administrator
- **User management** - The attacker can create, delete, or modify any user account on the server
- **Server configuration** - Full access to server settings, library management, and plugin installation
- **Data access** - Unrestricted access to all media libraries and metadata across all users
- **Chaining** - Combined with user enumeration (CVE-2025-46390) and unverified password change (CVE-2025-46389), a regular user can take over the entire Emby instance and lock out the real admin

## Advisory

- **ILVN-ID:** ILVN-2025-0235
- **CVE-ID:** CVE-2025-46387
- **Affected Products:** Emby MediaBrowser version 4.9.0.35
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-46387 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-46387)
