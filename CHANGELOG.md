# Changelog

## 0.2.0 — 2026-05-11

Initial release. Feature parity with `neptrack_core` (Dart SDK) v0.2.0.

### Added
- `NeptrackClient` — typed REST client covering vehicles, vehicle detail,
  history, reports, alarms, motion logs, geofences, and engine commands.
- `NeptrackStreamClient` — Socket.IO v2 client for the real-time Data
  Stream API. Emits `position`, `alarm`, `motion`, `connect`, `disconnect`,
  and `error` events.
- TypeScript types for every model and event payload.
- Dual ESM + CommonJS build with `.d.ts` declarations.
