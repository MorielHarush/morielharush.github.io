---
layout: post
title: "CVE-2023-31186: Avaya IX Workforce Engagement - User Enumeration via Registration"
date: 2023-05-08
cve: "CVE-2023-31186"
severity: "Medium"
cvss: "5.3"
affected: "Avaya IX Workforce Engagement v15.2.7.1195"
---

Avaya IX Workforce Engagement is an enterprise workforce management platform used for call recording, quality management, and agent performance analytics in contact centers.

## Vulnerability Details

**CWE-204: Observable Response Discrepancy (User Enumeration)**

The self-registration functionality in Avaya IX Workforce Engagement allows an attacker to enumerate valid employees in the system. By submitting first name and last name combinations in the registration form, the application reveals whether the employee already exists.

When a valid employee name is submitted, the server responds with:

> "Employee is already a user. Please contact your administrator."

<img width="1024" alt="Registration form revealing employee exists in the system" src="/assets/images/AvayaUserEnumCVE-2023-31186.png" />

*The self-registration page - after submitting a valid employee's first and last name, the application confirms they already exist in the system with a clear error message.*

For invalid names, the application returns a different response. The difference makes it straightforward to enumerate which employees are registered in the system.

## Impact

- **Employee enumeration** - An attacker can confirm which employees exist in the workforce engagement system
- **No authentication required** - The registration page is publicly accessible
- **Name-based discovery** - Unlike username enumeration, this works with real names, making it easier to test using public employee directories or LinkedIn
- **Targeted attacks** - Confirmed employee identities enable focused social engineering, phishing, and credential stuffing campaigns

## Advisory

- **ILVN-ID:** ILVN-2023-0103
- **CVE-ID:** CVE-2023-31186
- **Affected Products:** Avaya IX Workforce Engagement v15.2.7.1195
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-31186 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-31186)
