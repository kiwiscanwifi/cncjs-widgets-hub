# Surfacing Widget Changelog

## [1.1.0] - 2026-10-30
### Added
- **Native Settings Modal**: Dedicated settings page (`surfacing/settings.html`) with UI visibility options, custom CNC limits override, and default CAM parameters.
- **UI Visibility Governance**: Toggles to show/hide the G-Code Preview button, status message bar, saved presets bar, statistics summary, and machine profile badge.
- **CNC Limits Override**: Manual machine dimensions override allowing custom X Max and Y Max travels to override auto-discovery.
- **CAM Defaults**: Configurable default tool diameter, stepover, feed rate, and cutting direction.
- **Live Sync**: Zero-reload synchronization via `BroadcastChannel('cncjs:widgets')`.

## [1.0.0] - 2026-10-28
### Added
- Interactive toolpath generation for spoilboard facing and stock flattening.
- Shared native Socket.io connection support.
- Unified directory structure under `/home/linuxcnc/widgets/surfacing`.
