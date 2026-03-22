---
layout: post
title: "CVE-2024-42343: Loway QueueMetrics - User Enumeration via Login Response Discrepancy"
date: 2024-09-03
cve: "CVE-2024-42343"
severity: "High"
cvss: "7.5"
affected: "Loway QueueMetrics 17.06.1 - 22.02.11"
---

Loway QueueMetrics is a call center monitoring and reporting platform used to track agent performance, queue statistics, and call analytics. It is widely deployed in enterprise contact centers.

## Vulnerability Details

**CWE-204: Observable Response Discrepancy (User Enumeration)**

The QueueMetrics login functionality returns different responses depending on whether the submitted username exists in the system. This allows an attacker to enumerate valid usernames without any valid credentials.

## Invalid User

When an invalid username is submitted, the application returns a distinct error response:

<img width="1024" alt="Login response for invalid username" src="/assets/images/LowayQueueMetricsUserEnum1.png" />

*An invalid username submitted to the login form.*

<img width="1024" alt="Error message for invalid user" src="/assets/images/LowayQueueMetricsUserEnum2.png" />

*The application returns a response specific to non-existing users.*

## Valid User

When a valid username is submitted with an incorrect password, the application returns a different response:

<img width="1024" alt="Login response for valid username" src="/assets/images/LowayQueueMetricsUserEnum3.png" />

*A valid username submitted with a wrong password.*

<img width="1024" alt="Different error message for valid user" src="/assets/images/LowayQueueMetricsUserEnum4.png" />

*The application returns a different response, confirming the username exists in the system.*

The difference between the two responses makes it trivial to determine which usernames are valid.

## Impact

- **Username enumeration** - An attacker can build a complete list of valid users by testing usernames against the login form
- **No authentication required** - The login page is publicly accessible
- **Targeted brute-force** - Confirmed usernames enable focused password attacks instead of guessing both username and password
- **Affects a wide range of versions** - Versions 17.06.1 through 22.02.11 are all vulnerable

## Advisory

- **ILVN-ID:** ILVN-2024-0196
- **CVE-ID:** CVE-2024-42343
- **Affected Products:** Loway QueueMetrics 17.06.1 - 22.02.11
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 24.05.5 or enable "Secure Configuration"

## References

- [CVE-2024-42343 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42343)
