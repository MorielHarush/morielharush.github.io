---
layout: post
title: "LiquidOverflow — How a Template Engine Exposed 86,000 Repositories to Arbitrary File Read"
date: 2026-03-11
cve: "CVE-2026-30952"
severity: "High"
cvss: "8.7"
affected: "LiquidJS < 10.25.0"
---
<img width="1380" height="752" alt="image" src="https://github.com/user-attachments/assets/03fcff83-38c9-40a7-b599-d2006dd1f2f6" />

Templating engines are the silent workhorses of the web. They sit between your data and your users, quietly rendering pages, emails, and layouts millions of times a day. We trust them implicitly — they're just string formatters, right? But when a templating engine starts reading files it was never supposed to touch, your "string formatter" becomes a full-blown intelligence asset for an attacker.

This is the story of how a single path traversal flaw in **LiquidJS** — one of the most widely adopted JavaScript templating libraries — put over **86,000 repositories** and some of the biggest names in tech at risk.

## The Quiet Giant

If you haven't heard of [LiquidJS](https://github.com/harttle/liquidjs), you've almost certainly used something that depends on it. Originally inspired by Shopify's Liquid template language, LiquidJS is the go-to engine for rendering dynamic content in Node.js applications, static site generators like Eleventy (11ty), headless CMS platforms, and countless internal tools.

The numbers speak for themselves: **86,157 repositories** and **639 packages** depend on LiquidJS. And these aren't hobby projects sitting in forgotten corners of GitHub. The dependency tree includes:

- **freeCodeCamp** — the world's largest open-source learning platform, serving millions of learners
- **Datadog** — the industry-standard monitoring and observability platform
- **Apache Airflow** — the backbone of data orchestration at scale
- **NHS Digital** — the UK's National Health Service digital infrastructure
- **Storyblok** — a leading headless CMS powering enterprise content delivery
- **Eleventy (11ty) ecosystem** — the foundation of thousands of JAMstack sites
- **Apple** - Embedding Atlas provides interactive visualizations for large embeddings

When a library this deeply embedded has a vulnerability, it's not a bug report — it's a supply chain event.

## Down the Rabbit Hole

My research partner **Maor Caplan** and I were auditing how popular templating engines enforce filesystem boundaries. The premise was simple: if a template engine allows `include`, `render`, or `layout` tags to pull in external files, what happens when an attacker controls the path?

LiquidJS provides a `root` configuration option — a list of directories the engine is allowed to read from. Administrators use this to sandbox template resolution, ensuring that templates can only reference files within a trusted directory like `/app/templates/` or `/tmp`.

The assumption is straightforward: if you set `root: ['/tmp']`, the engine should never read anything outside `/tmp`. Period.

We found that assumption was wrong.

## The Flaw: When Boundaries Don't Bind

Deep inside LiquidJS's file resolution logic, the `layout`, `render`, and `include` tags handle template paths through a lookup mechanism that resolves filenames against the configured root directories. But there was a critical oversight in how **absolute paths and directory traversal sequences** were validated.

When a template path like `../../../etc/passwd` was passed to one of these tags, the engine would:

1. Attempt to resolve the path against each root directory
2. Fall back through a chain of resolution strategies
3. **Fail to verify whether the final resolved path still resided within the root boundary**

The fallback mechanism was designed to be helpful — to find templates even when paths were slightly off. Instead, it became an escape hatch. By crafting a path with enough `../` sequences, an attacker could climb out of the sandbox entirely and land anywhere on the filesystem.

No authentication required. No user interaction needed. No special conditions. Just a controlled template variable and the keys to the kingdom.

## Proof of Concept: Three Lines to /etc/passwd

The exploitation is devastatingly simple:

```javascript
const { Liquid } = require('liquidjs');

const engine = new Liquid({
  root: ['/tmp'],
  partials: ['/tmp'],
  dynamicPartials: true
});

engine.parseAndRender('{% raw %}{% include page %}{% endraw %}', { page: '../../../etc/passwd' })
  .then(output => console.log(output.slice(0, 500)));
```

<img width="829" height="349" alt="image" src="https://github.com/user-attachments/assets/f0dc366a-0ece-441f-a160-b309cda53031" />

