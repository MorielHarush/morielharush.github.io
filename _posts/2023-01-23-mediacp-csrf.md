---
layout: post
title: "CVE-2023-23465: Media CP Control Panel - Cross-Site Request Forgery (CSRF)"
date: 2023-01-23
cve: "CVE-2023-23465"
severity: "Critical"
cvss: "9.1"
affected: "Media CP Media Control Panel"
---

Media CP is a web-based media hosting control panel used to manage streaming services, media servers, and user accounts.

## Vulnerability Details

**CWE-352: Cross-Site Request Forgery (CSRF)**

The Media CP application does not implement CSRF tokens on state-changing operations. An attacker can craft a malicious HTML page that, when visited by an authenticated admin, automatically submits a form to perform actions on their behalf - including creating new user accounts.

## Exploitation

**Step 1 - Craft the CSRF payload**

The attacker creates an HTML page containing a hidden form that auto-submits to the Media CP user management endpoint:

<img width="1024" alt="CSRF PoC HTML creating a new reseller customer account" src="/assets/images/MediaCPCSRF-CVE-2023-23465-1.png" />

*The CSRF PoC - an HTML form that auto-submits a POST request to create a new "ResellerCustomer" account with attacker-controlled credentials. The victim's browser sends the request with their active session.*

**Step 2 - Admin visits the page, account is created**

When the authenticated admin visits the attacker's page, the form submits silently and the new account is created:

<img width="1024" alt="User successfully created via CSRF" src="/assets/images/MediaCPCSRF-CVE-2023-23465-2.png" />

*The application confirms "User id 4 updated successfully" - the CSRF attack completed without any user interaction beyond visiting the page.*

**Step 3 - Attacker's account now exists in the system**

<img width="1024" alt="New CSRF-created account visible in customer list" src="/assets/images/MediaCPCSRF-CVE-2023-23465-3.png" />

*The Customers panel now shows the attacker's "Resellers CustomerCSRF" account - created entirely through the CSRF attack.*

## Impact

- **Account creation** - An attacker can create new accounts with any privilege level
- **Account modification** - Existing user accounts can be modified, including password changes
- **Silent execution** - The attack completes automatically when the victim visits the attacker's page
- **Full platform compromise** - Combined with XSS (CVE-2023-23467) and unverified password change (CVE-2023-23466), the attacker achieves persistent access to the platform

## Advisory

- **ILVN-ID:** ILVN-2023-0082
- **CVE-ID:** CVE-2023-23465
- **Affected Products:** Media CP Media Control Panel
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-23465 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-23465)
