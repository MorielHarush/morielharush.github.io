---
layout: post
title: "CVE-2024-42340: CyberArk Identity - Privilege Escalation via Client-Side Response Manipulation"
date: 2024-08-22
cve: "CVE-2024-42340"
severity: "High"
cvss: "TBD"
affected: "CyberArk Identity Management"
---

CyberArk Identity is an enterprise identity and access management platform used by organizations to secure user authentication, single sign-on, and privileged access across cloud and on-premises environments.

## Vulnerability Details

**CWE-602: Client-Side Enforcement of Server-Side Security**

The CyberArk Identity platform enforces access control decisions on the client side rather than the server side. By intercepting the server response with a proxy and modifying specific parameters - such as changing a `true` value to `false` - a standard user can trick the UI into granting access to administrative functionalities.

## Exploitation

**Step 1 - Intercept the response and flip the flags**

A standard user logs in and intercepts the server response. The response contains feature flags that determine which UI elements and admin panels are accessible. Changing these values grants access to restricted areas.

<img width="1024" alt="Server response with feature flags controlling admin access" src="/assets/images/CyberArkCVE-2024-42340-1.png" />

*The server response containing boolean feature flags - modifying these values from `true` to `false` (or vice versa) unlocks admin functionality in the UI.*

**Step 2 - Full admin panel access**

After forwarding the modified response, the standard user gains access to the Administration panel, including Security Insights, Alerts, and Core Services.

<img width="1024" alt="Admin panel accessible after response manipulation" src="/assets/images/CyberArkCVE-2024-42340-2.png" />

*The Administration panel - fully accessible to a standard user after response manipulation. Security alerts, policies, and core services are all visible.*

**Step 3 - Access to sensitive management settings**

The escalated access extends to Endpoint Management Settings, certificate authority configurations, and policy management.

<img width="1024" alt="Endpoint Management Settings accessible to escalated user" src="/assets/images/CyberArkCVE-2024-42340-3.png" />

*Endpoint Management Settings including Policy Management and Issuing Certificate Authority - all accessible from a standard user account.*

The client-side UI trusts the response integrity without any server-side enforcement. If the response says "this user is an admin", the UI believes it.

## Impact

- **Full admin access** - A standard user can access the entire Administration panel
- **Security policy visibility** - Authentication policies, password configurations, and security alerts are all readable
- **Certificate authority access** - Endpoint management including certificate issuance settings are exposed
- **Configuration tampering** - Depending on server-side enforcement, the attacker may be able to modify settings, not just view them
- **Ironic target** - This is an identity and access management platform - the product designed to secure access controls has broken access controls

## Advisory

- **ILVN-ID:** ILVN-2024-0193
- **CVE-ID:** CVE-2024-42340
- **Affected Products:** CyberArk Identity Management
- **Credit:** Moriel Harush
- **Solution:** Upgrade to latest version

## References

- [CVE-2024-42340 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42340)
