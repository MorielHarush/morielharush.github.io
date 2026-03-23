---
layout: post
title: "CVE-2021-36720: Cybonet PineApp Mail Secure - Reflected XSS via url Parameter"
date: 2021-11-29
cve: "CVE-2021-36720"
severity: "Medium"
cvss: "6.1"
affected: "Cybonet PineApp Mail Secure"
---

PineApp Mail Secure by Cybonet is an email security gateway used by organizations to filter, relay, and manage email traffic.

## Vulnerability Details

**CWE-79: Improper Neutralization of Input During Web Page Generation (Reflected XSS)**

The `url` parameter on the PineApp web filtering block page (`blocking.php`) is vulnerable to Reflected XSS. The application reflects the parameter value into the page without sanitization, allowing an attacker to inject arbitrary JavaScript.

```
/blocking.php?url=<script>alert('XSS')</script>
```

<img width="1024" alt="XSS payload executing via the url parameter on the blocking page" src="/assets/images/PineApp-CVE-2021-36720.png" />

*The `url` parameter injected with a `<script>alert()</script>` payload on the PineApp Web-Filtering Block page - the JavaScript executes and the alert fires.*

## Impact

- **Session hijacking** - An attacker can steal the session cookie of any user who clicks the crafted link
- **Admin targeting** - Mail security gateways are managed by IT and security teams, making this a high-value target
- **Phishing vector** - The blocking page is a trusted part of the email security infrastructure, increasing the likelihood a victim will trust the link

## Advisory

- **ILVN-ID:** ILVN-2021-0005
- **CVE-ID:** CVE-2021-36720
- **Affected Products:** Cybonet PineApp Mail Secure
- **Credit:** Moriel Harush
- **Solution:** Update to version 5.2.1

## References

- [CVE-2021-36720 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-36720)
