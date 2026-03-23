---
layout: post
title: "CVE-2023-32218: Avaya IX Workforce Engagement - Open Redirect via rd Parameter"
date: 2023-05-08
cve: "CVE-2023-32218"
severity: "Medium"
cvss: "TBD"
affected: "Avaya IX Workforce Engagement v15.2.7.1195"
---

Avaya IX Workforce Engagement is an enterprise workforce management platform used for call recording, quality management, and agent performance analytics in contact centers.

## Vulnerability Details

**CWE-601: URL Redirection to Untrusted Site (Open Redirect)**

The login page accepts an `rd` parameter that controls where the user is redirected after authentication. The application does not validate the redirect destination, allowing an attacker to craft a URL that redirects users to any external site.

```
/login?rd=https://google.com
```

<img width="1024" alt="Open redirect via rd parameter in Avaya IX login page" src="/assets/images/AvayaCVE-2023-31186.png" />

*The Avaya IX Workforce Engagement login page with the `rd` parameter set to an external URL (highlighted in the address bar). After login, the user is redirected to the attacker-controlled destination.*

## Impact

- **Phishing** - An attacker sends a link to the legitimate Avaya login page with a crafted `rd` value pointing to a fake login page
- **Credential harvesting** - The victim trusts the real Avaya domain and has no reason to suspect the redirect
- **Post-auth trust** - The redirect occurs after successful authentication, increasing the victim's trust in the destination

## Advisory

- **ILVN-ID:** ILVN-2023-0105
- **CVE-ID:** CVE-2023-32218
- **Affected Products:** Avaya IX Workforce Engagement v15.2.7.1195
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-32218 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-32218)
