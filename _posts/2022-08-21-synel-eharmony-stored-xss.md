---
layout: post
title: "CVE-2022-36778: Synel eHarmony - Blind Stored XSS via Document Comments"
date: 2022-08-21
cve: "CVE-2022-36778"
severity: "Medium"
cvss: "6.5"
affected: "Synel eHarmony"
---

Synel eHarmony is a workforce management and time attendance platform used by organizations to manage employee records, documents, and HR processes.

## Vulnerability Details

**CWE-79: Improper Neutralization of Input During Web Page Generation (Stored XSS)**

The "Adding documents to worker" functionality contains a Stored XSS vulnerability in the Comments text box. An attacker can inject a JavaScript payload that persists in the system and executes every time another user views the document - including administrators.

The payload is injected into the Comments field when attaching a document to a worker's profile:

<img width="1024" alt="XSS payload injected into the Comments field of worker document" src="/assets/images/Synel-CVE-2022-36778-1.jpg" />

*The "Adding document to worker" dialog - the Comments field contains an injected `<script>` payload that creates a new Image object pointing to an attacker-controlled server with `document.cookie` as the output parameter.*

Because this is a Stored (Blind) XSS, the payload fires whenever any user - including admins - views the worker's documents. The injected script sends the victim's session cookies to the attacker's listener:

<img width="1024" alt="Netcat receiving stolen cookies from XSS payload" src="/assets/images/Synel-CVE-36778-2.png" />

*Netcat listener receiving the victim's cookies - the full cookie string including session identifiers is exfiltrated to the attacker's server.*

## Impact

- **Session hijacking** - The attacker receives session cookies from every user who views the document
- **Blind execution** - The attacker does not need to be present when the payload fires - cookies are sent to their server automatically
- **Persistent** - The payload remains in the system and keeps executing for every viewer until the comment is removed
- **Admin targeting** - HR personnel and administrators who review worker documents are the most likely victims
- **Employee data exposure** - A hijacked admin session grants access to all employee records, attendance data, and HR documents

## Advisory

- **ILVN-ID:** ILVN-2022-0049
- **CVE-ID:** CVE-2022-36778
- **Affected Products:** Synel eHarmony
- **Credit:** Moriel Harush
- **Solution:** Update to eHarmony v11

## References

- [CVE-2022-36778 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-36778)
