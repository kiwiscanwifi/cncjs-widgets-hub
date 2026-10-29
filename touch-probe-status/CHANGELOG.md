# Changelog - Touch Probe Status & Probe Cycle

All notable changes to the Touch Probe Widget are documented in this file.

## [1.1.0] - 2026-10-27
### Upgrades
- **Widget Hub Integration**: Converted to native contract widget for the CNCjs Widget Hub catalog (`cncjs_widget_version: 1.0`).
- **Cross-Widget Event Bus**: Emits real-time `probe:state` (`CLOSED` / `OPEN`) over `BroadcastChannel('cncjs:widgets')` for active safety interlocks.
- **Author Attribution**: Updated to Mark Dyer @ fireCNC.

## [1.0.0] - 2026-10-18
### Initial Release
- **Real-Time Continuity Monitor**: High-frequency M119 pin polling with visual LED and status label.
- **Safety Pre-Check**: Disallows probe travel if the touch plate is already in contact with the bit.
- **Test Probe Z Cycle**: Safe 50mm downward search at 80mm/min with G38.2 and G90 recovery.
- **Emergency Halt**: Instant Feed Hold & M112 stop button.
