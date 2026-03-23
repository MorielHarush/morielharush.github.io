---
layout: post
title: "CVE-2023-31187: Avaya IX Workforce Engagement - Credentials Exposed in Developer Tools"
date: 2023-05-08
cve: "CVE-2023-31187"
severity: "Medium"
cvss: "6.5"
affected: "Avaya IX Workforce Engagement v15.2.7.1195"
---

Avaya IX Workforce Engagement is an enterprise workforce management platform used for call recording, quality management, and agent performance analytics in contact centers.

## Vulnerability Details

**CWE-522: Insufficiently Protected Credentials**

The Avaya IX Workforce Engagement application redacts sensitive credentials in the UI - fields like server passwords and service account credentials appear masked. However, the actual credential values are present in the page source and fully accessible through the browser's developer tools.

<img width="1024" alt="Credentials visible in developer tools while redacted in UI" src="/assets/images/AvayaCVE-2023-31187.png" />

*The Recording Management settings page - credentials appear masked in the UI form fields (left), but the developer tools (right) reveal the plaintext values in the page source.*

The UI masking is purely cosmetic. Opening the browser console or inspecting the element reveals the actual password values. No proxy or interception tool needed - just right-click and inspect.

## Impact

- **Credential exposure** - Any user with access to the settings page can extract plaintext credentials via developer tools
- **Service account compromise** - Exposed credentials may include FTP, database, or integration service accounts
- **Lateral movement** - Stolen service credentials enable access to connected infrastructure
- **Shoulder surfing defense bypassed** - The redaction is meant to protect against visual observation, but the data is trivially accessible

## Advisory

- **ILVN-ID:** ILVN-2023-0104
- **CVE-ID:** CVE-2023-31187
- **Affected Products:** Avaya IX Workforce Engagement v15.2.7.1195
- **Credit:** Moriel Harush
- **Solution:** No info

## References

- [CVE-2023-31187 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-31187)
