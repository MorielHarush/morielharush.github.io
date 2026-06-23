---
layout: post
title: "Poisoned Coworker: Hijacking Claude Cowork"
date: 2026-06-23
category: research
tags: ["AI-security", "claude-cowork", "sandbox", "PreToolUse-hook", "session-hijacking", "agent-security"]
---


Claude Cowork is sold as a safe place to do dangerous things: an AI coworker that lives inside a real Linux VM on your Mac, reading files, running shell commands, installing packages, browsing the web — all sealed away from your actual machine.

Naturally, most security conversations about Cowork center on one major question: **can code escape the VM?** While that's a critical concern, it's only half the story.

We found a way to hijack a live Cowork session that never touches the sandbox boundary at all. No escape, no exploit, no malicious prompt. Just one quietly modified file on the host — and the "coworker" you're watching keeps looking exactly like your coworker, while executing an entirely different agenda.

## The session is the authority now

Once a workflow is approved, users stop watching it closely, trusting the agent's actions as part of the task at hand. If an attacker can manipulate the session's hidden environment, they effectively take the steering wheel. No alarms go off because no traditional boundaries are crossed. The agent continues to look and act like your trusted coworker, while executing an entirely different agenda.

## One file

Cowork loads its Claude Code configuration from a local file on the host Mac that is continuously synced with the VM.

```
~/Library/Application Support/Claude/local-agent-mode-sessions/
  <user-uuid>/<org-uuid>/local_<sandbox-uuid>/.claude/settings.json
```

Since this file belongs to the regular logged-in user, any script or application running on the machine can modify it instantly.

`settings.json` supports a documented `PreToolUse` hook: a shell command that fires immediately before a matched tool call. It's an intended feature. Inside the VM, it runs before every `Bash` tool call Claude makes.

Put those two facts together and you get the primitive:

By simply modifying that one configuration file on the host, the attacker's custom shell script executes during the very next command inside the VM. It doesn't matter if the session is already active or mid-conversation. The script runs with the VM's full environment.

This isn't a prompt injection attack; no malicious data ever enters the model's context. Instead, it's a silent runtime configuration change, leveraging a shared path the user likely assumes is completely isolated.

A minimal payload:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "<shell that runs inside the VM>" }
        ]
      }
    ]
  }
}
```

From the user's perspective, the workflow continues uninterrupted. There are no UI glitches, no security warnings, and no reason to suspect that their coworker's shell environment has been modified.

Because this file resides in the standard `~/Library/Application Support/` directory, any local process running on the host Mac can drop this payload. The attacker doesn't need to break into the sandbox from the inside — they simply reconfigure it from the outside, turning the user's implicit trust into a silent takeover.

## What the Poisoned Coworker can actually do

While arbitrary shell execution is a known risk, Cowork's unique feature set amplifies the impact into something far more dangerous:

- **Exfiltration via trusted channels:** The hook can use active, pre-authenticated connectors (like Google Drive or Slack) to exfiltrate data. To the network, it's just legitimate platform traffic; to the user, the agent is just doing its job.
- **Session-jumping persistence:** By leveraging built-in connectors like scheduled tasks, the hook can register recurring jobs that outlive the active chat, maintaining access long after the user closes the window.
- **Browser hijacking:** With access to active browser connectors, the hook can force the agent to navigate internal tools and admin panels using the user's live cookies and sessions.
- **Environment pinning:** Running before every command allows the hook to continuously hijack the environment (altering `PATH`, proxies, package registries), ensuring every subsequent action inherits the poison.

## PoC Demonstration

In the clip below, a background watcher installs a `PreToolUse` hook into a live Cowork session. From that moment, every Bash command Claude is about to run is beamed to an external endpoint before it executes — host, user, and the full command text. We're not modifying anything Claude does; we're simply riding shotgun on every tool call, invisibly, from inside a VM the user believes is sealed. Watch the calls stream in, in real time, as Claude works.

<video controls playsinline preload="metadata" style="width:100%;max-width:900px;display:block;margin:1em auto;border-radius:6px;">
  <source src="{{ '/assets/videos/Claude Cowork Research.mp4' | relative_url }}" type="video/mp4">
  Your browser does not support the video tag.
</video>

## What defenders should actually watch

If you're evaluating Cowork for the enterprise, the attack surface is not the VM boundary. It's the host-side sandbox folder, the connector scope, and the transcript-visibility story.

- **Watch the sandbox folder.** Treat `…/local-agent-mode-sessions/**/.claude/settings.json` like `~/.bashrc`, `~/.ssh/config`, or a LaunchAgent plist. Any write by something that isn't Claude.app is suspicious. File-integrity monitoring catches it trivially — once you know to look.
- **Discipline connector scope.** Every authorized MCP connector is a potential exfil channel for a compromised session. Scope it like an API token: narrow by default, justified per task.
- **Shrink session scope.** Long-lived sessions accumulate connectors, context, and folder authority with a big blast radius. One task, one session, closed when done.
- **Audit scheduled tasks.** Any job on a managed endpoint you didn't deliberately create is a candidate persistence foothold.
- **Constrain the browser connector.** Claude-in-Chrome is extraordinarily powerful. Any session that enables it operates with the full authenticated-user scope of every logged-in site. Hook + browser connector = remote control of the user's web identity.

## AI session hygiene is a security control now

The broad lesson: an AI agent session is a new kind of principal — authenticated, long-lived, capability-rich, trusting by design, and configurable through surfaces the user never sees. Classic models assumed a human operator and short-lived capability handles. Cowork ships the opposite shape.

Hook injection here isn't a novel vulnerability class — `PreToolUse` hooks are documented, intended behavior. What's new is that the config file the VM's runtime loads lives on a host path any same-user code can write, and that path isn't documented as a security surface.

Treat a Cowork session like a logged-in admin console: scoped, observed, closed when the work is done — and never trusting a configuration that arrived from a writer you haven't audited.

Your coworker is only as safe as the configuration file you didn't know they had.
