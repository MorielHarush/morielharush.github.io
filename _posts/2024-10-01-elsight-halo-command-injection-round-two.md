---
layout: post
title: "CVE-2024-45251 & CVE-2024-45252: Elsight Halo - They Fixed It. We Broke It Again."
date: 2024-10-01
cve: "CVE-2024-45251 / CVE-2024-45252"
severity: "Critical"
cvss: "9.8"
affected: "Elsight Halo version 11.7.1.5"
---

Back in 2022, we found a critical RCE on the Elsight Halo drone communication chipset (CVE-2022-36784). The vendor patched it. We came back to verify the fix.

They sanitized the output. They did not fix the input.

Two new command injection vulnerabilities. Same device. Same API endpoint. Same result - a reverse shell as root on a military drone chipset.

## The "Fix" That Wasn't

After CVE-2022-36784 was reported, the Elsight team implemented a patch. Their approach: sanitize the output displayed to the user. The underlying issue - unsanitized user input being passed directly to OS commands - was left untouched.

The ping functionality on the Halo's network interface API accepts two parameters: `source_ip` and `destination`. Both are passed to the system's `ping` command. Both are injectable.

```
POST /api/v1/nics/ethernet/eth0/ping
```

```json
{
  "source_ip": "172.17.0.4",
  "destination": "8.8.8.8"
}
```

## CVE-2024-45252: Command Injection via source_ip

Injecting into the `source_ip` parameter with a `whoami` command piped through Burp Collaborator:

<img width="1024" alt="Command injection via source_ip parameter" src="/assets/images/elsightSource.png" />

*The `source_ip` parameter injected with a `whoami` backtick payload sent to Burp Collaborator. The server responds with "ping timeout" - but the command already executed.*

The Collaborator callback confirms execution as **root**:

<img width="1024" alt="Burp Collaborator receiving DNS callback confirming root execution" src="/assets/images/elsightSourceCollab.png" />

*Burp Collaborator receives the DNS query containing the `whoami` output - `root`.*

## CVE-2024-45251: Command Injection via destination

The exact same vulnerability exists in the `destination` parameter:

<img width="1024" alt="Command injection via destination parameter" src="/assets/images/ElsightDestination.png" />

*The `destination` parameter injected with the same `whoami` backtick payload. This time the server even returns the legitimate ping response alongside executing the injected command.*

Collaborator confirms root again:

<img width="1024" alt="Burp Collaborator confirming root execution via destination parameter" src="/assets/images/ElsightDestinationCollab.png" />

*DNS callback from the `destination` injection - `root` again.*

## Reverse Shell on a Drone

With command injection confirmed on both parameters, getting a full reverse shell was straightforward:

<img width="1024" alt="Reverse shell as root on the Elsight Halo" src="/assets/images/elsightReverseShell.png" />

*A reverse shell on the Elsight Halo - running as `root` inside the `halo_web_service` container. Full control over the drone communication chipset.*

Same result as 2022. Root on a military drone chipset. The only difference is the CVE number.

## Impact

- **Full device takeover** - Root shell on the Halo chipset
- **Drone communication interception** - Read, modify, or inject data into bonded connectivity streams
- **Persistent backdoor** - Install malware that survives reboots
- **Lateral movement** - Pivot from the Halo into connected ground control stations and command networks
- **Two injectable parameters** - Even if one gets patched, the other remains exploitable

## Key Takeaway

**Sanitizing output is not a fix.** If user input reaches a shell command unsanitized, the vulnerability exists regardless of what you show the user. The fix must happen at the input layer - validate, sanitize, or better yet, never pass user input to a shell at all.

## Advisory

- **ILVN-ID:** ILVN-2024-0203 / ILVN-2024-0204
- **CVE-ID:** CVE-2024-45251 / CVE-2024-45252
- **Affected Products:** Elsight Halo version 11.7.1.5
- **Credit:** Moriel Harush
- **Solution:** Upgrade to version 11.9.4.0

## References

- [CVE-2024-45251 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-45251)
- [CVE-2024-45252 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2024-45252)
- [CVE-2022-36784 - The Original Elsight Halo RCE](/2024/06/01/elsight-halo-drone-rce/)
