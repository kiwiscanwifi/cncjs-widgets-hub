# Changelog - Potentiometer

All notable changes to the Potentiometer widget are documented in this file.

## [1.2.0] - 2026-10-27
### Added
- **Absolute Guardrails**: Configurable min/max limits in `mm/min` (100–5,000) and `RPM` (10,000–30,000) instead of unitless percentages.
- **Dynamic Arc Travel**: SVG circular progress arcs now dynamically map to the configured minimum and maximum limits.
- **Makita RT0700C Dial Mapping**: Speed dial calculations with 0.5 half-step precision (1.0 to 6.0).
- **Synchronized Dial Illumination**: Dial badge background dynamically matches the spindle rotary arc color across speed zones (Green $\le$ 20k, Amber $>$ 20k, Orange $>$ 22k, Red $>$ 27k).
- **Responsive 2-Column Mode**: Step buttons expand to 50%/50% width when 100% reset is hidden.
- **Cross-Widget Event Bus**: Emits `potentiometer:state` on `BroadcastChannel('cncjs:widgets')` for inter-widget integration.

### Fixed
- **Smoothieware Telemetry Sync**: Prioritized `status.ovF` and `status.ovS` over static `status.feedrateOverride` to prevent 4-second value reversion.

## [1.1.0] - 2026-10-26
### Added
- **Server Persistence**: Direct synchronization to `/api/watch/file` (`nc_files/pot/potentiometer.config`) for cross-browser and power-cycle persistence.

## [1.0.0] - 2026-10-25
### Initial Release
- Dual rotary potentiometer dials for Feed Rate and Spindle RPM override.
- Quick step buttons (`-10%`, `100%`, `+10%`).
