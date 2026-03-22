---
layout: post
title: "CVE-2024-42342: Loway QueueMetrics - Host Header Override via HTTP Request Smuggling"
date: 2024-09-03
cve: "CVE-2024-42342"
severity: "Medium"
cvss: "4.3"
affected: "Loway QueueMetrics 22.11.6"
---

Loway QueueMetrics is a call center monitoring and reporting platform used to track agent performance, queue statistics, and call analytics. It is widely deployed in enterprise contact centers.

## Vulnerability Details

**CWE-444: Inconsistent Interpretation of HTTP Requests (HTTP Request Smuggling)**

The QueueMetrics application trusts client-supplied host headers without validation. By adding three headers to a request - `X-Forwarded-Host`, `X-Host`, and `X-Forwarded-Server` - an attacker can override the internal URL resolution and point the application to an attacker-controlled domain.

```
X-Forwarded-Host: pttest.com
X-Host: pttest.com
X-Forwarded-Server: pttest.com
```

<img width="1024" alt="Host header override changing internal URLs to attacker domain" src="/assets/images/LowayQueueMetricsOverRide.jpg" />

*The request with three host override headers injected - the server response now references `pttest.com` in internal URLs like `agent_background_url`, proving the application trusts the spoofed host headers.*

The application's response includes URLs that now point to `pttest.com` instead of the legitimate server. This means the application builds internal links and resource paths based on attacker-controlled input.

## Impact

- **Cache poisoning** - If a caching layer sits in front of QueueMetrics, poisoned responses with attacker-controlled URLs get served to other users
- **Password reset poisoning** - If the application generates links (like password reset emails) using the host header, those links point to the attacker's domain
- **Resource hijacking** - Internal assets like JavaScript files or background resources load from the attacker's server, enabling XSS or data exfiltration
- **SSRF potential** - Overridden host values may cause server-side requests to the attacker's domain

## Advisory

- **ILVN-ID:** ILVN-2024-0195
- **CVE-ID:** CVE-2024-42342
- **Affected Products:** Loway QueueMetrics 22.11.6
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 24.05.5, or enable "Secure Configuration"

## References

- [CVE-2024-42342 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-42342)
