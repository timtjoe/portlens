
Portlens is a lightweight, zero-dependency CLI tool that replaces messy port numbers (like `localhost:5173`) with clean, stable URLs (like `http://my-project.localhost`). It sits between your browser and your dev server, automatically managing your system hosts file and proxying traffic so you can focus on code, not network configurations.

Developed by **Timothy T. Joe** ([@timtjoe](https://github.com/timtjoe)).

> [!CAUTION]
> **Active Development & Support**
> Portlens is currently in active development. While designed to be robust, networking configurations vary across systems. Things may break or behave unexpectedly in certain environments.

> [!IMPORTANT]
> **Found a bug?**
> 1. Run `portlens doctor` to check for local configuration issues.
> 2. If it is a tool bug, please **[Open an Issue](https://github.com/timtjoe/portlens/issues)**.
> 3. Include your OS version, framework (Vite, Next, etc.), and the doctor command output.

## Core Solutions

* **Port Fatigue**: Portlens finds a free internal port ($4000$–$4999$) automatically, avoiding "Port in use" errors.
* **Mental Mapping**: Use project names instead of numbers. Access `dashboard.localhost` and `api.localhost` simultaneously.
* **HMR Support**: Native WebSocket proxying ensures Vite, Next.js, and Nuxt "Hot Module Replacement" updates work instantly.
* **Auto-Injection**: It detects your framework and passes the correct `--port` and `--host` flags automatically.
* **Smart Failover**: If Port **80** is strictly occupied, Portlens automatically falls back to **8080**, **8888**, or a dynamic port and notifies you.



## Getting Started

### Installation
```bash
npm install -g portlens

```

### Usage Modes

Portlens requires elevated permissions to modify the system `hosts` file and to bind to Port **80**.

#### 1. Standard Mode (Auto-detection)

Navigate to any web project folder and run:

```bash
sudo portlens

```

Portlens will detect your framework (Vite, Next.js, etc.) and launch the default development script (`npm run dev`) automatically.

#### 2. Wrapper Mode (Custom Command)

Use Portlens as a task runner to wrap specific scripts. This is useful for custom frameworks or non-Node environments (Bun, Go, Rust):

```bash
sudo portlens [custom-name] [command...]

```

*Example:*

```bash
sudo portlens my-api bun run index.ts

```

## Usage Guide by Environment

### Visual Studio Code (VS Code)

1. Open your project folder.
2. Open the integrated terminal (`Ctrl + ` `).
3. **Windows**: Ensure VS Code is running as **Administrator**, or select "Command Prompt" from the terminal dropdown.
4. **macOS/Linux**: Use `sudo portlens`.

### Bash / Zsh (Linux & macOS)

1. Navigate to your project root: `cd path/to/project`.
2. Run `sudo portlens`.
3. Keep the terminal window open to maintain the proxy.

### Windows (Command Prompt / PowerShell)

1. Open PowerShell or Cmd as **Administrator**.
2. Navigate to your project folder.
3. Run `portlens`.

## Troubleshooting: The Doctor Command

If the URL won't load or you receive permission errors, run the diagnostic tool:

```bash
portlens doctor

```

The Doctor performs diagnostics to identify environment conflicts. If Port **80** is occupied by another process (Docker, Skype, IIS), it offers an **Auto-Repair**:

* **Identify**: Displays the Process Name and PID holding the port.
* **Repair**: Prompts for permission to terminate the conflicting process to free up the port immediately.

## Advanced Configuration

You can fine-tune Portlens by creating a `portlens.json` or `routes.json` file in your project root.

```json
{
  "name": "checkout",
  "suffix": ".test",
  "targetPort": 4500
}

```

### Configuration Fields

| Field | Description | Default |
| --- | --- | --- |
| `name` | The subdomain prefix to use. | Folder name or `package.json` name |
| `suffix` | The domain suffix (e.g., `.localhost`, `.test`, `.demo`). | `.localhost` |
| `targetPort` | Force a specific internal port for your dev server. | Automated (–) |

## Known Gotchas

1. **Port 80 Conflict**: Portlens lives on Port **80**. If Docker Desktop, Skype, or Nginx is running, they may occupy this port. Use `portlens doctor` to identify conflicts.
2. **Browser HSTS**: If you previously accessed a domain over HTTPS, your browser may force an HTTPS redirect. Clear your browser's HSTS cache if you see privacy errors.
3. **VPNs & DNS**: Corporate VPNs or iCloud Private Relay can interfere with `hosts` file resolution. Disable them temporarily if the domain won't resolve.
4. **Windows Execution Policy**: Always run your terminal as Administrator on Windows for reliable `hosts` file writing.
5. **Loopback Limitations**: Portlens defaults to `127.0.0.1`. Ensure your framework is not configured to block local loopback connections.

## Contributing

1. **Bug Reports**: Run `portlens doctor` and include the output in your issue.
2. **Development**:
* Clone the repo.
* Run `npm install`.
* Run `npm test` to execute the integration suite (uses Port **0** to avoid conflicts).



---

**Timothy T. Joe** | [GitHub](https://github.com/timtjoe) | [Twitter/X](https://x.com/trillionware)

```