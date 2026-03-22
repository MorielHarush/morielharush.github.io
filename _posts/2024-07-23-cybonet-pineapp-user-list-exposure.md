---
layout: post
title: "CVE-2024-41694: Cybonet PineApp Mail Relay - Exposure of Complete User List"
date: 2024-07-23
cve: "CVE-2024-41694"
severity: "Medium"
cvss: "5.3"
affected: "PineApp Mail Relay"
---

PineApp Mail Relay by Cybonet is an email security gateway used by organizations to filter, relay, and manage email traffic. It provides spam filtering, antivirus scanning, and email policy enforcement.

## Vulnerability Details

**CWE-200: Exposure of Sensitive Information to an Unauthorized Actor**

The PineApp Mail Relay application exposes the complete list of users to unauthorized actors. An API endpoint returns all user accounts in the system, including usernames, email addresses, and associated metadata.

<img width="1024" alt="API response returning full user list with details" src="/assets/images/CybonetCVE-2024-41694.png" />

*The API response returning the complete list of users in the system - usernames, email addresses, and account details are all visible.*

## Impact

- **Full user enumeration** - Every user account in the mail relay system is exposed
- **Email address harvesting** - Collected email addresses enable targeted phishing campaigns
- **Reconnaissance** - Understanding the user structure of the mail relay helps plan further attacks
- **Chaining** - Combined with the LFI vulnerability (CVE-2024-41695), an attacker can enumerate users and then extract credentials from configuration files

## Advisory

- **ILVN-ID:** ILVN-2024-0178
- **CVE-ID:** CVE-2024-41694
- **Affected Products:** PineApp Mail Relay
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 5.2.1 revision 20jun24 security update

## References

- [CVE-2024-41694 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-41694)
