---
layout: post
title: "Shai Hulud Returns: Keyv and the Caching Ecosystem Hit in a Self-Replicating NPM Attack"
date: 2026-08-04
category: research
severity: "Critical"
affected: "keyv / cacheable npm family"
vendor: "keyv"
topics: ["Supply Chain"]
tags: ["supply-chain", "npm", "shai-hulud", "keyv", "worm", "C2", "credential-harvesting"]
---

<img width="1672" height="941" alt="Shai Hulud Returns — Keyv supply-chain attack" src="/assets/images/shai-hulud-returns-keyv-caching-ecosystem-1.png" />

Originally published on [Bloom Security](https://bloom.security/blog/shai-hulud-returns-keyv-caching-ecosystem-self-replicating-npm-attack).

## TL;DR

A new wave of the Shai-Hulud npm worm has compromised the keyv / cacheable family of packages — dependencies that together pull well over 2 billion downloads per month.

- **Credential Harvesting:** The malicious versions harvest developer and CI credentials, cloud secrets, and crypto wallets.
- **Worm Propagation:** They then use any stolen npm token to publish themselves into more packages.

## What Actually Happened?

The Shai-Hulud campaign represents a massive supply-chain attack where threat actors hijacked developer accounts managing foundational open-source npm packages downloaded over 2 billion times a month. By quietly injecting malicious code into these trusted libraries, any developer or automated pipeline updating their dependencies unwittingly pulled in the infection.

To ensure operational longevity and resilience against security takedowns, the creators concealed their command-and-control server resolution inside blockchain smart contracts. This Web3-backed mechanism allowed the malware to dynamically resolve its active C2 servers without relying on static domains that defenders could easily block or sinkhole.

What made this outbreak particularly destructive was its automated "worm" behavior. The moment an infected package landed on a system, the malware scanned for local publishing tokens and immediately hijacked the victim's own software projects — automatically publishing compromised updates to their code and triggering an exponential, self-propagating chain reaction across the entire software ecosystem.

## Attack Kill Chain

### Stage 1: Loader Execution (`preinstall` hook)

**01.** Triggers `node setup.mjs` automatically on any `npm install`.

<img alt="Step 01 — setup.mjs preinstall hook" src="/assets/images/shai-1.jpg" />

**02. Runtime Verification:** Checks for a local `Bun` binary. If unavailable, downloads and unzips `bun-<plat>.zip` from GitHub.

<img alt="Step 02 — Bun runtime download" src="/assets/images/shai-2.jpg" />

**03.** Executes `bun Math_Symbol.js` to initiate Stage 2. Runs via the Bun runtime to bypass standard Node.js security monitoring.

<img alt="Step 03 — bun Math_Symbol.js" src="/assets/images/shai-3.jpg" />

### Stage 2: Payload Fetch & Drop (Bun execution)

**01. Fetch:** Leverages `crypto` and `https` to download the ~100 MB payload from C2 infrastructure.

**02. Disk Drop:** Writes the binary payload directly to disk via `fs/promises`.

<img alt="Disk drop of the ~100 MB payload" src="/assets/images/shai-4.jpg" />

**03. Execution:** Spawns and executes the dropped binary using `child_process`.

## Malware Architecture & Dynamic Execution Findings

### Smart Contract-Based Payload Delivery (C2 Resolution)

The malware leverages a decentralized smart contract as a dead-drop resolver for its C2 infrastructure. Instead of relying on static IPs or domains, the loader queries a blockchain contract to resolve the active C2 server (e.g., `npm-cache.com`). From there, it fetches the primary ~100 MB binary payload directly to disk. This Web3 delivery mechanism grants full operational resilience, allowing attackers to rotate payload infrastructure without modifying the npm package.

### Post-Exploitation & Credential Harvesting

Runtime analysis reveals that once executed, the binary performs deep file access and memory extraction targeting high-value assets across the system:

**Developer Tokens & Local App Storage**

Extracts and live-validates `.npmrc` tokens, GitHub credentials, and Stripe/Slack keys. It also scrapes local app state from Discord (`LevelDB`) and Telegram Desktop (`tdata`). On GitHub Actions runners, it dumps process memory directly.

<img alt="Developer tokens and app storage findings" src="/assets/images/shai-e-1.jpg" />

**Cloud Infrastructure & System Files**

Targets AWS credentials (`~/.aws/credentials`, IMDSv1/v2), GCP configs (`/root/.config/gcloud`), Kubernetes tokens, Vault stores, environment variables (`/proc/self/environ`), and privileged system hashes (`/etc/shadow`).

<img alt="Cloud infrastructure findings" src="/assets/images/shai-e-2.jpg" />

**Crypto Wallets & Keystores**

Scans for local wallet datastores including Ledger Live, Exodus, Electrum / Electrum-LTC, Atomic Wallet, and raw Ethereum keystores (`.ethereum/keystore`).

<img alt="Crypto wallet targets" src="/assets/images/shai-e-3.jpg" />

**High-Entropy C2 Exfiltration**

Stolen artifacts are packed into encrypted, high-entropy POST payloads and exfiltrated directly to `npm-cache.com/router`.

<img alt="C2 exfiltration payload findings" src="/assets/images/shai-e-4.jpg" />

**OS-Aware Filesystem & Artifact Scanning**

Executes roughly 200 OS-aware (macOS/Linux) glob patterns to harvest `.env` files, private key stores (`*.pem`, `*.key`, `*.pfx`), SSH keys, Terraform state, Docker credentials (`docker/config.json`), KeePass vaults (`*.kdbx`), VPN configs, and IDE settings (`.vscode`, `.claude/settings.json`).

<img alt="Generic filesystem scanning findings" src="/assets/images/shai-e-5.jpg" />

**Conditional Persistence & Secondary Infection**

Executes conditionally: if no valid GitHub tokens are discovered on the host machine, this stage is entirely bypassed. When valid credentials are present, the payload leverages them to inject malicious setup files across eligible repository branches, targeting Claude and VS Code configurations (`.claude/settings.json`, `.claude/setup.mjs`, `.vscode/tasks.json`, `.vscode/setup.mjs`). This establishes a secondary persistence route triggered by future IDE activity, alongside a token-monitoring handler that maintains access or triggers destructive routines if revoked.

<img alt="Persistence and secondary repository infection findings" src="/assets/images/shai-e-6.jpg" />

## Key Takeaways & Immediate Remediation Plan

**Assume any environment that executed affected versions of keyv, flat-cache, or related packages is fully compromised. Prioritize immediate credential revocation over simple package updating.**

**Audit Lockfiles & Pin Safe Versions**

Inspect `package-lock.json`, `yarn.lock`, and `pnpm-lock.yaml` across all projects. Immediately downgrade or purge affected dependencies and enforce strict version pinning. Use `npm install --ignore-scripts` in untrusted pipeline runs.

**Rotate All Exposed Tokens & Cloud Credentials**

Immediately revoke and regenerate all npm auth tokens, GitHub PATs/OAuth tokens, AWS access keys, GCP service accounts, and Slack/Stripe API keys accessible from affected developer machines or CI/CD runners.

**Secure CI/CD Pipelines & OIDC Integrations**

Flush GitHub Actions secrets and invalidate active runner OIDC session tokens. Ensure build environments do not share persistent disk space or privileged IAM roles across unvetted pull requests.

**Endpoint Hunt & Crypto Asset Protection**

Search developer endpoints for unexpected Bun binary downloads, `Math_Symbol.js` executions, or outbound HTTPS traffic to C2 resolvers like `npm-cache.com`. Immediately transfer assets from any local crypto wallets (e.g., Ledger Live, Exodus, Electrum) present on impacted hosts.
