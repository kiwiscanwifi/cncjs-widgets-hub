# CNCjs Widget CSS Framework & Styling Guide

An authoritative guide to designing, styling, and formatting native extensions and settings modules for the **CNCjs Widget Hub**.

---

## 🏛️ 3-Tier Widget Architecture

Every extension built for the CNCjs Widget Hub operates across three interconnected UI layers:

| Layer | Runtime Location | Theme | Stylesheet |
| :--- | :--- | :--- | :--- |
| **Tier 1: Title Bar** | CNCjs Main Host Header | Dark Core (`#222`) | Managed by `widget.json` & `CNCjsHooks` |
| **Tier 2: Workspace View** | Live Grid Iframe (`index.html`) | Dark Palette (`#181818`) | `/widgets/common/widget-framework.css` |
| **Tier 3: Edit Module** | Modal Dialog Iframe (`settings.html`) | Native Light (`#f5f5f5`) | `/widgets/common/settings-common.css` |

---

## 🎨 Tier 1: Title Bar Controls Governance

CNCjs widgets inherit a top title bar with controls. You control which icons and actions appear via `widget.json`:

```json
{
  "id": "mywidget",
  "name": "My Custom Widget",
  "entry": "index.html",
  "settings": "settings.html",
  "header": {
    "showRefresh": true,
    "showSettings": true,
    "showCollapse": true,
    "showDropdown": true,
    "showFullscreen": false,
    "showFork": false,
    "showRemove": true,
    "hideHeader": false
  }
}
```

### Title Bar Governance Rules:
1. **Fork Widget (`fa-code-fork`)**: Disabled by default (`"showFork": false`) for singleton hardware widgets (e.g. Probe, Potentiometer, Power Manager) to avoid confusing duplicate instances.
2. **Settings Icon (`fa-cog` ⚙️)**: Visible automatically if and only if `"settings": "settings.html"` is declared in `widget.json`.
3. **Edge-to-Edge Panels (`hideHeader: true`)**: Hides the 34px top bar completely, giving your widget full vertical area for touch interfaces or DRO ribbons.

---

## 🖤 Tier 2: Workspace View (Dark Theme)

Workspace widgets embed inside the live CNCjs dashboard. Link the framework in `index.html`:

```html
<link rel="stylesheet" href="/widgets/common/widget-framework.css?v=1.2.0">
```

### Design Tokens
| Variable | Hex Value | Semantic Usage |
| :--- | :---: | :--- |
| `--cnc-bg-canvas` | `#121212` | Main page background |
| `--cnc-bg-card` | `#181818` | Widget card container background |
| `--cnc-bg-surface` | `#222222` | Buttons, inputs, and raised surfaces |
| `--cnc-bg-hover` | `#2c2c2c` | Interactive hover state |
| `--cnc-border` | `#333333` | Standard element border |
| `--cnc-border-subtle` | `#262626` | Card separators and subtle borders |
| `--cnc-color-blue` | `#3498db` | Primary action buttons and focus outlines |
| `--cnc-color-green` | `#2ecc71` | Active continuity, success badges, live status |
| `--cnc-color-red` | `#e74c3c` | Emergency stop, error state, dangerous actions |
| `--cnc-color-yellow` | `#ffa502` | Warning state, interlock overrides |

### Component Class Catalog
- **Containers**:
  - `.cnc-panel`: Standard vertical stack (`display: flex; flex-direction: column; gap: 6px;`)
  - `.cnc-card`: Elevated dark card with border and rounded corners
  - `.cnc-row`: Horizontal flex aligned center with 6px gap
  - `.cnc-row-between`: Horizontal flex with space-between alignment
  - `.cnc-grid-2`: 2-column grid (`gap: 8px`)
  - `.cnc-grid-4`: 4-column responsive action grid
- **Tactile Buttons**:
  - `.cnc-btn`: Base tactile button with click scale micro-animation
  - `.cnc-btn-primary`: Vibrant action blue
  - `.cnc-btn-danger`: Emergency stop / halt motion red
  - `.cnc-btn-success`: Confirm / run green
  - `.cnc-btn-sm`: Compact 10px utility button
  - `.cnc-btn-block`: Full-width expanding button
- **Status & Telemetry**:
  - `.cnc-led`: 14px circular status LED indicator
  - `.cnc-led-active` / `.cnc-led-inactive`: Green glowing vs dark slate states
  - `.cnc-status-pill`: Upper-case bold status badge
  - `.cnc-dro`: Monospace coordinate display (Consolas, 10px)
  - `.cnc-telemetry`: Single-line status readout with auto-ellipsis
  - `.cnc-code-box`: Preformatted dark code snippet box

---

## 🤍 Tier 3: Edit Settings Module (Native Light Theme)

When a technician clicks ⚙️ on the title bar, CNCjs opens its native modal dialog. To ensure a seamless look, settings modules use the **TrendMicro / Bootstrap light theme (`#f5f5f5`)**. Link the stylesheet in `settings.html`:

