# Changelog - Widget Hub

All notable changes to the Widget Hub are documented in this file.

## [1.2.0] - 2026-10-30
### Added
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
