---
layout: post
title: "Grounded by Default — How Default Credentials Gave Us Root on Military Drone Comms"
date: 2022-10-27
cve: "CVE-2022-36784"
severity: "Critical"
cvss: "9.8"
affected: "Elsight Halo Chipset"
---

<img width="1600" height="521" alt="image" src="https://github.com/user-attachments/assets/d65df733-04d3-4cc8-ae08-957f8403e1e4" />

There's a particular kind of dread that hits you when a shell prompt comes back as `root` — and the device on the other end is a communication chipset embedded in military and law enforcement drones.

This is the story of how we went from a default login page to full remote code execution on the **Elsight Halo**, a drone communication platform trusted by defense organizations worldwide.

## The Target: Elsight Halo

The Elsight Halo is not a consumer gadget. It's a **bonded connectivity chipset** designed for mission-critical drone operations — military reconnaissance, law enforcement surveillance, emergency response. It aggregates multiple cellular, satellite, and Wi-Fi links into a single resilient connection, ensuring drones stay online even in contested or degraded environments.

When we say "mission-critical," we mean it. This hardware sits at the intersection of physical safety and national security. The kind of device you'd expect to be locked down tighter than a vault.

It wasn't.

## The Front Door Was Open

Our assessment began the way most good stories start: with a web browser.

The Elsight Halo exposes a **management interface** — a web-based control panel for configuring the chipset, monitoring connectivity, and managing network parameters. In a properly deployed system, this interface should be firewalled, VPN-gated, or at the very least hidden behind non-default credentials.

Instead, we found it **accessible from the public internet**. No VPN. No IP whitelisting. No network restrictions of any kind. Just a login page, sitting there, waiting.

And the credentials? **Default. Unchanged. As shipped from the factory.**

<img width="1764" height="941" alt="image" src="https://github.com/user-attachments/assets/4726bfa6-ce66-4859-ba8b-fccb7abcca9f" />

*Default credentials granting access to the Halo management interface.*

This is the security equivalent of leaving the keys in the ignition of an armored vehicle — in a public parking lot — with the engine running.

## From Dashboard to Shell

Access to the management interface was already bad. But we weren't done.

While exploring the dashboard's functionality, we identified a parameter that accepted user input and passed it directly to the underlying operating system. The input wasn't sanitized. It wasn't validated. It wasn't escaped. It was simply **concatenated into a shell command and executed.**

The classic command injection pattern: append a semicolon followed by any command, and the server would dutifully execute it.

```
;<command>
```

That's it. No encoding tricks, no filter bypasses, no exploitation framework. Just a semicolon and whatever you wanted the server to do.

*The vulnerable parameter accepting arbitrary input without sanitization.*

## Root. On a Military Drone Chipset.

We injected a simple identity command to confirm execution context. The response came back clean and immediate:

**We were root.**

<img width="1532" height="426" alt="image" src="https://github.com/user-attachments/assets/48a9eb44-126d-4f52-bdcf-a0130924d43c" />

*Command execution confirmed — running as root on the Elsight Halo.*

Not a low-privilege service account. Not a sandboxed container. **Root** — the highest privilege level on the system, with unrestricted access to every file, every process, every network interface, and every connected component.

The implications of root access on a device like this are staggering:

- **Full device takeover** — modify firmware, alter routing tables, install persistent backdoors
- **Intercept drone communications** — read, modify, or inject data into the bonded connection streams
- **Pivot into connected infrastructure** — the Halo doesn't operate in isolation; it bridges drone systems to ground control stations and command networks
- **Disrupt active operations** — sever drone connectivity mid-mission, causing loss of control in potentially dangerous scenarios
- **Intelligence harvesting** — extract mission data, flight telemetry, video feeds, and operational parameters

This isn't a theoretical attack chain. Every one of these steps is a direct consequence of the access we obtained, with zero additional exploitation required.

## The Chain: Three Failures, One Catastrophe

What makes this vulnerability particularly alarming is that it isn't a single bug — it's a **chain of three independent security failures**, each of which should have been caught, and any one of which would have prevented exploitation:

**1. Network exposure.** The management interface was reachable from the internet. A simple firewall rule or VPN requirement would have made the device invisible to external attackers.

**2. Default credentials.** Even with network exposure, unique or randomly generated credentials per device would have stopped unauthorized access. Instead, every unit shipped with the same factory-default username and password.

**3. Command injection.** Even with default credentials, proper input sanitization in the management interface would have prevented arbitrary command execution. The parameter was passed raw to a shell, with no validation whatsoever.

Three layers of defense. Three failures. The result: unauthenticated remote code execution as root on hardware embedded in military drones.

## Key Takeaways

**Default credentials in 2022 are inexcusable.** This isn't a 1990s router. This is a defense-grade communication chipset. Every device should ship with unique credentials, ideally requiring a mandatory password change on first login. The fact that factory defaults were left unchanged on internet-facing deployments represents a catastrophic operational security failure.

**Management interfaces must never face the internet.** Network segmentation is not optional for critical infrastructure. Management planes should be isolated behind VPNs, jump boxes, or at minimum IP whitelists. Exposing them directly is an invitation for exploitation.

**Input sanitization is not negotiable.** Any parameter that touches a shell must be treated as hostile. Allowlisting, parameterized commands, and strict input validation are baseline requirements — not advanced security features.

**IoT and embedded systems in defense need the same scrutiny as enterprise software.** The security bar for a device that flies on military drones should be higher than a consumer webcam, not lower. Yet here we are, with a command injection vulnerability that wouldn't pass a first-year security audit.

## Disclosure

The vulnerability was immediately reported to the Elsight security team. They acknowledged the issue and worked on developing a patch.

**CVE-2022-36784** was assigned to track this vulnerability.

## References

- [CVE-2022-36784 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-36784)
- [Elsight Halo Product Page](https://www.elsight.com/halo/)
