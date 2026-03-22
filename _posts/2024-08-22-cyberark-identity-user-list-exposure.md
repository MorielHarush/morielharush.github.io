---
layout: post
title: "CVE-2024-42338: CyberArk Identity - Full User List Exposure via Search Filter Bypass"
date: 2024-08-22
cve: "CVE-2024-42338"
severity: "Medium"
cvss: "TBD"
affected: "CyberArk Identity Management"
---

CyberArk Identity is an enterprise identity and access management platform used by organizations to secure user authentication, single sign-on, and privileged access across cloud and on-premises environments.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor**

The user search and filtering functionality in CyberArk Identity is designed to display only users relevant to the current environment or the user conducting the search. However, by intercepting and manipulating the search parameters through a proxy, it is possible to make the server return a complete list of all users in the system - including those hidden by environmental filters.

<img width="1024" alt="Manipulated search request returning full user list across all environments" src="/assets/images/CyberArkCVE-2024-42338.png" />

*The manipulated search request with modified filter parameters - the server returns a complete list of all users across all environments, bypassing the UI restrictions.*

The UI was designed to limit visibility, but the server-side filtering was insufficient. By changing the search parameters in the API request, every user account in the system becomes visible regardless of environment or permission boundaries.

## Impact

- **Full user enumeration** - Every user account in the system is accessible, not just those in the attacker's environment
- **Cross-environment visibility** - Users meant to be isolated by environment boundaries are exposed
- **Identity disclosure** - User names, email addresses, and associated details are revealed
- **Targeted attacks** - A complete user directory enables precision phishing and credential stuffing campaigns

## Advisory

- **ILVN-ID:** ILVN-2024-0191
- **CVE-ID:** CVE-2024-42338
- **Affected Products:** CyberArk Identity Management
- **Credit:** Moriel Harush
- **Solution:** Upgrade to latest version

## References

- [CVE-2024-42338 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42338)
