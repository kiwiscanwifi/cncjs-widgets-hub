# Changelog - Widget Hub

All notable changes to the Widget Hub are documented in this file.

## [1.2.0] - 2026-10-31
### Added
- **Workspace Sync & Profiles**: Added server-backed save and restore for complete workspace layout (`cnc`), widget order, sizes, titles, installed extension widgets, and settings directly under Widget Hub Settings.
- **Cross-Device Zero-File Sync**: Added 1-click `[⚡ Push Current Layout as Default]` and `[⚡ Pull Server Default]` allowing instant layout replication between computers, tablets, and phones without JSON file exports/imports.
- **Multi-Profile Management**: Save and browse multiple device profiles (e.g. Master Desktop, Workshop Tablet) stored centrally on `linuxcnc.local` (`widgets/widget-hub/workspace_profiles.json`).
- **Credential Protection**: Automatic preservation of local session tokens during workspace restoration to prevent accidental logouts across devices.
- **Native Settings Page**: Added dedicated settings modal (`widget-hub/settings.html`) adhering strictly to `/widgets/common/settings-common.css`.
- **Global Theme Engine**: Added Dark (fireCNC default), Light (Shopfloor high-contrast), and Auto (OS/system) color themes across all widgets.
- **Title Bar Controls Governance**: Matrix to dynamically toggle Refresh, Settings, Fullscreen, Collapse, and Hide Entire Header per widget.
- **Catalog Customization**: Toggle to hide/show "Changelog" buttons on catalog cards, and customize Widget Hub title.
- **Zero-Reload Live Synchronization**: Immediate live state propagation via `BroadcastChannel('cncjs:widgets')` and host header classes.
- **Author**: Mark Dyer @ fireCNC.

## [1.1.0] - 2026-10-27
### Upgrades
- **Widget Lifecycle Management**: Added **🗑️ Uninstall / Deactivate** action with confirmation modal.
- **Enable / Re-activate**: Added one-click toggle to re-enable deactivated widgets.
- **Inline Changelog Reader**: Integrated markdown reader inside the widget with back button navigation.
- **Touch Probe Integration**: Added Touch Probe Status (M119 & G38.2) to the widget manager catalog.
- **Author**: Mark Dyer @ fireCNC.

## [1.0.0] - 2026-10-27
### Initial Release
- **Widget Hub Interface**: Dashboard catalog to view installed widgets, version numbers, and changelogs.
- **Contract Verification**: widget.json standard schema check (cncjs_widget_version: 1.0).
- **Clean Dedicated Alias**: Accessible directly via /widgetmgr/.
- **Author**: Mark Dyer @ fireCNC.
