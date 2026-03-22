---
layout: post
title: "CVE-2023-37217: Tadiran Telecom Aeonix - User Enumeration via Account Lockout Behavior"
date: 2023-07-20
cve: "CVE-2023-37217"
severity: "Medium"
cvss: "5.3"
affected: "Tadiran Telecom Aeonix"
---

Tadiran Telecom Aeonix is a unified communications platform used by enterprises for VoIP, call management, and telephony services. It is widely deployed in corporate and government environments.

## Vulnerability Details

**CWE-204: Observable Response Discrepancy (User Enumeration)**

The Aeonix login page responds differently to valid and invalid usernames through its account lockout mechanism. When a valid username is submitted with incorrect passwords multiple times, the application locks the account and displays a specific lockout message. When an invalid username is used, no lockout occurs and the response differs.

<img width="1024" alt="Account lockout message confirming valid username" src="/assets/images/TadiranAeonixCVE-2023-37217.png" />

*After several failed login attempts with a valid username ("aeonixadmin"), the application responds with "Too many failed login attempts. Your account has been locked for 10 minutes" - confirming the username exists in the system.*

For invalid usernames, the lockout never triggers. The difference in behavior makes it trivial to enumerate which usernames are valid:

- **Valid username** - After a few attempts: "Your account has been locked for 10 minutes"
- **Invalid username** - No lockout, generic error response regardless of attempts

## Impact

- **Username enumeration** - An attacker can confirm valid usernames by observing the lockout behavior
- **No authentication required** - The login page is publicly accessible
- **Targeted brute-force** - Confirmed usernames enable focused password attacks
- **Denial of service** - The lockout mechanism itself can be abused to lock out legitimate users once their username is confirmed
- **Chaining** - Combined with the LFI vulnerability (CVE-2023-37218), an attacker can enumerate users and extract system files for a complete attack chain

## Advisory

- **ILVN-ID:** ILVN-2023-0119
- **CVE-ID:** CVE-2023-37217
- **Affected Products:** Tadiran Telecom Aeonix
- **Credit:** Moriel Harush
- **Solution:** Upgrade to the latest version

## References

- [CVE-2023-37217 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-37217)
