---
layout: post
title: "CVE-2024-42341: Loway QueueMetrics - Open Redirect via AUTH_url Parameter"
date: 2024-09-03
cve: "CVE-2024-42341"
severity: "Medium"
cvss: "6.1"
affected: "Loway QueueMetrics 22.11.6"
---

Loway QueueMetrics is a call center monitoring and reporting platform used to track agent performance, queue statistics, and call analytics. It is widely deployed in enterprise contact centers.

## Vulnerability Details

**CWE-601: URL Redirection to Untrusted Site (Open Redirect)**

The `AUTH_url` parameter in the QueueMetrics login flow is vulnerable to open redirect. The application does not validate the redirect destination, allowing an attacker to craft a URL that redirects users to any external site after interacting with the application.

```
GET /queuemetrics/...?AUTH_url=https://google.com
```

<img width="1024" alt="Open redirect via AUTH_url parameter redirecting to google.com" src="/assets/images/LowayQueueMetricsOpenRedirect.png" />

*The request with a manipulated `AUTH_url` parameter - the server responds with a redirect to google.com, proving the application will redirect to any external domain.*

## Impact

- **Phishing** - An attacker crafts a link on the trusted QueueMetrics domain that redirects to a fake login page
- **Credential harvesting** - Users trust the legitimate domain in the URL and are more likely to enter credentials on the phishing destination
- **Social engineering** - The redirect originates from a legitimate enterprise application, bypassing user suspicion

## Advisory

- **ILVN-ID:** ILVN-2024-0194
- **CVE-ID:** CVE-2024-42341
- **Affected Products:** Loway QueueMetrics 22.11.6
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 24.05.5

## References

- [CVE-2024-42341 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42341)
