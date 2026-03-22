---
layout: post
title: "CVE-2024-42337: CyberArk Identity - Exposure of Complete Client List to Any User"
date: 2024-08-22
cve: "CVE-2024-42337"
severity: "Medium"
cvss: "6.5"
affected: "CyberArk Identity Management"
---

CyberArk Identity is an enterprise identity and access management platform used by organizations to secure user authentication, single sign-on, and privileged access across cloud and on-premises environments.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor**

Any user with basic access to the CyberArk Identity platform can retrieve the complete list of clients and companies associated with the product. When a user logs in with standard, non-privileged credentials, they are granted access to a directory of all other customers using the service.

<img width="1024" alt="API response exposing full client list with company names and admin details" src="/assets/images/CyberArkCVE-2024-42337.png" />

*The API response returns the complete list of clients - company names, admin usernames, and associated metadata are all visible to any authenticated user.*

This exposure includes company names, associated usernames, and administrative details that should remain confidential. A basic user has no business seeing who else uses the platform.

## Impact

- **Customer enumeration** - Any user can compile a full list of the service provider's customers
- **Reconnaissance** - Exposed company names and admin usernames provide a foundation for targeted phishing and social engineering attacks
- **Competitive intelligence** - A malicious actor can identify which organizations use CyberArk Identity
- **Trust violation** - Customers expect their relationship with the vendor to remain confidential

## Advisory

- **ILVN-ID:** ILVN-2024-0190
- **CVE-ID:** CVE-2024-42337
- **Affected Products:** CyberArk Identity Management
- **Credit:** Moriel Harush
- **Solution:** Upgrade to latest version

## References

- [CVE-2024-42337 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42337)
