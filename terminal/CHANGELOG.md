# Changelog - Terminal

All notable changes to the Terminal widget are documented in this file.

## [1.1.0] - 2026-10-30
### Added
- **Configurable Workspace Height**: Users can now configure custom widget height (default 300px, matching the native CNCjs console) with quick presets (Compact 220px, Default 300px, Medium 420px, Tall 550px).
- Dynamic live height resizing and parent iframe synchronization without page reload.
### Changed
- Renamed widget, routes, and identifiers from Controller Console to **Terminal** (`/widgets/terminal/`).
- Streamlined settings modal and title bar integrations.

## [1.0.0] - 2026-10-30
### Added
- Initial release of the Intelligent Terminal for CNCjs.
- Real-time traffic monitoring over Socket.io (`serialport:read` and `serialport:write`).
- Noise suppression engine with granular toggles (`M119`, status queries, `ok`, empty lines).
- Customizable prefix blacklist and regular expression filtering.
- Full-screen terminal overlay with auto-scroll lock, pause/resume, and fast filter searching.
- Interactive G-code command bar with history navigation (Up/Down arrow keys) and quick macro chips (`$$`, `$I`, `?`, `M119`, `$#`, `$G`).
- Zero-reload configuration synchronization via `BroadcastChannel('cncjs:widgets')`.
