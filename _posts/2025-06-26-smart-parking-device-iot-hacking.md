---
layout: post
title: "From Gate Opener to Full Control: Hacking a Smart Parking Device"
date: 2025-06-26
category: research
tags: ["IoT", "hacking", "RCE", "IDOR", "OTP bypass"]
---
<img width="720" height="720" alt="image" src="https://github.com/user-attachments/assets/578859d5-fae0-4f1d-8fbe-ab4bc6193c01" />

When I moved into my new apartment, I was excited. A fresh start, a great location, and — best of all — a private parking lot.

There was just one small problem: the gate remote.

My landlord promised he'd get me a clicker to open the gate "in a few days." Days became a week. A week became two. And in the meantime, my sport motorcycle — my pride and joy — was parked on the street. Unwatched. Unprotected. I couldn't sleep.

So, I did what any frustrated security researcher might do: I decided to investigate the system behind the gate myself. If I couldn't get in the easy way, maybe I could find another door.

## The Target: A Cloud-Connected Gate Controller

The gate was controlled by a small physical IoT device — a commercial product used in many residential buildings. Residents can open the gate by calling a dedicated phone number. Simple enough.

After some basic reconnaissance, I discovered that the device was connected to cloud infrastructure maintained by the company. That meant all customer data, user logic, authentication flows, and gate control commands were centralized in their cloud platform.

This wasn't just a gate — it was an entry point into a wider, remotely managed ecosystem.

## It All Started With an Android App

The gate system was also accessible via a mobile app, so I downloaded it on my Android device, which I use for research and testing.

There was only one option available: register with a phone number.

Simple enough — except my number wasn't recognized. The app politely told me I wasn't associated with any account or authorized to control a gate.

But rather than give up, I got curious. I started interacting with the registration process — trying to understand what checks were being performed, what APIs were being called behind the scenes, and how the app communicated with the backend.

That's when things began to unravel.

By inspecting the registration flow, I found endpoints that were too permissive, responses that revealed too much, and eventually, ways to escalate my access far beyond what should've been possible for an "unauthorized" user.

## Playing With the Registration Flow — Leads to OTP Bypass

During the registration process, the app prompted me to enter a phone number. Naturally, mine wasn't associated with any gate in the system — so I couldn't proceed and no OTP arrived on my phone.

But instead of giving up, I decided to intercept the server's response and see how the app handled different status codes.

Using Burp Suite's Match & Replace feature, I modified the response body sent from the server. Originally, the server returned a **350 response** — indicating that the number wasn't valid or authorized.

<img width="720" height="279" alt="image" src="https://github.com/user-attachments/assets/8bcee588-e061-4b41-b71a-0f1e29f2d62c" />
*The server returning a 350 status — number not authorized.*

I changed it to a **200**.

<img width="720" height="382" alt="image" src="https://github.com/user-attachments/assets/2775abfe-f17e-4121-8dab-dbaf20e94111" />
*Forging the server response from 350 to 200 using Burp Suite.*

And it worked.

<img width="720" height="251" alt="image" src="https://github.com/user-attachments/assets/6fda8955-32d5-4324-a5d7-ca84fb815068" />
*The app accepted the forged response and let me proceed.*

The app happily accepted the fake success response and let me continue the onboarding process. In doing so, I **bypassed the OTP mechanism entirely**.

At this point, I was able to register any phone number I wanted in the system — whether or not it had ever been associated with a real gate.

But the story didn't end there.

I could register a phone number, but since no gate was linked to my number, this access didn't help me unlock my parking gate.

Still, I had already stepped through a door the developers never meant to open — and I wasn't going to stop just yet.

## A "Language" Parameter That Spoke Too Much — Leading to Remote Code Execution

Once I bypassed the OTP step by forging the server response, I was able to proceed with the user registration flow — as if I were a legitimate user.

During the registration process, I noticed a parameter named `language` being sent in the payload. At first glance, it seemed harmless — just a way to set the app's localization.

But something felt off.

I began manipulating the `language` value with various payloads, and the server didn't complain. No errors, no sanitation. So I decided to go one step further: I used **Burp Collaborator**.

For those unfamiliar, Burp Collaborator is a powerful tool that security researchers use to detect Out-of-Band (OOB) interactions. It helps uncover vulnerabilities where the server reaches out to an external domain — a sign that it might be evaluating or executing user-supplied input.

