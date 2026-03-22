---
layout: post
title: "CVE-2024-42339: CyberArk Identity - IDOR Exposing Other Users' Rules and Configurations"
date: 2024-08-22
cve: "CVE-2024-42339"
severity: "Medium"
cvss: "4.3"
affected: "CyberArk Identity Management"
---

CyberArk Identity is an enterprise identity and access management platform used by organizations to secure user authentication, single sign-on, and privileged access across cloud and on-premises environments.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor (IDOR)**

The CyberArk Identity API uses a UUID parameter to retrieve user-specific configuration rules and settings. By replacing the UUID in the request with another user's UUID, an attacker can access the rules and configurations belonging to any other user in the system.

The server does not validate whether the requesting user is authorized to access the specified UUID's data.

<img width="1024" alt="IDOR request accessing another user's configuration rules" src="/assets/images/CyberArkCVE-2024-42339-1.png" />

*The first user's configuration rules retrieved by their UUID.*

<img width="1024" alt="Same request with a different UUID returning another user's rules" src="/assets/images/CyberArkCVE-2024-42339-2.png" />

*The UUID swapped to another user - the server returns their configuration rules and security policies without any authorization check.*

Just swap the UUID and the server hands over another user's security policies, access controls, and configurations.

## Impact

- **Cross-user data access** - Any authenticated user can read any other user's rules and configurations
- **Security policy exposure** - User-specific security policies, MFA settings, and access controls are revealed
- **Reconnaissance** - Understanding another user's security configuration enables targeted bypass attempts
- **Privacy violation** - Configuration data meant to be private to each user is accessible to everyone

## Advisory

- **ILVN-ID:** ILVN-2024-0192
- **CVE-ID:** CVE-2024-42339
- **Affected Products:** CyberArk Identity Management
- **Credit:** Moriel Harush
- **Solution:** Upgrade to latest version

## References

- [CVE-2024-42339 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42339)
