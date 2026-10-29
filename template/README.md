# Custom Widget Starter Template

This template provides a boilerplate for creating high-performance CNCjs custom widgets compatible with the **CNCjs Widget Hub**.

## Features Included:
- **0ms Synchronous Auto-Resizing**: Direct `window.frameElement` and capture-isolated resize support.
- **Shared Socket Integration**: Re-uses the primary CNCjs WebSocket connection via `window.parent.CNCjsHooks.getSocket()`.
- **Dark-Mode UI**: Native dark palette matching CNCjs standard look and feel.
- **Settings Modal**: Pre-wired modal styling and `window.parent.CNCjsCloseModal()` support.

## Getting Started:
1. Copy this folder to a new widget name: `cp -r template/ my-widget/`
2. Update `widget.json` with your widget ID, name, author, and description.
3. Edit `index.html` to build your UI and handle controller events.
4. Test in CNCjs or install via Widget Hub!
