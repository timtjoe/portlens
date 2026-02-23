# Portlens

**Standardize your local development URLs.**

A CLI dev tool that replaces port numbers with stable URLs (e.g., http://my-project.localhost). 

[![npm version](https://img.shields.io/npm/v/portlens.svg)](https://www.npmjs.com/package/portlens)
[![Build Status](https://img.shields.io/github/actions/workflow/status/timtjoe/portlens/tests.yml?branch=main)](https://github.com/timtjoe/portlens/actions)
[![Node Version](https://img.shields.io/node/v/portlens)](https://www.npmjs.com/package/portlens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> [!CAUTION]
> **Active Development & Support**
> Portlens is currently in active development. Networking configurations vary across systems; while designed to be robust, things may behave unexpectedly in complex environments.

---

## Quick Start

You do not need to install the package to test it. Navigate to any web project (Vite, Next.js, etc.) and run:

**Windows (Admin PowerShell):**
```bash
npx portlens

```

**macOS / Linux:**

```bash
sudo npx portlens

```

---

## Core Solutions

* **Eliminate Port Fatigue**: Portlens finds a free internal port (–) automatically.
* **Mental Mapping**: Use project names instead of numbers. Access `dashboard.localhost` and `api.localhost` simultaneously.
* **Native HMR Support**: Built-in WebSocket proxying ensures Vite and Next.js Hot Module Replacement updates work instantly.
* **Zero Config**: Detects your framework and injects the correct `--port` and `--host` flags into your dev script.
* **Smart Failover**: If Port 80 is strictly occupied, it automatically falls back to 8080 or 8888 and notifies you.

---

## Usage Modes

### 1. Standard Mode (Auto-detection)

Run `portlens` inside your project folder. It will scan for `package.json`, identify the framework, and run the default dev script.

### 2. Wrapper Mode (Custom Command)

Wrap any command to give it a custom domain. Useful for Bun, Go, Rust, or custom scripts:

```bash
portlens [custom-name] [command...]

```

*Example:*

```bash
portlens my-api bun run index.ts

```

---

## Troubleshooting: The Doctor

If the URL will not load or you see permission errors, run the diagnostic tool:

```bash
portlens doctor

```

The Doctor checks:

1. **Administrative Privileges**: Verifies the terminal has rights to modify the hosts file.
2. **Port 80 Availability**: Identifies the specific Process Name and PID holding the port (e.g., Docker, Skype, IIS).
3. **Auto-Repair**: Offers to stop the conflicting process for you (including specialized handling for Windows System PID 4).

---

## Configuration

Create a `portlens.json` in your project root for fine-grained control:

```json
{
  "name": "checkout",
  "suffix": ".localhost",
  "targetPort": 4500
}

```

| Field | Description | Default |
| --- | --- | --- |
| `name` | The subdomain prefix to use. | Folder name |
| `suffix` | The domain suffix. | `.localhost` |
| `targetPort` | Force a specific internal port for your dev server. | Automated |

---

## Known Gotchas

1. **Port 80 Conflict**: Portlens lives on Port 80. If Docker Desktop or Nginx is running, they may occupy this. Use `portlens doctor` to fix.
2. **Browser HSTS**: If you have used a domain with HTTPS previously, your browser may force a redirect. Use `.localhost` to avoid most HSTS issues.
3. **VPNs**: Some Corporate VPNs interfere with hosts file resolution.
4. **Windows Privileges**: Always use an Elevated (Admin) terminal on Windows.

---

**Timothy T. Joe** | [GitHub](https://github.com/timtjoe) | [Twitter/X](https://x.com/trillionware)
