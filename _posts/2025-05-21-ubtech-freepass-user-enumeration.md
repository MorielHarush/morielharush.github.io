---
layout: post
title: "CVE-2025-23182: UBtech Freepass - User Enumeration via Password Reset"
date: 2025-05-21
cve: "CVE-2025-23182"
severity: "Medium"
cvss: "4.3"
affected: "UBtech Freepass version 1.3.1807.1500"
---
<img width="720" height="400" src="/assets/images/ubtechlogo.jpg" />

UBtech Freepass is an access management platform used for authentication and user session handling. During our assessment, we identified a User Enumeration vulnerability through the password reset functionality.

## Vulnerability Details

**CWE-203: Observable Discrepancy (User Enumeration)**

The "Reset Password" functionality in UBtech Freepass responds differently depending on whether the submitted username exists in the system or not. This allows an attacker to enumerate valid usernames without any authentication.

## Valid User

When a **valid username** is submitted to the password reset form, the application redirects to a verification page. This page reveals the last 4 digits of the user's registered phone number and asks for a verification code:

<img width="1024" alt="Valid user submitted to reset password" src="/assets/images/UBTechUserEnum1.png" />

*Step 1 - A valid username is submitted to the reset password endpoint. The server responds with a redirect.*

<img width="1024" alt="Verification page showing last 4 digits of phone number" src="/assets/images/UBTechUserEnum1.1.png" />

*Step 2 - The application confirms the user exists by displaying a verification page with the last 4 digits of their phone number.*

This not only confirms the user exists, but also leaks partial phone number information.

## Invalid User

When an **invalid username** is submitted, the application returns an error page stating the user does not exist:

<img width="1024" alt="Invalid user submitted to reset password" src="/assets/images/UBTechUserEnum1.2.png" />

*Step 1 - An invalid username is submitted to the reset password endpoint.*

<img width="1024" alt="Error page confirming user does not exist" src="/assets/images/UBTechUserEnum1.2.2.png" />

*Step 2 - The application responds with a clear error message confirming this user does not exist in the system.*

The difference between the two flows is immediately obvious. No timing analysis or guesswork needed - the application directly tells the attacker whether the username is valid.

## Impact

- **Username enumeration** - An attacker can build a list of valid users by submitting usernames to the password reset form
- **Partial phone number leakage** - Valid users also have the last 4 digits of their phone number exposed
- **No authentication required** - The password reset page is publicly accessible
- **Targeted attacks** - Confirmed usernames enable focused brute-force, credential stuffing, and phishing campaigns

## Advisory

- **ILVN-ID:** ILVN-2025-0228
- **CVE-ID:** CVE-2025-23182
- **Affected Products:** UBtech Freepass version 1.3.1807.1500
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-23182 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-23182)
