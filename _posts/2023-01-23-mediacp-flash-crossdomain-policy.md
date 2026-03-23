---
layout: post
title: "CVE-2023-23464: Media CP Control Panel - Flash Cross-Domain Policy Misconfiguration"
date: 2023-01-23
cve: "CVE-2023-23464"
severity: "High"
cvss: "8.1"
affected: "Media CP Media Control Panel"
---

Media CP is a web-based media hosting control panel used to manage streaming services, media servers, and user accounts.

## Vulnerability Details

**CWE-200: Information Disclosure via Permissive Cross-Domain Policy**

The Media CP application exposes a `crossdomain.xml` file with an overly permissive policy that allows any external domain to make cross-origin requests to the application.

```xml
<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
    <allow-access-from domain="*" />
</cross-domain-policy>
```

<img width="1024" alt="Permissive crossdomain.xml allowing access from any domain" src="/assets/images/MediaCPFCDA-CVE-2023-23464.jpg" />

*The `crossdomain.xml` response - `allow-access-from domain="*"` grants any external domain permission to make cross-origin requests and read responses from the Media CP application.*

The wildcard `*` policy means any website on the internet can make Flash/Silverlight-based requests to the Media CP instance and read the responses - bypassing same-origin policy protections entirely.

## Impact

- **Cross-origin data theft** - Any external site can read authenticated responses from the Media CP application
- **Session data leakage** - An attacker's site can make requests using the victim's authenticated session and read the returned data
- **API abuse** - All API endpoints are accessible cross-origin, enabling data extraction without direct access
- **Chaining** - Combined with XSS and CSRF vulnerabilities, this creates a complete attack surface where any external page can interact with the application as the victim

## Advisory

- **ILVN-ID:** ILVN-2023-0081
- **CVE-ID:** CVE-2023-23464
- **Affected Products:** Media CP Media Control Panel
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-23464 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-23464)