<img width="720" height="215" alt="image" src="https://github.com/user-attachments/assets/2ff565cd-f1b9-41e8-9dd2-29f9ed289123" />
*Injecting a command payload through the "language" parameter.*

And sure enough — the Collaborator client received a DNS query from the backend server.

<img width="720" height="158" alt="image" src="https://github.com/user-attachments/assets/1fe0f21a-52e5-4ab4-be9b-4551ec15f1b4" />
*DNS callback received from a host labeled "serverpilot" — confirming code execution.*

In fact, the lookup came from a hostname labeled `serverpilot`, which strongly indicated that the backend system executed my payload, or at the very least processed it in a dangerous way.

This confirmed a **Remote Command Execution (RCE)** vector — allowing an attacker to run system-level commands on the infrastructure behind the cloud service, just by tweaking a registration parameter.

This was no longer just about opening a gate — it was about controlling the system that controls the gates.

## Brute Forcing My Way to the Right Gate — Leading to IDOR

Having already proven that the OTP validation could be bypassed and that arbitrary commands could be executed on the server, I decided to keep going through the registration process — step by step.

Eventually, I reached a stage where the server required two parameters:

- `userId`
- `activationCode`

The `activationCode` was supposed to be presented to a legitimate user who was linked to a real gate. I didn't have one. But given the broken logic I'd seen so far, I had a hunch: what if this field isn't properly validated either?

So I input a random activation code and guessed a `userId`.

To my surprise, the server didn't reject the request outright. Instead, it returned a structured JSON containing metadata — including **phone numbers authorized to open a gate**.

That's when I realized: if I brute-force different `userId`'s and ignore the activation code check (which clearly wasn't enforced server-side), I could enumerate valid users and extract sensitive gate access data.

<img width="720" height="212" alt="image" src="https://github.com/user-attachments/assets/9f0150ee-cede-478f-98db-7ee5b63ec822" />
*Enumerating user IDs to extract authorized phone numbers and gate metadata.*

## From Coordinates to Physical Location

Still, I had one big problem: how would I know when I found *my* gate?

Luckily, the server response included more than just phone numbers — it also contained geographic markers like:

- `lat`
- `lng`

Using those coordinates, I built a simple Python script to plot and estimate the physical location of each discovered gate on a map.

After iterating through enough `userId` values, I eventually found a match near my building.

<img width="720" height="212" alt="image" src="https://github.com/user-attachments/assets/2e9429d6-dcd0-492c-a32e-ea108a8a57d8" />
*Bingo. Plotting the GPS coordinates revealed my gate's exact location.*

And now, I had the phone number that the system would recognize as authorized to open it.

## One Final Trick: Call Spoofing

Of course, my own number still wasn't authorized, and I didn't want to compromise anyone's real account.

Instead of taking over someone's phone number or doing anything destructive, I took an ethical route: I used **call spoofing**.

By spoofing my caller ID to match the authorized number, I was able to dial the gate's number — and it opened.

No remote, no registration, no landlord.

Just a combination of weak server-side validation, poor authentication logic, and a bit of creativity.

## Key Takeaways

**Never trust client-side validation.** This entire flow relied on front-end enforcement of security checks.

**Gate control is physical access.** Vulnerabilities like these can pose real-world security risks — not just digital ones.

**Respect the boundary.** I deliberately avoided hijacking accounts or accessing private areas that weren't mine. The goal was understanding, not exploitation.

## Responsible Disclosure: Doing the Right Thing

While this research started from personal frustration — wanting to park my motorcycle safely — it quickly turned into a deep dive into a vulnerable ecosystem that controls physical access to real places.

Once I realized the severity of the findings, I knew this had to be reported properly.

I documented the entire attack chain, gathered all the relevant evidence, and submitted a detailed disclosure through **Israel's National Cyber Directorate (INCD)** — the official authority responsible for coordinating and handling cybersecurity incidents in the country.

I'm happy to report that:

- The vulnerability was acknowledged
- The company responsible for the product took the issue seriously
- Remediation steps were implemented, including hardening of server-side checks, restricting access to sensitive APIs, and improving registration logic

The entire process was handled professionally, and at no point did I publish or misuse any real user data. The goal was — and still is — to improve security where it matters most.

Oh, and my motorcycle is safe.
