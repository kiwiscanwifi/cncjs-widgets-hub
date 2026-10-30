# Changelog - Terminal

All notable changes to the Terminal widget are documented in this file.

## [1.2.3] - 2026-10-30
### Changed
- **4-Column Compact Visibility Matrix**: Split the combined feature/description cell into separate `Feature` and `Description` columns with concise, single-line text (all <= 31 characters).
- **Reduced Settings Modal Height**: Reduced `settingsHeight` from 540px to 450px (-17% vertical footprint), eliminating vertical scrollbars and ensuring full compatibility with compact touchscreens and 720p displays.

## [1.2.2] - 2026-10-30
### Changed
- **DOM Container ID & Attribute Standardization**: Harmonized tab attributes and element IDs across all 8 tabs to establish exact 1:1 symmetry (`#tab-logging` / `data-tab="logging"`, `#tab-terminal` / `data-tab="terminal"`).

## [1.2.1] - 2026-10-30
### Changed
- **Consolidated Logging & Stream Filters into Unified 'Logging' Tab**: Merged server command logging and automatic stream noise filters into Tab 1 (`Logging`).
- **Optimal 8-Tab Layout**: Reduced total settings tabs from 9 to 8 (`Logging`, `Blacklist`, `Regex`, `Buttons`, `Visibility`, `Controls`, `Terminal`, `Changelog`), guaranteeing all tabs including **`Changelog`** fit within the modal header with zero horizontal overflow or clipping.

## [1.2.0] - 2026-10-30
### Added
- **Settings Tab Modularization**: Modularized terminal configuration into 9 clean tabs (`Noise`, `Blacklist`, `Regex`, `Buttons`, `Visibility`, `Logging`, `Controls`, `Terminal`, `Changelog`).
- **Dedicated Visibility Tab**: Full Display Visibility Matrix managing independent widget view and fullscreen view toggles across 10 terminal UI elements with quick presets.
- **Dedicated Logging Tab**: Continuous server-side command logging configuration (`widgets/terminal/logs/commands.log`), scope filtering, OS `logrotate` governance status, live log preview, direct download, and one-click log clear.
- **Dedicated Controls Tab**: Console ergonomics and safety guardrails including auto-uppercase G-code, retain input, confirmation guardrail on dangerous commands (`$RST=*`, `$$`, `M502`, `G92.1`), Web Audio chime on Alarm/Error, auto-clear on connect, line numbers, and arrow up/down history depth.
- **Dedicated Terminal Tab**: Focused exclusively on Theme, Typography & Dimensions (Workspace height with quick presets, dark/matrix/light themes, monospace font families, font size, scrollback buffer limit, and timestamp formats).
- **Macro Buttons Dynamic Wrapping & CRUD**: Multi-line wrapping flex layout for macro quick buttons, color swatches, order resequencing, and comprehensive CRUD management.

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
