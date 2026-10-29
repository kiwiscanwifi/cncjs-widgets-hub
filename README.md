# CNCjs Widget Hub & Native Extension Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CNCjs Compatible](https://img.shields.io/badge/CNCjs-1.9.0%2B-blue.svg)](https://github.com/cncjs/cncjs)
[![Air--Gapped Ready](https://img.shields.io/badge/Air--Gapped-100%25%20Offline-green.svg)]()

A modular, zero-dependency, drop-in extension ecosystem and widget manager for [CNCjs](https://github.com/cncjs/cncjs). Provides hot-loading, zero-latency auto-resizing, real-time workspace synchronization, and built-in tactile CNC machine control extensions.

---

## ⚡ 1-Line Turnkey Installation

Run this single command on your CNCjs host machine (LinuxCNC, Raspberry Pi, Debian/Ubuntu):

```bash
curl -sSL https://raw.githubusercontent.com/kiwiscanwifi/cncjs-widgets-hub/main/install.sh | bash
```

The installer automatically:
1. Clones the repository to `~/widgets`.
2. Registers `/widgets` into `~/.cncrc` native mount points.
3. Injects the universal extension loader into `index.hbs`.
4. Restarts `cncjs` with zero manual configuration.

---

## 📦 Bundled Extensions

| Widget | ID | Category | Description |
| :--- | :---: | :---: | :--- |
| **Widget Hub** | `widget-hub` | Hub | Extension catalog, 1-click install/uninstall, and real-time workspace synchronization. |
| **Potentiometer** | `potentiometer` | Controls | Tactile Feed Rate & Spindle RPM override dials with Makita RT0700C speed dial mapping. |
| **Touch Probe Status** | `touch-probe-status` | Probing | Real-time electrical continuity status (M119) and single-click 50mm safe Z probe cycle. |
| **System Manager** | `system-manager` | System | Host power management (Reboot, Shutdown, CNCjs restart, Sync) with active-cut interlock. |
| **Surfacing** | `surfacing` | CAM & Generation | Interactive spoilboard and stock surfacing toolpath generator with live G-code export. |

---

## 🚀 Key Architectural Highlights

- **0ms Synchronous Auto-Resizing**: Eliminates iframe lag and clipping via direct `window.frameElement` sizing and capture-phase message isolation.
- **Cross-Widget Isolation**: Prevents CNCjs global PubSub broadcast bleed where sibling widgets corrupt each other's height.
- **Air-Gapped & 100% Offline**: Zero external CDN calls (`cdnjs`, Google Fonts). Runs flawlessly in isolated machine workshops.
- **Single Mount Invariant**: All extensions, assets, and catalog registries are served uniformly under `/widgets/*`.
- **Shared Socket Bridge**: All custom widgets share a single WebSocket connection via `window.parent.CNCjsHooks.getSocket()`, eliminating redundant connection overhead.

---

---

## 🎨 3-Tier Styling Framework & Governance

All widgets share a unified, zero-inline-style CSS architecture with HTTP memory caching and native styling:

1. **Title Bar Controls Governance**: Declarative control in `widget.json` (`"header": { "showFork": false, ... }`) hides unwanted dropdown actions (like "Fork Widget" for singleton hardware tools) or suppresses entire headers for edge-to-edge touch panels.
2. **Workspace View (`/widgets/common/widget-framework.css`)**: Dark mode CNC design tokens and component classes (`.cnc-panel`, `.cnc-row`, `.cnc-btn`, `.cnc-led`, `.cnc-dro`, `.cnc-code-box`).
3. **Edit Module (`/widgets/common/settings-common.css`)**: Native CNCjs light modal styling (`.nav-tabs-wrapper`, `.panel-well`, `.form-grid-2`, `.form-control`, `.help-block`).

👉 Read the comprehensive [Widget Styling & Header Governance Guide](docs/STYLING_GUIDE.md) for full class references, design tokens, and copy-paste boilerplates.

## 🛠️ Developing Custom Widgets

Create your own custom widgets using the provided developer starter kit:

```bash
cd ~/widgets
cp -r template/ my-widget/
```

Check out the [Starter Template Guide](template/README.md) for boilerplate code, socket bindings, and settings modal integration.

---

## 📄 License

Released under the [MIT License](LICENSE).