That's it. Despite the root directory being explicitly locked to `/tmp`, the engine happily traverses up to `/etc/passwd` and dumps its contents. The `dynamicPartials` option — commonly enabled for flexible template systems — allows the `page` variable to be attacker-controlled, turning a template render call into an arbitrary file read primitive.

In real-world scenarios, this means:

- **Reading secrets and credentials** — environment files, API keys, database configs, private keys
- **Cloud metadata exfiltration** — on cloud instances, reading files like `/proc/self/environ` exposes runtime secrets
- **Source code theft** — reading application source files to discover further vulnerabilities

## The Blast Radius: 86,000 Dominos

Let's talk about what "86,157 dependent repositories" actually means in practice.

When **freeCodeCamp** uses LiquidJS, every learner interacting with their platform is one malicious template away from a data breach. When **Datadog** integrates it into their pipeline, the monitoring infrastructure that companies trust to *detect* attacks becomes the attack surface itself. When **Apache Airflow** — the orchestration backbone of data engineering at companies like Airbnb, Spotify, and Twitter — depends on a vulnerable template engine, the DAGs that move your data could be leaking your secrets.

This is the terrifying math of supply chain security: **one vulnerability × 86,000 repositories = an industry-wide exposure event.**

And these are just the direct dependents. Each of those 639 packages that wraps LiquidJS carries the vulnerability further downstream, multiplying the exposure into hundreds of thousands of transitive consumers who may never even know LiquidJS exists in their dependency tree.

## The Fix

The remediation required the engine to enforce a strict invariant: **after resolving any template path, the final absolute path must begin with one of the configured root directories.** No exceptions, no fallbacks, no creative resolution.

This is a classic case of "allowlist, don't blocklist." Instead of trying to catch every traversal pattern (`../`, encoded variants, symlinks), the fix ensures that the *result* of resolution is validated, not the *input*.

Upgrade to **LiquidJS 10.25.0** or later, which includes the path validation fix.

## Key Takeaways

**Sandboxes Must Be Enforced at the Output, Not the Input.** Validating user-supplied paths before resolution is insufficient. The only safe approach is to resolve the path fully and then verify the resolved path is within the allowed boundary. Input sanitization is a speed bump; output validation is a wall.

**Template Engines Are a Forgotten Attack Surface.** Security teams obsess over SQL injection and XSS but rarely audit the templating layer. When a template engine can read files, it is a file-read primitive — and should be threat-modeled accordingly.

**Supply Chain Depth Amplifies Everything.** A vulnerability in a library with 86,000 dependents isn't 86,000 times worse — it's *exponentially* worse, because each dependent is a new context with its own users, its own secrets, and its own downstream consumers. The dependency graph isn't a list; it's a blast wave.

**"Dynamic" Features Are Attacker Features.** Options like `dynamicPartials` exist for developer convenience, but they hand template path control to whatever data flows into the render call. Every dynamic feature is an implicit trust decision — and if that trust is misplaced, it becomes a vulnerability.

**Audit Your Transitive Dependencies.** If you're running `npm ls liquidjs` right now and seeing it nested three levels deep in a package you've never heard of — that's the point. Supply chain security isn't about the packages you choose; it's about the packages your packages choose.

## Disclosure Timeline

| Date | Event |
|---|---|
| February 2026 | Discovery by Moriel Harush and Maor Caplan |
| February 2026 | Vulnerability disclosed to LiquidJS maintainers |
| March 2026 | CVE-2026-30952 assigned; GHSA-wmfp-5q7x-987x published |
| March 2026 | LiquidJS 10.25.0 released with path traversal fix |

We would like to thank the LiquidJS maintainer **@harttle** for addressing this vulnerability, and **Maor Caplan** for his collaboration throughout the research and disclosure process.

## References

- [GHSA-wmfp-5q7x-987x — GitHub Security Advisory](https://github.com/harttle/liquidjs/security/advisories/GHSA-wmfp-5q7x-987x)
- [CVE-2026-30952 — NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-30952)
- [CVE-2026-30952 PoC Repository](https://github.com/MorielHarush/CVE-2026-30952-PoC)
- [LiquidJS Dependents — 86,000+ Repositories](https://github.com/harttle/liquidjs/network/dependents)
