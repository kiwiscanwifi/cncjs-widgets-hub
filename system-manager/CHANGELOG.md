# System Manager Changelog

### v1.1.0 (2026-10-28)
- **Native CNCjs Settings Modal**:
  - Implemented `/widgets/system-manager/settings.html` conforming to native CNCjs dialog layout and style standards.
  - Added button selection checkboxes to show/hide specific system action controls.
  - Added display reordering controls (**▲ Up** and **▼ Down**) to customize the button sequence in the widget.
  - Added custom widget display title configuration (e.g. rename to "Power & System" or "Host Controls").
  - Added layout column configuration (2 Columns compact grid vs 1 Column vertical stack).
  - Added live status bar toggle.
- **UI Streamlining**:
  - Removed redundant internal widget title header (the CNCjs container already provides the title bar).
  - Removed top-right "CNC IDLE" badge (status is already visible across CNCjs).
  - Maintained background active-cut safety interlock (`workflow.state === 'running'`) with safety status bar alert.
- **Real-Time Synchronization**:
  - Added `BroadcastChannel('cncjs:widgets')` listener for instantaneous reconfiguration without page reload.
  - Integrated with native modal `getCustomTitle()` hook for live title bar updates.

### v1.0.0 (2026-10-26)
- Initial release of CNCjs System Manager widget.
- Support for host power controls: Reboot OS, Shutdown OS, Restart CNCjs daemon, and Sync Disk.
- Active-cut interlock disabling destructive actions during live G-code execution.
- 2-step tap confirmation safety timers for Reboot and Shutdown.
