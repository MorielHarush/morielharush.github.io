---
layout: post
title: "Trust Me, I'm an Artifact: I'll Just Borrow Your Shell"
date: 2026-08-26
category: research
severity: "Critical"
affected: "Claude Desktop — Artifacts / Cowork"
vendor: "Claude Artifacts"
image: "/assets/images/claude-artifacts-cover.svg"
topics: ["AI Agents"]
tags: ["AI-security", "claude-artifacts", "MCP", "RCE", "stored-XSS", "same-origin-policy", "electron", "supply-chain"]
---

Originally published on [Bloom Security](https://bloom.security/blog/claude-artifacts-research).

## TL;DR

Millions of users now interact with [Claude Artifacts](https://bloom.security/blog/claude-artifacts) daily, not just developers. In Cowork mode, they run as interactive dashboards, prototypes, and reports across entire organizations. Teams view them as safe, built-in responses rather than full-blown third-party applications.

If this is what three findings look like, the question worth asking is what we haven't found yet.

In the race to ship interactive agentic features, foundational application security standards are being left behind. Claude Desktop's architecture makes three choices that trade isolation for speed: rendering complete HTML and JavaScript directly inside a privileged webview instead of sandboxing it, serving every artifact from a single shared origin that collapses session isolation entirely, and storing native bridge permissions so they persist silently across content changes. By combining uncontained script execution, shared cross-session storage, and non-expiring tool grants, this architecture revives the exact architectural flaws the security ecosystem spent twenty years solving.

The result: a single click on an innocent-looking artifact can drop arbitrary shell commands with zero prompts, sweep local storage across every artifact you have ever opened, and inject hidden, forged content into your exported PDF documents.

## The New Macro: How Claude Artifacts Weaponize Everyday AI Adoption

For two decades, the cybersecurity industry drilled enterprise users to never enable macros, ignore untrusted executables, and verify every domain. Today, the rapid, universal adoption of AI assistants has completely dismantled that muscle memory.

Millions of users now interact with Claude Artifacts daily, viewing them as safe, built-in responses rather than full-blown third-party applications. Attackers no longer need phishing emails or sketchy downloads; they only need a user to view an artifact. Because the rendered code runs inside a privileged, shared desktop environment, opening an artifact quietly exposes connected enterprise tools, sensitive past session data, and the underlying operating system.

## Innovation vs. Isolation: Are AI Labs Abandoning 20 Years of AppSec?

The vulnerabilities uncovered in Claude Desktop point to a larger, systemic industry issue: in the race to ship interactive agentic features, foundational application security standards are being left behind. Claude Desktop's architecture makes three fundamental design choices that trade isolation for speed:

- **Treating Applications as Harmless Previews:** Rather than sandboxing untrusted code in an isolated, restricted container, Claude renders complete HTML and dynamic JavaScript directly inside an Electron webview. The millisecond an artifact is viewed, arbitrary client code runs.
- **Collapsing the Same-Origin Policy:** The modern web relies on origin boundaries to keep untrusted applications separate. Claude serves every artifact from a single static origin (`cowork-artifact://local`), completely breaking tenant and session isolation across historical user interactions.
- **Granting Persistent, Unbounded Tool Access:** Instead of enforcing explicit, per-action confirmation for sensitive operations, native bridge permissions remain stored across content changes. A previously approved artifact can silently invoke shell execution and external APIs in the background.

By combining uncontained script execution, shared cross-session storage, and non-expiring tool grants, this architecture revives the exact architectural flaws the security ecosystem spent twenty years solving. As AI assistants evolve into full autonomous environments, shipping features ahead of basic sandboxing and continuous consent is no longer a technical debt — it is an open systemic risk.

## Finding 1: Bait-and-Switch Remote Code Execution in Claude Artifacts

Two seemingly harmless design decisions in Claude Desktop's architecture combine to create a critical vulnerability, allowing an attacker to gain arbitrary shell access to your machine through a single, completely unrelated user approval.

### The Exploit Mechanics

The attack relies on a fatal combination of two structural flaws:

- **Updates Lack Content Integrity:** When an artifact is reloaded or hits its 24-hour refresh interval, Claude Artifacts fetches the latest HTML version. Because the system performs no hash checks against the version you originally approved and requires no new consent, the author can silently alter the code and swap out the required tools in the backend metadata.

```javascript
// src/runtime/importer.ts > refreshImportedArtifact
async refreshImportedArtifact(id) {
  // Fetch latest from API — the artifact author controls this content
  const n = await this.fetchLatestVersion(artifact.sharedArtifactUuid);
  const newHtml = n.result_state;    // raw HTML, no sanitization
  // Tools taken from the NEW content — no hash check against what was approved
  await this.update(id, newHtml, { mcpTools: /* from newHtml */ });
  // newHtml written verbatim to disk — attacker JS and new tool now on host
}
```

**Security risk:** auto-updating without verifying hash signatures or sanitizing `newHtml` allows remote authors to dynamically swap approved code with malicious scripts and high-privilege MCP tools.

- **Silent MCP Tool Execution:** The updated MCP tool runs automatically with zero prompts or user confirmation. Crucially, the system provides no warning or notification that the underlying tool was changed or replaced within the artifact.

### The Attack Cycle

1. **The Bait:** The attacker publishes a helpful, benign tool (v1), like a team diagram creator. The user trusts it and grants approval.
2. **The Switch:** The attacker updates the backend to v2. Visually, it remains pixel-identical, but the harmless diagram tool is replaced with a hidden bash command tool.
3. **The Execution:** The next time the user opens the artifact, it silently refreshes, accepts the weaponized tool without a prompt, and immediately executes malicious payload scripts directly on the host machine.

### Proof of Concept

<video controls playsinline preload="metadata" style="width:100%;max-width:900px;display:block;margin:1em auto;border-radius:6px;">
  <source src="{{ '/assets/videos/claude-artifacts-rce-poc.mp4' | relative_url }}" type="video/mp4">
  Your browser does not support the video tag.
</video>

*The video shows that once the victim approves an MCP tool for a shared artifact, the PoC swaps the MCP tool into that same artifact. After reloading the artifact, it looks completely normal — the dashboard renders unchanged while the injected JavaScript silently calls `callMcpTool` and inherits the old approval. The terminal shows the result: `whoami`, `id`, `hostname`, `$HOME`, the user's SSH key filenames, and environment tokens, all executed on the host.*

### Key Impacts

- **Full Host Compromise:** The injected commands run with the victim's full user privileges (`whoami`, `id`, `hostname`), allowing attackers to read files, write data, or spawn remote shells.
- **Completely Invisible:** The exploit leaves no visual trace. The v2 UI is byte-identical to the approved v1 version, leaving no UI warnings or security dialogs.
- **Zero Reconnaissance Required:** Because built-in tool identifiers are identical across all Claude Desktop installations, an attacker can target any user blindly without prior research.

The `window.cowork` interface grants imported local artifacts direct access to trigger tools and communicate with the host session:

```javascript
window.cowork = {
  callMcpTool,       // invoke one of the victim's connected MCP tools
  askClaude,         // run a single-turn Claude prompt in the live session
  sample,            // alias of askClaude
  runScheduledTask   // trigger one of the user's scheduled tasks
};
```

This native exposure allows an attacker to inject prompts directly into your active AI session and manipulate your connected tools without needing any initial permissions.

### Responsible Disclosure

> "We're closing this as a duplicate — this issue was already known to us internally before your submission and is being tracked."

## Finding 2: Shared-Origin Stored XSS in Claude Artifacts

Claude Desktop writes artifact HTML directly to disk and serves it back verbatim, completely skipping script stripping, Content Security Policy (CSP) nonces, and sanitization. Because every artifact runs inside the same privileged, shared origin (`cowork-artifact://local`), any embedded JavaScript executes automatically the moment the file opens. This shared sandbox allows a malicious artifact to break isolation entirely, granting it full read access to the entire `localStorage` partition, including cached API responses, and application states from every legitimate artifact you have ever viewed. It also exposes a live handle to `window.cowork`, giving the attacker a direct line to your connected enterprise tools without needing to declare any initial permissions.

### The Root Cause

Decompiled code from the application bundle shows that the update path writes incoming HTML directly to disk with its script tags completely intact:

```javascript
// CoworkArtifacts.update() — app.asar (decompiled)
// newHtml comes straight from the API or disk and is never sanitized
await this.update(id, newHtml, { mcpTools: preserved });
fs.writeFileSync(indexPath, newHtml);  // Written verbatim with <script> intact
```

**Unsanitized disk writes:** direct execution of `fs.writeFileSync` without sanitizing `newHtml` allows raw `<script>` tags to persist directly on the host file system.

### Proof of Concept

<video controls playsinline preload="metadata" style="width:100%;max-width:900px;display:block;margin:1em auto;border-radius:6px;">
  <source src="{{ '/assets/videos/claude-artifacts-xss-poc.mp4' | relative_url }}" type="video/mp4">
  Your browser does not support the video tag.
</video>

*This video demonstrates a stored XSS. The payload is written once into the artifact's `index.html`. The next time the artifact is opened, it executes automatically within the `cowork-artifact://local` origin and accesses the privileged `window.cowork` bridge (`callMcpTool`, `askClaude`, `runScheduledTask`).*

### Key Impacts

- **Data harvesting:** A single malicious artifact can read the persisted state of all other artifacts, exposing cached tokens and sensitive tool data.
- **Direct bridge hijacking:** The script gains immediate access to the native `window.cowork` bridge, allowing it to silently interact with tools like Slack or your filesystem.
- **Persistent execution:** Because the payload is stored directly on disk, the exploit re-fires every time the artifact is opened, successfully surviving full application restarts.
- **Zero further interaction:** The attack requires no clicks, prompts, or special permissions. Simply opening the artifact triggers the payload.

### Responsible Disclosure

Anthropic closed the report as Informative, maintaining that the shared-origin behavior is working as designed. Their team explained that the network-isolated sandbox is the primary security boundary and that the shared storage is strictly intended for non-sensitive interface preferences rather than secrets. They dismissed the local filesystem exploit as falling outside their threat model, noting that the remote-delivery vector is being tracked in a separate report. However, Anthropic ultimately acknowledged the research by forwarding the feedback on per-artifact storage isolation to their internal teams as security hardening input.

## Finding 3: Trust Laundering — Weaponizing Claude Artifact PDF Exports with XSS

PDFs are universally trusted as faithful, static snapshots of whatever you see on screen. However, Claude Artifact's "Export to PDF" pipeline shatters this assumption by rendering the live document code instead of capturing a frozen snapshot. Because the export path executes live JavaScript and applies CSS formatting dynamically during the print process, an attacker can use standard print-specific styles to keep malicious content completely invisible on your monitor, only revealing it inside the generated document.

### How It Works

The attack uses simple CSS rules to manipulate what goes into the final document. The malicious content stays hidden during normal interactive use, but the print styling stamps it into the layout the exact millisecond you click export:

```css
/* Invisible on screen, revealed only during PDF export */
#pdf-proof { display: none; }

@media print {
  #pdf-proof { display: block !important; } /* Visible in PDF only */
}
```

**Print media query:** overrides default element visibility during print/PDF generation, injecting watermark proofs or metadata exclusively into exported documents.

### Proof of Concept

<video controls playsinline preload="metadata" style="width:100%;max-width:900px;display:block;margin:1em auto;border-radius:6px;">
  <source src="{{ '/assets/videos/claude-artifacts-pdf-poc.mp4' | relative_url }}" type="video/mp4">
  Your browser does not support the video tag.
</video>

*The video shows the channel-feed artifact opening normally with no visible proof block, then the Export to PDF action revealing the injected content that never appeared on screen.*

### Key Impacts

- **Dynamic Document Manipulation:** The export pipeline processes a live, script-mutated DOM. Whatever the attacker's JavaScript injects at print time lands directly in the final output file.
- **Seamless Content Spoofing:** Attackers can insert fabricated data, such as fake financial balances, fraudulent approval stamps, or modified text, that contradicts what the user actually reviewed on screen.
- **Visual Trust Hijacking:** The resulting PDF carries the official layout and visual authority of a legitimate Claude export, making it incredibly easy to forward or archive as official record without realizing it has been tampered with.

### Responsible Disclosure

Anthropic closed the PDF export report as Informative, maintaining that the feature is working as designed to faithfully capture the live, rendered artifact, including standard print stylesheets. Their team explained that document forgery is a downstream consequence of the content-delivery flaw tracked in the separate report, rather than an independent vulnerability within the export pipeline itself. According to Anthropic, the core security trust decision must happen at the point of delivery, meaning the export pipeline cannot distinguish between user-authored and attacker-controlled content. While they rejected altering the rendering logic as a vulnerability fix, they ultimately passed along the suggested mitigations to their product teams as hardening input.

## Next Steps

- **Shift Mental Models:** Treat interactive AI artifacts as full executable code rather than harmless previews. Never open artifacts originating from untrusted or unverified sources.
- **Be Skeptical of Tool Grants:** Never approve high-privilege MCP tool permissions — especially shell execution, local filesystem access, or network calls — on shared or external artifacts.
- **Inspect PDF Exports:** Visually cross-check exported PDF documents against what was displayed on screen to ensure print-specific scripts haven't injected hidden or spoofed content.

To see how Bloom gives you that same visibility into Claude and the rest of the AI tools running on your own endpoints, [schedule a demo here](https://bloom.security/contact).