```html
<link rel="stylesheet" href="/widgets/common/settings-common.css?v=1.2.0">
```

### Edit Module Class Catalog
- **Tabs**:
  - `.nav-tabs-wrapper`: Full-width edge-to-edge tab bar
  - `.nav-tabs`: Tab list
  - `.tab-btn`: Tab button (active tab gets `#0096cc` blue indicator)
  - `.tab-pane-container`: Content container
  - `.tab-content`: Tab body (toggled with `.active`)
- **Panels & Fields**:
  - `.panel-well`: Crisp white card (`#ffffff`) with subtle border
  - `.panel-heading-title`: Section title (13px bold)
  - `.panel-subtitle`: Explanatory helper text
  - `.form-row`: Single input row
  - `.form-grid-2`: 2-column form grid
  - `.form-control`: Native white input with blue focus ring
  - `.help-block`: Helper note below an input field
  - `.range-slider`: Dual min/max adjustment slider
  - `.save-toast`: Ambient "Saved ✓" confirmation toast

### Edit Module Lifecycle Hooks
Every `settings.html` must implement these global methods:

```javascript
// Invoked when user clicks native [Save Changes] button in modal footer
window.saveSettings = function() {
    const minVal = document.getElementById('numMin').value;
    localStorage.setItem('mywidget_config', JSON.stringify({ minVal }));
    showToast('Saved ✓');
    
    // Broadcast config update to live widget in workspace
    if (window.parent.CNCjsWidgetBus) {
        window.parent.CNCjsWidgetBus.postMessage({
            origin: 'settings',
            action: 'configReload',
            widgetId: 'mywidget'
        });
    }
};

// Return a custom title if you want settings to rename the widget dynamically
window.getCustomTitle = function() {
    const input = document.getElementById('inputTitle');
    return input ? input.value.trim() : null;
};
```

---

## 📋 Copy-Paste Production Boilerplates

### Pattern 1: Sensor & Interlock Widget (`index.html`)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Interlock Widget</title>
    <link rel="stylesheet" href="/widgets/common/widget-framework.css?v=1.2.0">
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="cnc-panel">
        <div class="cnc-row cnc-row-between cnc-card">
            <div class="cnc-row">
                <div id="status-led" class="cnc-led cnc-led-inactive"></div>
                <span id="status-text" class="cnc-status-pill">OPEN (CLEAR)</span>
            </div>
            <div id="dro-text" class="cnc-dro">Z: 0.00 mm</div>
        </div>

        <div class="cnc-row">
            <button id="btn-test" class="cnc-btn cnc-btn-primary cnc-btn-block">▶ Start Cycle</button>
            <button id="btn-stop" class="cnc-btn cnc-btn-danger">■ STOP</button>
        </div>

        <div id="msg" class="cnc-telemetry cnc-text-right">Connected to machine</div>
    </div>

    <script>
    (function() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || '';

        // 0ms Synchronous Auto-Sizing
        function updateHeight() {
            const h = document.body.scrollHeight || 86;
            if (window.frameElement) window.frameElement.style.height = h + 'px';
            window.parent.postMessage({
                token: token,
                action: { type: 'resize', payload: { height: h, scrollHeight: h } }
            }, '*');
        }
        window.addEventListener('load', updateHeight);
        if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateHeight).observe(document.body);
    })();
    </script>
</body>
</html>
```

### Pattern 2: Tabbed Edit Settings Dialog (`settings.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Widget Settings</title>
    <link rel="stylesheet" href="/widgets/common/settings-common.css?v=1.2.0">
</head>
<body>
    <div id="saveToast" class="save-toast">Saved ✓</div>

    <div class="nav-tabs-wrapper">
        <ul class="nav-tabs">
            <li class="active"><button type="button" class="tab-btn" data-tab="general">General</button></li>
            <li><button type="button" class="tab-btn" data-tab="advanced">Advanced</button></li>
        </ul>
    </div>

    <div class="tab-pane-container">
        <div class="tab-content active" id="tab-general">
            <div class="panel-well">
                <div class="panel-heading-title">General Settings</div>
                <div class="form-row">
                    <label>Widget Display Title</label>
                    <input type="text" class="form-control" id="inputTitle" value="My Widget">
                    <div class="help-block">Custom title shown in CNCjs workspace title bar.</div>
                </div>
            </div>
        </div>
    </div>

    <script>
    window.saveSettings = function() {
        const title = document.getElementById('inputTitle').value;
        localStorage.setItem('mywidget_title', title);
        document.getElementById('saveToast').classList.add('show');
        setTimeout(() => document.getElementById('saveToast').classList.remove('show'), 1500);
    };

    window.getCustomTitle = function() {
        return document.getElementById('inputTitle').value.trim();
    };
    </script>
</body>
</html>
```
