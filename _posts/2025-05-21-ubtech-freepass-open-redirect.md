---
layout: post
title: "CVE-2025-23183: UBtech Freepass - Open Redirect via Referer Header Manipulation"
date: 2025-05-21
cve: "CVE-2025-23183"
severity: "Medium"
cvss: "6.1"
affected: "UBtech Freepass version 1.3.1807.1500"
---
<img width="1024" height="752" src="/assets/images/ubtechlogo.jpg" />

UBtech Freepass is an access management platform used for authentication and user session handling. During our assessment, we identified an Open Redirect vulnerability that allows an attacker to redirect users from the trusted application domain to any external site.

## Vulnerability Details

**CWE-601: URL Redirection to Untrusted Site (Open Redirect)**

The application relies on the `Referer` header to determine the destination URL for redirection. It does not validate or sanitize the URL before performing the redirect. By manipulating the Referer header, an attacker can force the application to redirect users to any arbitrary external domain.

The response returns a `302 Found` with a `Location` header pointing to the attacker-controlled URL:

<img width="1024" alt="Referer header manipulated to redirect to external site" src="/assets/images/UBTechOR1.png" />

*The request with a manipulated Referer header - the server responds with a redirect to the attacker-controlled URL (highlighted).*

The user is then seamlessly redirected to the external site. In this PoC, the redirect lands on Google:

<img width="1024" alt="User redirected to Google as proof of concept" src="/assets/images/UBTechOR2.png" />

*The browser follows the redirect and lands on Google - proving the application will redirect to any external domain without validation.*

## Impact

- **Phishing attacks** - An attacker crafts a link on the trusted UBtech domain that redirects to a fake login page, harvesting credentials from unsuspecting users
- **Credential theft** - Users trust the legitimate domain in the URL, making them more likely to enter sensitive information on the phishing destination
- **Session token leakage** - If tokens or parameters are appended to the redirect URL, they get sent to the attacker's domain
- **Trust exploitation** - The redirect originates from a legitimate domain, bypassing user suspicion and potentially email/web filters

## Advisory

- **ILVN-ID:** ILVN-2025-0229
- **CVE-ID:** CVE-2025-23183
- **Affected Products:** UBtech Freepass version 1.3.1807.1500
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2025-23183 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-23183)
